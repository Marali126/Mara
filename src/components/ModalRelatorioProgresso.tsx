import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  X,
  User,
  School,
  Award,
  Clock,
  Zap,
  TrendingUp,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Layers,
  BookOpen,
  Eye,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { SessaoTreino, PerfilAluno, TextoFluencia } from '../types';
import { calcularEstatisticas, gerarRelatorioPDF } from '../utils/pdfReportGenerator';

interface ModalRelatorioProgressoProps {
  isOpen: boolean;
  onClose: () => void;
  perfil: PerfilAluno;
  onSalvarPerfil: (novoPerfil: PerfilAluno) => void;
  sessoes: SessaoTreino[];
  onAdicionarSessao: (sessao: SessaoTreino) => void;
  onRemoverSessao: (id: string) => void;
  onResetarSessoes: () => void;
  textoAtual: TextoFluencia;
  logoPersonalizado: string | null;
  speed: number;
}

export const ModalRelatorioProgresso: React.FC<ModalRelatorioProgressoProps> = ({
  isOpen,
  onClose,
  perfil,
  onSalvarPerfil,
  sessoes,
  onAdicionarSessao,
  onRemoverSessao,
  onResetarSessoes,
  textoAtual,
  logoPersonalizado,
  speed
}) => {
  const [abaAtiva, setAbaAtiva] = useState<'indicadores' | 'historico' | 'perfil' | 'previa'>('indicadores');
  const [perfilLocal, setPerfilLocal] = useState<PerfilAluno>(perfil);
  const [gerandoPdf, setGerandoPdf] = useState<boolean>(false);
  const [feedbackSucesso, setFeedbackSucesso] = useState<string | null>(null);

  if (!isOpen) return null;

  const stats = calcularEstatisticas(sessoes);

  const handleSalvarPerfilForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSalvarPerfil(perfilLocal);
    setFeedbackSucesso('Dados do aluno e avaliador atualizados com sucesso!');
    setTimeout(() => setFeedbackSucesso(null), 3000);
  };

  const handleDownloadPDF = () => {
    setGerandoPdf(true);
    try {
      const doc = gerarRelatorioPDF({
        perfil: perfilLocal,
        sessoes,
        logoBase64: logoPersonalizado,
        incluirAssinatura: true
      });

      const alunoSlug = (perfilLocal.nome || 'Aluno')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_');
      const dataStr = new Date().toISOString().slice(0, 10);
      const filename = `Relatorio_Fluencia_${alunoSlug}_${dataStr}.pdf`;

      doc.save(filename);
      setFeedbackSucesso(`PDF baixado com sucesso: ${filename}`);
      setTimeout(() => setFeedbackSucesso(null), 4000);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
    } finally {
      setGerandoPdf(false);
    }
  };

  const handleImprimir = () => {
    // Muda para a aba de prévia e dispara print
    setAbaAtiva('previa');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleAdicionarLeituraAtual = () => {
    const wordCount = textoAtual.text.split(/\s+/).filter(Boolean).length;
    const estPPM = Math.round(120 * speed);
    const estSegundos = Math.max(10, Math.round((wordCount / (estPPM / 60))));

    const novaSessao: SessaoTreino = {
      id: `sess-${Date.now()}`,
      dataHora: new Date().toISOString(),
      textoId: textoAtual.id,
      textoTitulo: textoAtual.title,
      nivel: textoAtual.nivel,
      flesch: textoAtual.leiturabilidade?.flesch ?? 65,
      totalPalavras: wordCount,
      tempoSegundos: estSegundos,
      velocidadePPM: estPPM,
      modo: 'modelar',
      vozUtilizada: 'Voz Selecionada',
      pausaConfigurada: 'media',
      modoDestaque: 'palavra',
      concluida: true,
      observacoes: 'Registro adicionado com base na leitura atual em tela.'
    };

    onAdicionarSessao(novaSessao);
    setFeedbackSucesso(`Sessão "${textoAtual.title}" registrada com sucesso!`);
    setTimeout(() => setFeedbackSucesso(null), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-amber-50 border-3 border-amber-600 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* CABEÇALHO DO MODAL */}
        <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 text-white p-4 sm:p-5 flex items-center justify-between gap-3 shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">Relatório de Progresso em Fluência</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/30 text-amber-200 border border-amber-400/30">
                  {sessoes.length} {sessoes.length === 1 ? 'leitura' : 'leituras'}
                </span>
              </div>
              <p className="text-xs text-amber-200/80">
                Acompanhamento de prosódia sintática, velocidade (PPM) e evolução do aluno
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={gerandoPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer border border-emerald-400/40"
              title="Baixar arquivo PDF formatado para impressão ou arquivamento"
            >
              <Download className="w-4 h-4" />
              <span>{gerandoPdf ? 'Gerando...' : 'Baixar PDF'}</span>
            </button>

            <button
              onClick={handleImprimir}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-amber-700/80 hover:bg-amber-700 text-amber-100 font-semibold text-xs rounded-xl transition-all cursor-pointer border border-amber-600/40"
              title="Visualizar e Imprimir"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-amber-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* FEEDBACK TOAST */}
        {feedbackSucesso && (
          <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2 flex items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{feedbackSucesso}</span>
            </div>
            <button
              onClick={() => setFeedbackSucesso(null)}
              className="text-white/80 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* NAVEGAÇÃO DE ABAS */}
        <div className="bg-amber-100/70 border-b border-amber-200 px-4 pt-2 flex gap-1 sm:gap-2 overflow-x-auto shrink-0">
          {[
            { id: 'indicadores', label: 'Indicadores & Desempenho', icon: Award },
            { id: 'historico', label: `Histórico (${sessoes.length})`, icon: Clock },
            { id: 'perfil', label: 'Dados do Aluno', icon: User },
            { id: 'previa', label: 'Prévia A4 do Relatório', icon: Eye }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = abaAtiva === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAbaAtiva(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer whitespace-nowrap border-t border-x ${
                  isSelected
                    ? 'bg-amber-50 text-amber-950 border-amber-300 border-b-amber-50 shadow-xs'
                    : 'bg-transparent text-stone-600 hover:text-amber-900 border-transparent hover:bg-amber-200/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-700' : 'text-stone-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* CORPO DO MODAL */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* ============================================================ */}
          {/* ABA 1: INDICADORES E DESEMPENHO */}
          {/* ============================================================ */}
          {abaAtiva === 'indicadores' && (
            <div className="space-y-4">
              {/* Card de Identificação Resumida */}
              <div className="bg-white border-2 border-amber-200 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    {perfilLocal.nome ? perfilLocal.nome.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-stone-900 leading-tight">
                      {perfilLocal.nome || 'Aluno(a) em Treinamento'}
                    </h3>
                    <p className="text-xs text-stone-600">
                      {perfilLocal.anoEscolar || 'Série não informada'} • {perfilLocal.escola || 'Instituição Escolar'}
                    </p>
                    <p className="text-[11px] text-amber-800 font-medium">
                      Avaliador(a): <strong>{perfilLocal.avaliador || 'Não informado'}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAbaAtiva('perfil')}
                    className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Editar Dados
                  </button>
                  <button
                    onClick={handleAdicionarLeituraAtual}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                    title="Adicionar o texto que está aberto na tela ao histórico"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Registrar Leitura Atual</span>
                  </button>
                </div>
              </div>

              {/* Grid de KPIs principais */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/70 border border-indigo-200 rounded-2xl p-3.5 shadow-xs">
                  <div className="flex items-center justify-between text-indigo-700 mb-1">
                    <span className="text-xs font-semibold">Sessões</span>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-indigo-950">{stats.totalSessoes}</div>
                  <div className="text-[11px] text-indigo-800/80 mt-0.5 font-medium">
                    {stats.taxaConclusao}% concluídas
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/70 border border-emerald-200 rounded-2xl p-3.5 shadow-xs">
                  <div className="flex items-center justify-between text-emerald-700 mb-1">
                    <span className="text-xs font-semibold">Total Palavras</span>
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-emerald-950">
                    {stats.totalPalavras.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-[11px] text-emerald-800/80 mt-0.5 font-medium">
                    ~{Math.round(stats.tempoTotalSegundos / 60)} min dedicados
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100/70 border border-amber-300 rounded-2xl p-3.5 shadow-xs">
                  <div className="flex items-center justify-between text-amber-700 mb-1">
                    <span className="text-xs font-semibold">Velocidade Média</span>
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-amber-950">{stats.mediaPPM} PPM</div>
                  <div className="text-[11px] text-amber-800 font-medium">
                    Meta: {perfilLocal.metaPPM} PPM ({stats.mediaPPM >= perfilLocal.metaPPM ? '✓ Atingida' : 'Em treino'})
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100/70 border border-purple-200 rounded-2xl p-3.5 shadow-xs">
                  <div className="flex items-center justify-between text-purple-700 mb-1">
                    <span className="text-xs font-semibold">Leiturabilidade</span>
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-purple-950">{stats.mediaFlesch}/100</div>
                  <div className="text-[11px] text-purple-800/80 mt-0.5 font-medium">
                    Índice Flesch médio
                  </div>
                </div>
              </div>

              {/* Distribuição por Nível Escolar */}
              <div className="bg-white border-2 border-amber-200 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-amber-700" />
                      Distribuição dos Treinos por Nível Escolar
                    </h4>
                    <p className="text-xs text-stone-500">
                      Garante que o aluno transite do patamar de conforto aos desafios graduais de fluência
                    </p>
                  </div>
                  <span className="text-xs font-bold text-amber-800">
                    {stats.totalSessoes} sessões registradas
                  </span>
                </div>

                <div className="space-y-2.5">
                  {[
                    { label: 'Muito Fácil (1º ao 2º ano)', key: 'Muito Fácil', color: 'bg-teal-500', text: 'text-teal-900' },
                    { label: 'Fácil (3º ao 4º ano)', key: 'Fácil', color: 'bg-emerald-500', text: 'text-emerald-900' },
                    { label: 'Intermediário (5º ao 6º ano)', key: 'Intermediário', color: 'bg-blue-500', text: 'text-blue-900' },
                    { label: 'Avançado (7º ao 9º ano)', key: 'Avançado', color: 'bg-purple-500', text: 'text-purple-900' },
                    { label: 'Ensino Médio', key: 'Ensino Médio', color: 'bg-rose-500', text: 'text-rose-900' }
                  ].map((niv) => {
                    const count = stats.distribuicaoNiveis[niv.key] || 0;
                    const pct = stats.totalSessoes > 0 ? Math.round((count / stats.totalSessoes) * 100) : 0;
                    return (
                      <div key={niv.key}>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-stone-700">{niv.label}</span>
                          <span className="text-stone-500">
                            {count} leitura{count !== 1 ? 's' : ''} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`${niv.color} h-2.5 rounded-full transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Botão de Destaque para Download do Relatório */}
              <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 rounded-2xl p-4 text-white flex items-center justify-between gap-3 shadow-md">
                <div>
                  <h4 className="font-bold text-sm sm:text-base">Pronto para gerar o documento oficial?</h4>
                  <p className="text-xs text-amber-100">
                    O PDF contém cabeçalho institucional, dados do aluno, quadro de métricas, tabela completa e espaço de parecer e assinatura.
                  </p>
                </div>
                <button
                  onClick={handleDownloadPDF}
                  className="px-4 py-2.5 bg-white text-amber-900 hover:bg-amber-50 active:scale-95 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer shrink-0 flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Baixar Relatório PDF</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* ABA 2: HISTÓRICO DE LEITURAS */}
          {/* ============================================================ */}
          {abaAtiva === 'historico' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">Histórico Detalhado de Sessões</h4>
                  <p className="text-xs text-stone-500">
                    Todas as leituras registradas aparecem na tabela do relatório PDF
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAdicionarLeituraAtual}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                    title="Adicionar o texto que está selecionado"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Texto Atual</span>
                  </button>

                  <button
                    onClick={onResetarSessoes}
                    className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                    title="Restaurar dados de exemplo do relatório"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Restaurar Exemplos</span>
                  </button>
                </div>
              </div>

              {sessoes.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-amber-300 rounded-2xl p-8 text-center">
                  <BookOpen className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                  <p className="text-stone-800 font-bold text-sm">Nenhuma sessão registrada no momento</p>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                    Pratique leituras no aplicativo ou clique em "Restaurar Exemplos" acima para carregar um histórico completo de demonstração.
                  </p>
                  <button
                    onClick={onResetarSessoes}
                    className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 cursor-pointer"
                  >
                    Carregar Histórico Exemplo
                  </button>
                </div>
              ) : (
                <div className="bg-white border-2 border-amber-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-amber-100/70 border-b border-amber-200 text-amber-950 font-bold">
                          <th className="p-2.5">#</th>
                          <th className="p-2.5">Data / Hora</th>
                          <th className="p-2.5">Texto</th>
                          <th className="p-2.5">Nível</th>
                          <th className="p-2.5 text-center">Palavras</th>
                          <th className="p-2.5 text-center">Tempo</th>
                          <th className="p-2.5 text-center">Velocidade</th>
                          <th className="p-2.5">Modo</th>
                          <th className="p-2.5 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-100">
                        {sessoes.map((s, idx) => {
                          const dataFmt = new Date(s.dataHora).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          });
                          return (
                            <tr key={s.id} className="hover:bg-amber-50/60 transition-colors">
                              <td className="p-2.5 text-stone-400 font-mono text-[11px]">
                                #{sessoes.length - idx}
                              </td>
                              <td className="p-2.5 text-stone-600 whitespace-nowrap">{dataFmt}</td>
                              <td className="p-2.5 font-bold text-stone-900">{s.textoTitulo}</td>
                              <td className="p-2.5">
                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                  {s.nivel}
                                </span>
                              </td>
                              <td className="p-2.5 text-center font-medium text-stone-700">
                                {s.totalPalavras}
                              </td>
                              <td className="p-2.5 text-center text-stone-600">
                                {s.tempoSegundos}s
                              </td>
                              <td className="p-2.5 text-center font-bold text-amber-800">
                                {s.velocidadePPM} PPM
                              </td>
                              <td className="p-2.5 text-stone-600">
                                {s.modo === 'modelar' ? 'Áudio/Modelar' : 'Silencioso'}
                              </td>
                              <td className="p-2.5 text-center">
                                <button
                                  onClick={() => onRemoverSessao(s.id)}
                                  className="p-1 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Remover esta sessão"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* ABA 3: DADOS DO ALUNO E AVALIADOR */}
          {/* ============================================================ */}
          {abaAtiva === 'perfil' && (
            <form onSubmit={handleSalvarPerfilForm} className="space-y-4">
              <div className="bg-white border-2 border-amber-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                <div>
                  <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                    <User className="w-4 h-4 text-amber-700" />
                    Identificação para o Cabeçalho do Relatório
                  </h4>
                  <p className="text-xs text-stone-500">
                    Estes dados são impressos na página do relatório oficial de fluência
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Nome do(a) Aluno(a):
                    </label>
                    <input
                      type="text"
                      value={perfilLocal.nome}
                      onChange={(e) => setPerfilLocal({ ...perfilLocal, nome: e.target.value })}
                      placeholder="Ex: Lucas Silveira Mendes"
                      className="w-full px-3 py-2 text-xs bg-amber-50/50 border border-amber-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Ano / Turma Escolar:
                    </label>
                    <input
                      type="text"
                      value={perfilLocal.anoEscolar}
                      onChange={(e) => setPerfilLocal({ ...perfilLocal, anoEscolar: e.target.value })}
                      placeholder="Ex: 4º Ano Fundamental A"
                      className="w-full px-3 py-2 text-xs bg-amber-50/50 border border-amber-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Escola / Clínica / Consultório:
                    </label>
                    <input
                      type="text"
                      value={perfilLocal.escola}
                      onChange={(e) => setPerfilLocal({ ...perfilLocal, escola: e.target.value })}
                      placeholder="Ex: Colégio Integrado de Ensino"
                      className="w-full px-3 py-2 text-xs bg-amber-50/50 border border-amber-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Profissional Responsável (Avaliador):
                    </label>
                    <input
                      type="text"
                      value={perfilLocal.avaliador}
                      onChange={(e) => setPerfilLocal({ ...perfilLocal, avaliador: e.target.value })}
                      placeholder="Ex: Fga. Mara Daher (CRFa 12345)"
                      className="w-full px-3 py-2 text-xs bg-amber-50/50 border border-amber-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Data de Início do Acompanhamento:
                    </label>
                    <input
                      type="text"
                      value={perfilLocal.dataInicio}
                      onChange={(e) => setPerfilLocal({ ...perfilLocal, dataInicio: e.target.value })}
                      placeholder="Ex: 01/09/2026"
                      className="w-full px-3 py-2 text-xs bg-amber-50/50 border border-amber-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Meta de Fluência Alvo (PPM):
                    </label>
                    <input
                      type="number"
                      min="40"
                      max="250"
                      value={perfilLocal.metaPPM}
                      onChange={(e) => setPerfilLocal({ ...perfilLocal, metaPPM: Number(e.target.value) })}
                      placeholder="Ex: 110"
                      className="w-full px-3 py-2 text-xs bg-amber-50/50 border border-amber-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Parecer e Observações Qualitativas do Profissional:
                  </label>
                  <textarea
                    rows={3}
                    value={perfilLocal.observacoesGerais}
                    onChange={(e) => setPerfilLocal({ ...perfilLocal, observacoesGerais: e.target.value })}
                    placeholder="Escreva pareceres sobre a prosódia, respeito às pontuações, redução de silabação ou orientações para a família e escola..."
                    className="w-full px-3 py-2 text-xs bg-amber-50/50 border border-amber-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    Este texto será adicionado à seção de Parecer Pedagógico / Clínico do relatório PDF.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-amber-200">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
                  >
                    Salvar Informações
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ============================================================ */}
          {/* ABA 4: PRÉVIA A4 DO RELATÓRIO */}
          {/* ============================================================ */}
          {abaAtiva === 'previa' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">Visualização Impressa do Relatório (A4)</h4>
                  <p className="text-xs text-stone-500">
                    Layout idêntico ao gerado em PDF para conferência visual
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadPDF}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar Arquivo PDF</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir Agora</span>
                  </button>
                </div>
              </div>

              {/* FOLHA DE RELATÓRIO ESTILO PAPEL A4 */}
              <div
                id="area-impressao-relatorio"
                className="bg-white border border-stone-300 rounded-xl p-6 sm:p-8 shadow-md text-stone-800 font-sans space-y-4 max-w-3xl mx-auto"
              >
                {/* Linha topo */}
                <div className="h-1 bg-slate-800 rounded-full" />

                {/* Cabeçalho */}
                <div className="flex items-center justify-between gap-4 pb-3 border-b border-stone-200">
                  <div className="flex items-center gap-3">
                    {logoPersonalizado && (
                      <img
                        src={logoPersonalizado}
                        alt="Logotipo"
                        className="h-12 w-auto object-contain max-w-[140px]"
                      />
                    )}
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                        RELATÓRIO DE EVOLUÇÃO EM FLUÊNCIA VERBAL
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Treino de Prosódia Sintática, Ritmo Leitor e Decodificação Automatizada
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Emissão: {new Date().toLocaleDateString('pt-BR')} • Doc ID: FL-{Date.now().toString().slice(-6)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bloco Aluno */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-stone-500 text-[10px] block">ALUNO(A)</span>
                    <strong className="text-stone-900">{perfilLocal.nome || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 text-[10px] block">ANO / SÉRIE</span>
                    <strong className="text-stone-900">{perfilLocal.anoEscolar || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 text-[10px] block">META DE FLUÊNCIA</span>
                    <strong className="text-amber-800">{perfilLocal.metaPPM} PPM</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 text-[10px] block">INSTITUIÇÃO</span>
                    <strong className="text-stone-900">{perfilLocal.escola || 'Não informada'}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 text-[10px] block">AVALIADOR(A)</span>
                    <strong className="text-stone-900">{perfilLocal.avaliador || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 text-[10px] block">INÍCIO DO TREINO</span>
                    <strong className="text-stone-900">{perfilLocal.dataInicio || 'Recente'}</strong>
                  </div>
                </div>

                {/* Bloco KPIs */}
                <div>
                  <h5 className="text-[11px] font-bold text-slate-800 mb-1.5 uppercase tracking-wide">
                    Indicadores Globais de Fluência
                  </h5>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-200">
                      <div className="text-lg font-black text-indigo-950">{stats.totalSessoes}</div>
                      <div className="text-[9px] text-indigo-700 font-bold">SESSÕES</div>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                      <div className="text-lg font-black text-emerald-950">{stats.totalPalavras}</div>
                      <div className="text-[9px] text-emerald-700 font-bold">PALAVRAS LIDAS</div>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
                      <div className="text-lg font-black text-amber-950">{stats.mediaPPM}</div>
                      <div className="text-[9px] text-amber-700 font-bold">MÉDIA PPM</div>
                    </div>
                    <div className="p-2 rounded-lg bg-purple-50 border border-purple-200">
                      <div className="text-lg font-black text-purple-950">{stats.mediaFlesch}/100</div>
                      <div className="text-[9px] text-purple-700 font-bold">FLESCH MÉDIO</div>
                    </div>
                  </div>
                </div>

                {/* Tabela de Sessões */}
                <div>
                  <h5 className="text-[11px] font-bold text-slate-800 mb-1.5 uppercase tracking-wide">
                    Histórico de Leituras Realizadas
                  </h5>
                  <table className="w-full text-[10px] text-left border border-slate-200">
                    <thead className="bg-slate-800 text-white font-bold">
                      <tr>
                        <th className="p-1.5">Data</th>
                        <th className="p-1.5">Texto</th>
                        <th className="p-1.5">Nível</th>
                        <th className="p-1.5 text-center">Palavras</th>
                        <th className="p-1.5 text-center">Tempo</th>
                        <th className="p-1.5 text-center">Velocidade</th>
                        <th className="p-1.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {sessoes.slice(0, 8).map((s) => (
                        <tr key={s.id} className="even:bg-slate-50">
                          <td className="p-1.5">{new Date(s.dataHora).toLocaleDateString('pt-BR')}</td>
                          <td className="p-1.5 font-bold">{s.textoTitulo}</td>
                          <td className="p-1.5">{s.nivel}</td>
                          <td className="p-1.5 text-center">{s.totalPalavras}</td>
                          <td className="p-1.5 text-center">{s.tempoSegundos}s</td>
                          <td className="p-1.5 text-center font-bold text-amber-800">{s.velocidadePPM} PPM</td>
                          <td className="p-1.5">{s.concluida ? 'Concluída ✓' : 'Parcial'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Parecer */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                  <h5 className="font-bold text-slate-900 text-[11px] uppercase">
                    Parecer Pedagógico / Fonoaudiológico
                  </h5>
                  <p className="text-[11px] text-slate-700 leading-relaxed">
                    {perfilLocal.observacoesGerais ||
                      'O aluno demonstra evolução consistente na velocidade leitora e respeito às pausas sintáticas delimitadas por barras, reduzindo quebras inadequadas e consolidando a prosódia expressiva.'}
                  </p>
                </div>

                {/* Assinatura */}
                <div className="pt-6 flex flex-col items-center justify-center text-center">
                  <div className="w-56 border-t border-slate-400 mb-1" />
                  <div className="text-xs font-bold text-slate-900">
                    {perfilLocal.avaliador || 'Assinatura do Profissional Responsável'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Fonoaudiologia / Psicopedagogia / Coordenação Pedagógica
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RODAPÉ DO MODAL */}
        <div className="bg-amber-100/70 border-t border-amber-200 p-3 sm:p-4 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-stone-600 hidden sm:block">
            Exportação direta em PDF vetorial A4 multipágina com tabelas e gráficos.
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-stone-600 bg-stone-200 hover:bg-stone-300 rounded-xl cursor-pointer"
            >
              Fechar
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={gerandoPdf}
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>{gerandoPdf ? 'Gerando Documento...' : 'Baixar Relatório PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
