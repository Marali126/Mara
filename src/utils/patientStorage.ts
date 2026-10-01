import { PerfilAluno, SessaoTreino } from '../types';
import { PERFIL_ALUNO_PADRAO, SESSOES_PADRAO } from '../data/defaultSessions';

export interface RegistroPaciente {
  id: string;
  nome: string;
  perfil: PerfilAluno;
  sessoes: SessaoTreino[];
  ultimaModificacao: string;
}

const STORAGE_KEY_DB = 'fluencia_pacientes_db';
const STORAGE_KEY_ATIVO = 'fluencia_paciente_ativo_id';

export function normalizarIdPaciente(nome: string): string {
  const limpo = nome
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  return limpo || 'paciente_sem_nome';
}

export function criarPerfilVazio(nome: string = '', avaliadorPadrao: string = ''): PerfilAluno {
  const hoje = new Date().toLocaleDateString('pt-BR');
  return {
    nome: nome.trim(),
    anoEscolar: '',
    escola: '',
    avaliador: avaliadorPadrao || 'Fga. Avaliadora',
    dataInicio: hoje,
    dataAvaliacao: hoje,
    metaPPM: 110,
    observacoesGerais: ''
  };
}

export function carregarBancoPacientes(): Record<string, RegistroPaciente> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DB);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        return parsed;
      }
    }

    // Migração de dados anteriores (se existirem) ou inicialização padrão com Lucas Silveira Mendes
    let perfilInicial = PERFIL_ALUNO_PADRAO;
    let sessoesIniciais = SESSOES_PADRAO;

    try {
      const rawPerfil = localStorage.getItem('fluencia_perfil_aluno');
      if (rawPerfil) perfilInicial = JSON.parse(rawPerfil);
      const rawSess = localStorage.getItem('fluencia_sessoes_treino');
      if (rawSess) sessoesIniciais = JSON.parse(rawSess);
    } catch {}

    const idInicial = normalizarIdPaciente(perfilInicial.nome || 'Lucas Silveira Mendes');
    const dbInicial: Record<string, RegistroPaciente> = {
      [idInicial]: {
        id: idInicial,
        nome: perfilInicial.nome || 'Lucas Silveira Mendes',
        perfil: perfilInicial,
        sessoes: sessoesIniciais,
        ultimaModificacao: new Date().toISOString()
      }
    };

    localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(dbInicial));
    localStorage.setItem(STORAGE_KEY_ATIVO, idInicial);
    return dbInicial;
  } catch (err) {
    console.warn('Erro ao carregar banco de pacientes:', err);
    return {};
  }
}

export function salvarBancoPacientes(db: Record<string, RegistroPaciente>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(db));
  } catch (err) {
    console.warn('Erro ao salvar banco de pacientes:', err);
  }
}

export function obterIdPacienteAtivo(): string {
  if (typeof window === 'undefined') return 'lucas_silveira_mendes';
  try {
    const id = localStorage.getItem(STORAGE_KEY_ATIVO);
    if (id) return id;
    const db = carregarBancoPacientes();
    const primeiro = Object.keys(db)[0];
    return primeiro || 'lucas_silveira_mendes';
  } catch {
    return 'lucas_silveira_mendes';
  }
}

export function definirIdPacienteAtivo(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ATIVO, id);
  } catch {}
}

export function obterDadosPacienteAtual(): {
  id: string;
  perfil: PerfilAluno;
  sessoes: SessaoTreino[];
  todosPacientes: RegistroPaciente[];
} {
  const db = carregarBancoPacientes();
  const ativoId = obterIdPacienteAtivo();

  let registro = db[ativoId];
  if (!registro) {
    const ids = Object.keys(db);
    if (ids.length > 0) {
      registro = db[ids[0]];
      definirIdPacienteAtivo(registro.id);
    } else {
      const novo = criarPerfilVazio('Novo Paciente');
      const id = normalizarIdPaciente(novo.nome);
      registro = {
        id,
        nome: novo.nome,
        perfil: novo,
        sessoes: [],
        ultimaModificacao: new Date().toISOString()
      };
      db[id] = registro;
      salvarBancoPacientes(db);
      definirIdPacienteAtivo(id);
    }
  }

  const todosPacientes = Object.values(db).sort((a, b) =>
    (b.ultimaModificacao || '').localeCompare(a.ultimaModificacao || '')
  );

  return {
    id: registro.id,
    perfil: registro.perfil,
    sessoes: registro.sessoes,
    todosPacientes
  };
}

/**
 * Cria um novo paciente com 0 sessões (relatório zerado) e o torna ativo
 */
export function iniciarNovoPaciente(
  nome: string = '',
  avaliadorPadrao: string = ''
): {
  id: string;
  perfil: PerfilAluno;
  sessoes: SessaoTreino[];
  db: Record<string, RegistroPaciente>;
} {
  const db = carregarBancoPacientes();
  const nomeFinal = nome.trim() || `Novo Paciente ${Object.keys(db).length + 1}`;
  let id = normalizarIdPaciente(nomeFinal);

  // Garante unicidade do ID se já existir
  if (db[id]) {
    id = `${id}_${Date.now().toString().slice(-4)}`;
  }

  const novoPerfil = criarPerfilVazio(nomeFinal, avaliadorPadrao);
  const novoRegistro: RegistroPaciente = {
    id,
    nome: novoPerfil.nome,
    perfil: novoPerfil,
    sessoes: [], // TOTALMENTE ZERADO!
    ultimaModificacao: new Date().toISOString()
  };

  db[id] = novoRegistro;
  salvarBancoPacientes(db);
  definirIdPacienteAtivo(id);

  return {
    id,
    perfil: novoRegistro.perfil,
    sessoes: [],
    db
  };
}

