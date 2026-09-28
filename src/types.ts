export type NivelTexto =
  | 'Muito Fácil'
  | 'Fácil'
  | 'Intermediário'
  | 'Avançado'
  | 'Ensino Médio'
  | 'Iniciante';

export type CorNivel = 'teal' | 'emerald' | 'green' | 'blue' | 'purple' | 'rose' | 'amber';

export interface LeiturabilidadeInfo {
  flesch: number; // Índice Flesch adaptado ao Português (0 a 100)
  classificacao: string; // Ex: "Muito Fácil", "Fácil", "Médio", "Difícil"
  anoEscolar: string; // Ex: "1º e 2º ano", "3º e 4º ano", etc.
  palavras: number;
  tempoLeituraSegundos: number; // Estimativa a ~120 ppm
}

export interface TextoFluencia {
  id: number;
  title: string;
  nivel: NivelTexto;
  cor: CorNivel;
  text: string;
  syntacticText?: string;
  leiturabilidade?: LeiturabilidadeInfo;
}

export interface WordToken {
  index: number;
  word: string;
  cleanWord: string;
  charStart: number;
  charEnd: number;
  charOffsetInSentence?: number;
  charEndInSentence?: number;
  sentenceIndex: number;
  hasComma: boolean;
  hasPeriod: boolean;
  hasStrongPunctuation: boolean;
}

export interface WordGroup {
  groupIndex: number;
  words: WordToken[];
  text: string;
  charStart: number;
  charEnd: number;
  sentenceIndex: number;
}

export interface SentenceSegment {
  sentenceIndex: number;
  text: string;
  charStart: number;
  charEnd: number;
  words: WordToken[];
  groups: WordGroup[];
  hasPeriod: boolean;
}

export type PauseDuration = 'curta' | 'media' | 'longa';

export type VoiceEngineMode = 'ai' | 'browser';

export interface AIVoiceOption {
  id: string;
  name: string;
  gender: 'feminino' | 'masculino';
  style: string;
  description: string;
}

export interface ClassifiedBrowserVoice {
  voice: SpeechSynthesisVoice;
  isNeuralOrNatural: boolean;
  qualityLabel: string;
  genderEstimate: 'feminino' | 'masculino' | 'neutro';
}

export interface SessaoTreino {
  id: string;
  dataHora: string; // ISO ou formatado
  textoId: number;
  textoTitulo: string;
  nivel: NivelTexto;
  flesch: number;
  totalPalavras: number;
  tempoSegundos: number;
  velocidadePPM: number;
  modo: 'modelar' | 'silencioso';
  vozUtilizada: string;
  pausaConfigurada: PauseDuration;
  modoDestaque: 'palavra' | 'grupo';
  concluida: boolean;
  observacoes?: string;
}

export interface PerfilAluno {
  nome: string;
  anoEscolar: string;
  escola: string;
  avaliador: string;
  dataInicio: string;
  metaPPM: number;
  observacoesGerais: string;
}

export interface EstatisticasProgresso {
  totalSessoes: number;
  totalPalavras: number;
  tempoTotalSegundos: number;
  mediaPPM: number;
  mediaFlesch: number;
  taxaConclusao: number;
  distribuicaoNiveis: Record<string, number>;
}
