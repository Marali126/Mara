import { WordToken, WordGroup, SentenceSegment } from '../types';

// Artigos, preposições, pronomes átonos e conectivos que NUNCA devem ficar soltos no final de um grupo sintático
const DANGLING_WORDS = new Set([
  'a', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas',
  'de', 'da', 'do', 'das', 'dos', 'dum', 'duma',
  'em', 'na', 'no', 'nas', 'nos', 'num', 'numa',
  'para', 'pra', 'com', 'por', 'sem', 'sob', 'sobre',
  'ao', 'aos', 'à', 'às', 'pelo', 'pela', 'pelos', 'pelas',
  'e', 'ou', 'nem', 'que', 'se', 'seu', 'sua', 'seus', 'suas',
  'meu', 'minha', 'meus', 'minhas', 'teu', 'tua', 'este', 'esta', 'esse', 'essa',
  'aquele', 'aquela', 'cujo', 'cuja', 'onde', 'porque', 'pois', 'quando'
]);

// Conjunções subordinativas que formam orações adverbiais
const SUBORDINATE_CONJUNCTIONS = new Set([
  'porque', 'pois', 'quando', 'enquanto', 'embora', 'como', 'se', 'conforme', 'já'
]);

// Conjunções coordenativas
const COORDINATE_CONJUNCTIONS = new Set([
  'mas', 'porém', 'contudo', 'todavia', 'entretanto', 'portanto', 'logo', 'e'
]);

// Adjetivos comuns e sufixos adjetivos do português que NUNCA devem ser separados do substantivo antecedente
const COMMON_ADJECTIVES = new Set([
  'rico', 'rica', 'ricos', 'ricas',
  'bom', 'boa', 'bons', 'boas',
  'grande', 'grandes', 'pequeno', 'pequena', 'pequenos', 'pequenas',
  'novo', 'nova', 'novos', 'novas',
  'velho', 'velha', 'velhos', 'velhas',
  'alto', 'alta', 'altos', 'altas',
  'baixo', 'baixa', 'baixos', 'baixas',
  'frio', 'fria', 'frios', 'frias',
  'quente', 'quentes',
  'limpo', 'limpa', 'limpos', 'limpas',
  'suave', 'suaves', 'forte', 'fortes',
  'azul', 'azuis', 'verde', 'verdes', 'branco', 'branca', 'brancos', 'brancas',
  'preto', 'preta', 'pretos', 'pretas', 'amarelo', 'amarela', 'amarelos', 'amarelas',
  'dourado', 'dourada', 'dourados', 'douradas',
  'vermelho', 'vermelha', 'vermelhos', 'vermelhas',
  'fofo', 'fofa', 'fofos', 'fofas',
  'feliz', 'felizes', 'alegre', 'alegres',
  'esperto', 'esperta', 'espertos', 'espertas',
  'marinho', 'marinha', 'marinhos', 'marinhas',
  'terrestre', 'terrestres', 'lunar', 'lunares', 'solar', 'solares',
  'profundo', 'profunda', 'profundos', 'profundas',
  'humano', 'humana', 'humanos', 'humanas',
  'natural', 'naturais'
]);

function isLikelyAdjectiveOrModifier(cleanWord: string): boolean {
  if (COMMON_ADJECTIVES.has(cleanWord)) return true;
  return (
    cleanWord.endsWith('oso') || cleanWord.endsWith('osa') || cleanWord.endsWith('osos') || cleanWord.endsWith('osas') ||
    cleanWord.endsWith('vel') || cleanWord.endsWith('veis') ||
    cleanWord.endsWith('al') || cleanWord.endsWith('ais') ||
    cleanWord.endsWith('ar') || cleanWord.endsWith('ares') ||
    cleanWord.endsWith('ico') || cleanWord.endsWith('ica') || cleanWord.endsWith('icos') || cleanWord.endsWith('icas') ||
    cleanWord.endsWith('ivo') || cleanWord.endsWith('iva') || cleanWord.endsWith('ivos') || cleanWord.endsWith('ivas') ||
    cleanWord.endsWith('ante') || cleanWord.endsWith('ente') || cleanWord.endsWith('antes') || cleanWord.endsWith('entes')
  );
}

/**
 * Tokeniza o texto em palavras preservando índices exatos de caracteres e pontuação.
 * Se syntacticSource contiver barras (/), utiliza-as como limites de sintagmas curados.
 */