/**
 * Zera todas as sessões do paciente especificado (mantendo os dados cadastrais)
 */
export function zerarSessoesDoPaciente(id: string): {
  perfil: PerfilAluno;
  sessoes: SessaoTreino[];
  db: Record<string, RegistroPaciente>;
} {
  const db = carregarBancoPacientes();
  const registro = db[id];
  if (registro) {
    registro.sessoes = []; // ZERADO!
    registro.ultimaModificacao = new Date().toISOString();
    db[id] = registro;
    salvarBancoPacientes(db);
    return { perfil: registro.perfil, sessoes: [], db };
  }
  return { perfil: criarPerfilVazio('Paciente'), sessoes: [], db };
}

/**
 * Ao digitar ou selecionar outro nome:
 * - Se o paciente já existe, carrega seus dados e sessões específicas
 * - Se for um novo nome não cadastrado, CRIA UM NOVO PACIENTE COM 0 SESSÕES (ZERA O HISTÓRICO!)
 */
export function alternarOuCriarPacientePorNome(
  nomeDigitado: string,
  pacienteAtualId: string,
  avaliadorPadrao: string = ''
): {
  id: string;
  perfil: PerfilAluno;
  sessoes: SessaoTreino[];
  db: Record<string, RegistroPaciente>;
  foiCriadoNovo: boolean;
} {
  const db = carregarBancoPacientes();
  const nomeLimpo = nomeDigitado.trim();
  if (!nomeLimpo) {
    const atual = db[pacienteAtualId];
    return {
      id: pacienteAtualId,
      perfil: atual ? atual.perfil : criarPerfilVazio(),
      sessoes: atual ? atual.sessoes : [],
      db,
      foiCriadoNovo: false
    };
  }

  const idDigitado = normalizarIdPaciente(nomeLimpo);

  // 1. Se já for o paciente atual, apenas atualiza o nome exibido
  if (idDigitado === pacienteAtualId && db[pacienteAtualId]) {
    db[pacienteAtualId].perfil.nome = nomeLimpo;
    db[pacienteAtualId].nome = nomeLimpo;
    db[pacienteAtualId].ultimaModificacao = new Date().toISOString();
    salvarBancoPacientes(db);
    return {
      id: pacienteAtualId,
      perfil: db[pacienteAtualId].perfil,
      sessoes: db[pacienteAtualId].sessoes,
      db,
      foiCriadoNovo: false
    };
  }

  // 2. Se já existe um paciente com esse ID no banco, troca para ele
  if (db[idDigitado]) {
    definirIdPacienteAtivo(idDigitado);
    return {
      id: idDigitado,
      perfil: db[idDigitado].perfil,
      sessoes: db[idDigitado].sessoes,
      db,
      foiCriadoNovo: false
    };
  }

  // 3. Se é um nome novo: CRIA FICHA ZERADA!
  const novoPerfil = criarPerfilVazio(nomeLimpo, avaliadorPadrao);
  const novoRegistro: RegistroPaciente = {
    id: idDigitado,
    nome: nomeLimpo,
    perfil: novoPerfil,
    sessoes: [], // Histórico ZERADO para o novo paciente!
    ultimaModificacao: new Date().toISOString()
  };

  db[idDigitado] = novoRegistro;
  salvarBancoPacientes(db);
  definirIdPacienteAtivo(idDigitado);

  return {
    id: idDigitado,
    perfil: novoRegistro.perfil,
    sessoes: [],
    db,
    foiCriadoNovo: true
  };
}

/**
 * Salva atualizações cadastrais ou nova sessão para o paciente ativo
 */
export function salvarDadosPacienteAtivo(
  id: string,
  perfil: PerfilAluno,
  sessoes: SessaoTreino[]
): Record<string, RegistroPaciente> {
  const db = carregarBancoPacientes();
  if (db[id]) {
    db[id].perfil = perfil;
    db[id].nome = perfil.nome;
    db[id].sessoes = sessoes;
    db[id].ultimaModificacao = new Date().toISOString();
  } else {
    db[id] = {
      id,
      nome: perfil.nome,
      perfil,
      sessoes,
      ultimaModificacao: new Date().toISOString()
    };
  }
  salvarBancoPacientes(db);
  return db;
}

/**
 * Exclui um paciente do banco e define o próximo como ativo
 */
export function removerPacienteDoBanco(
  id: string
): {
  novoAtivoId: string;
  perfil: PerfilAluno;
  sessoes: SessaoTreino[];
  db: Record<string, RegistroPaciente>;
} {
  const db = carregarBancoPacientes();
  delete db[id];

  const restantes = Object.keys(db);
  if (restantes.length === 0) {
    const res = iniciarNovoPaciente('Novo Paciente');
    return {
      novoAtivoId: res.id,
      perfil: res.perfil,
      sessoes: res.sessoes,
      db: res.db
    };
  }

  const proximoId = restantes[0];
  definirIdPacienteAtivo(proximoId);
  salvarBancoPacientes(db);

  return {
    novoAtivoId: proximoId,
    perfil: db[proximoId].perfil,
    sessoes: db[proximoId].sessoes,
    db
  };
}