export function tokenizeText(
  cleanText: string,
  syntacticSource?: string
): {
  tokens: WordToken[];
  sentences: SentenceSegment[];
  groups: WordGroup[];
} {
  const sourceWithSlashes = (syntacticSource || cleanText).trim();
  const hasSlashes = sourceWithSlashes.includes('/');

  if (hasSlashes) {
    return parseTextWithSlashes(sourceWithSlashes);
  }

  return parseTextAlgorithmic(cleanText);
}

/**
 * Análise sintática precisa baseada em marcações de barra ( / ) curadas por fonoaudiólogos/pedagogos
 */
function parseTextWithSlashes(sourceWithSlashes: string): {
  tokens: WordToken[];
  sentences: SentenceSegment[];
  groups: WordGroup[];
} {
  const tokens: WordToken[] = [];
  const sentences: SentenceSegment[] = [];
  const groups: WordGroup[] = [];

  // Divide o texto em sentenças mantendo pontuação final (. ! ?)
  // Regex que divide após [.!?] seguido de espaço ou quebra de linha
  const rawSentences = sourceWithSlashes
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 0);

  let wordIndex = 0;
  let groupIndex = 0;
  let charCounter = 0;

  rawSentences.forEach((rawSentence, sIdx) => {
    // Texto limpo da sentença (sem barras) para leitura de áudio
    const cleanSentenceText = rawSentence.replace(/\s*\/\s*/g, ' ').trim();
    const sentenceCharStart = charCounter;
    const sentenceWords: WordToken[] = [];
    const sentenceGroups: WordGroup[] = [];

    // Divide a sentença nos blocos sintáticos demarcados por /
    const rawChunks = rawSentence
      .split(/\s*\/\s*/)
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    rawChunks.forEach((chunk) => {
      const chunkWordsRaw = chunk.split(/\s+/).filter((w) => w.length > 0);
      const chunkTokens: WordToken[] = [];
      const chunkCharStart = charCounter;

      chunkWordsRaw.forEach((w) => {
        const hasPeriod = /[.!?]$/.test(w);
        const hasComma = /[,;:]$/.test(w);
        const hasStrongPunctuation = /[.!?;:]$/.test(w);
        const cleanWord = w.replace(/[.,!?;:«»"()—]/g, '').toLowerCase();

        const token: WordToken = {
          index: wordIndex++,
          word: w,
          cleanWord,
          charStart: charCounter,
          charEnd: charCounter + w.length,
          sentenceIndex: sIdx,
          hasComma,
          hasPeriod,
          hasStrongPunctuation
        };

        tokens.push(token);
        sentenceWords.push(token);
        chunkTokens.push(token);

        charCounter += w.length + 1; // +1 para espaço
      });

      if (chunkTokens.length > 0) {
        const grp: WordGroup = {
          groupIndex: groupIndex++,
          words: chunkTokens,
          text: chunkTokens.map((t) => t.word).join(' '),
          charStart: chunkCharStart,
          charEnd: charCounter - 1,
          sentenceIndex: sIdx
        };
        groups.push(grp);
        sentenceGroups.push(grp);
      }
    });

    // Calcula os offsets relativos exatos de cada palavra dentro de cleanSentenceText
    let sentenceCharOffset = 0;
    sentenceWords.forEach((token) => {
      token.charOffsetInSentence = sentenceCharOffset;
      token.charEndInSentence = sentenceCharOffset + token.word.length;
      sentenceCharOffset += token.word.length + 1;
    });

    const sentenceCharEnd = charCounter > 0 ? charCounter - 1 : 0;
    const hasFinalPeriod = sentenceWords.length > 0 ? sentenceWords[sentenceWords.length - 1].hasPeriod : true;

    sentences.push({
      sentenceIndex: sIdx,
      text: cleanSentenceText,
      charStart: sentenceCharStart,
      charEnd: sentenceCharEnd,
      words: sentenceWords,
      groups: sentenceGroups,
      hasPeriod: hasFinalPeriod
    });
  });

  return { tokens, sentences, groups };
}

/**
 * Análise sintática algorítmica linguística para textos sem barras
 */
function parseTextAlgorithmic(fullText: string): {
  tokens: WordToken[];
  sentences: SentenceSegment[];
  groups: WordGroup[];
} {
  const tokens: WordToken[] = [];
  const sentences: SentenceSegment[] = [];

  const wordRegex = /\S+/g;
  let match: RegExpExecArray | null;
  let wordIndex = 0;
  let currentSentenceIndex = 0;
  let currentSentenceWords: WordToken[] = [];
  let sentenceCharStart = 0;

  while ((match = wordRegex.exec(fullText)) !== null) {
    const rawWord = match[0];
    const charStart = match.index;
    const charEnd = charStart + rawWord.length;

    const hasPeriod = /[.!?]$/.test(rawWord);
    const hasComma = /[,;:]$/.test(rawWord);
    const hasStrongPunctuation = /[.!?;:]$/.test(rawWord);
    const cleanWord = rawWord.replace(/[.,!?;:«»"()—]/g, '').toLowerCase();

    const token: WordToken = {
      index: wordIndex++,
      word: rawWord,
      cleanWord,
      charStart,
      charEnd,
      sentenceIndex: currentSentenceIndex,
      hasComma,
      hasPeriod,
      hasStrongPunctuation
    };

    tokens.push(token);
    currentSentenceWords.push(token);

    if (hasPeriod || charEnd === fullText.length) {
      const sentenceText = fullText.slice(sentenceCharStart, charEnd).trim();
      currentSentenceWords.forEach((t) => {
        t.charOffsetInSentence = Math.max(0, t.charStart - sentenceCharStart);
        t.charEndInSentence = Math.max(t.word.length, t.charEnd - sentenceCharStart);
      });

      sentences.push({
        sentenceIndex: currentSentenceIndex,
        text: sentenceText,
        charStart: sentenceCharStart,
        charEnd,
        words: currentSentenceWords,
        groups: [],
        hasPeriod: true
      });

      currentSentenceIndex++;
      currentSentenceWords = [];
      sentenceCharStart = charEnd + 1;
    }
  }

  if (currentSentenceWords.length > 0) {
    const sentenceText = fullText.slice(sentenceCharStart).trim();
    currentSentenceWords.forEach((t) => {
      t.charOffsetInSentence = Math.max(0, t.charStart - sentenceCharStart);
      t.charEndInSentence = Math.max(t.word.length, t.charEnd - sentenceCharStart);
    });

    sentences.push({
      sentenceIndex: currentSentenceIndex,
      text: sentenceText,
      charStart: sentenceCharStart,
      charEnd: fullText.length,
      words: currentSentenceWords,
      groups: [],
      hasPeriod: false
    });
  }

  const groups = createSyntacticGroups(tokens, sentences);
  return { tokens, sentences, groups };
}

/**
 * Agrupa palavras respeitando regras estritas de sintaxe do português:
 * - Sintagma Nominal Sujeito (Artigo + Substantivo + Modificador)
 * - Negação + Verbo + Objeto Direto (ex: "não tem luz própria")
 * - Oração subordinada adverbial: Conjunção + Verbo (ex: "porque reflete")
 * - Oração coordenada: Conjunção + Verbo (ex: "e brilha")
 * - Sintagma Nominal Objeto (ex: "a luz do Sol.")
 * - Preposições nunca no fim de grupo
 */
export function createSyntacticGroups(
  tokens: WordToken[],
  sentences: SentenceSegment[]
): WordGroup[] {
  const allGroups: WordGroup[] = [];
  let globalGroupIndex = 0;

  sentences.forEach((sentence) => {
    // Se a sentença já possui grupos (por exemplo, via barras curadas), preserva-os
    if (sentence.groups && sentence.groups.length > 0) {
      sentence.groups.forEach((g) => allGroups.push(g));
      return;
    }

    const sWords = sentence.words;
    let currentGroupWords: WordToken[] = [];

    const flushGroup = () => {
      if (currentGroupWords.length === 0) return;
      const group: WordGroup = {
        groupIndex: globalGroupIndex++,
        words: [...currentGroupWords],
        text: currentGroupWords.map((w) => w.word).join(' '),
        charStart: currentGroupWords[0].charStart,
        charEnd: currentGroupWords[currentGroupWords.length - 1].charEnd,
        sentenceIndex: sentence.sentenceIndex
      };
      allGroups.push(group);
      sentence.groups.push(group);
      currentGroupWords = [];
    };

    for (let i = 0; i < sWords.length; i++) {
      const currentToken = sWords[i];
      const nextToken = i < sWords.length - 1 ? sWords[i + 1] : null;
      const afterNextToken = i < sWords.length - 2 ? sWords[i + 2] : null;
      currentGroupWords.push(currentToken);

      // 1. Fim da sentença (ponto final, exclamação, interrogação)
      if (currentToken.hasPeriod || i === sWords.length - 1) {
        flushGroup();
        continue;
      }

      // 2. Pontuação intermediária clara (vírgula, dois-pontos, ponto-e-vírgula)
      if (currentToken.hasComma) {
        flushGroup();
        continue;
      }

      // 3. Conjunção subordinativa (ex: "porque reflete"):
      // Quebra ANTES de "porque" se já temos um sintagma anterior acumulado
      if (
        nextToken &&
        SUBORDINATE_CONJUNCTIONS.has(nextToken.cleanWord) &&
        currentGroupWords.length >= 2
      ) {
        // Exceção: não quebrar se a palavra atual for conectivo pendente
        if (!DANGLING_WORDS.has(currentToken.cleanWord)) {
          flushGroup();
          continue;
        }
      }

      // 4. Quebra APÓS "conjunção + verbo" (ex: "porque reflete" -> quebra para iniciar "a luz do Sol")
      if (currentGroupWords.length >= 2) {
        const firstWordInGrp = currentGroupWords[0].cleanWord;
        if (
          (SUBORDINATE_CONJUNCTIONS.has(firstWordInGrp) || firstWordInGrp === 'e') &&
          currentGroupWords.length === 2 &&
          nextToken &&
          !currentToken.hasPeriod
        ) {
          // Se o próximo é artigo ou substantivo, fecha o grupo da oração reduzida (ex: "porque reflete" | "a luz do Sol")
          flushGroup();
          continue;
        }
      }

      // 5. Conjunção coordenativa aditiva + verbo (ex: "e brilha"):
      // Quebra ANTES do "e" se a palavra seguinte for um verbo (ex: "não tem luz própria" | "e brilha")
      if (
        nextToken &&
        nextToken.cleanWord === 'e' &&
        afterNextToken &&
        currentGroupWords.length >= 2 &&
        !DANGLING_WORDS.has(currentToken.cleanWord)
      ) {
        flushGroup();
        continue;
      }

      // Proteção gramatical estrita: NUNCA separe um substantivo de seu adjetivo ou modificador adjacente
      if (
        nextToken &&
        isLikelyAdjectiveOrModifier(nextToken.cleanWord) &&
        !currentToken.hasComma &&
        !currentToken.hasPeriod
      ) {
        continue; // Garante que o adjetivo fique sempre no mesmo grupo do substantivo!
      }

      // 6. Limite de tamanho de grupo sintático com proteção a termos pendentes (3 a 4 palavras)
      if (currentGroupWords.length >= 3 && nextToken) {
        const currentIsDangling = DANGLING_WORDS.has(currentToken.cleanWord);
        const nextIsDangling = DANGLING_WORDS.has(nextToken.cleanWord);

        // NUNCA quebre se a palavra atual for dangling (ex: "de", "do", "a", "em", "para")
        if (!currentIsDangling) {
          // Se acumulou 4 palavras ou a próxima palavra for um marcador forte de início de sintagma
          if (
            currentGroupWords.length >= 4 ||
            COORDINATE_CONJUNCTIONS.has(nextToken.cleanWord) ||
            SUBORDINATE_CONJUNCTIONS.has(nextToken.cleanWord)
          ) {
            flushGroup();
            continue;
          }
        }
      }

      // 7. Limite de segurança de 5 palavras para evitar sobrecarga
      if (currentGroupWords.length >= 5 && !DANGLING_WORDS.has(currentToken.cleanWord)) {
        flushGroup();
      }
    }

    flushGroup();
  });

  return allGroups;
}

/**
 * Converte um texto contínuo em texto formatado com barras ( / )
 * de separação de sintagmas utilizando as regras gramaticais do português.
 */
export function autoFormatSyntacticSlashes(text: string): string {
  const clean = text.replace(/\s*\/\s*/g, ' ').trim();
  if (!clean) return '';
  const parsed = parseTextAlgorithmic(clean);

  // Reconstrói o texto por sentenças preservando quebras de linha e separadores de grupo
  const sentenceStrings = parsed.sentences.map((sentence) => {
    return sentence.groups.map((g) => g.text).join(' / ');
  });

  return sentenceStrings.join(' ');
}
