import { WordToken, WordGroup, SentenceSegment, PauseDuration, VoiceEngineMode } from '../types';

export interface SpeechEngineCallbacks {
  onWordHighlight: (wordIndex: number) => void;
  onGroupHighlight: (groupIndex: number) => void;
  onSentenceChange: (sentenceIndex: number) => void;
  onFinished: () => void;
  onError?: (err: any) => void;
  onAudioLoadingChange?: (loading: boolean) => void;
}

/**
 * Calcula o peso temporal estimado de uma palavra em português (baseado em sílabas e pontuação)
 */
function computeWordDurationMs(wordToken: WordToken, speed: number): number {
  const clean = wordToken.cleanWord;
  if (!clean || clean.length === 0) {
    return Math.max(120, Math.round(180 / speed));
  }

  // Estimativa de sílabas por grupos vocálicos em português
  const vowelGroups = clean.match(/[aeiouyáéíóúâêôãõàü]+/gi);
  const syllables = Math.max(1, vowelGroups ? vowelGroups.length : 1);

  // Duração base proporcional às sílabas (a 1.0x, ~135ms por sílaba + baseline de 90ms)
  let baseMs = 90 + syllables * 135;

  // Palavras longas ou com acento tônico demandam mais tempo de articulação
  if (clean.length >= 7) baseMs += 70;
  if (/[áéíóúâêôãõ]/i.test(clean)) baseMs += 40;

  // Pausas de pontuação interna (vírgula, ponto-e-vírgula, dois-pontos)
  if (wordToken.hasComma) {
    baseMs += 190;
  }
  // Pausa final de oração
  if (wordToken.hasPeriod) {
    baseMs += 260;
  }

  // Ajuste estrito de velocidade: quanto maior o speed, menor o tempo
  return Math.max(110, Math.round(baseMs / Math.max(0.4, speed)));
}

export class FluencySpeechEngine {
  private tokens: WordToken[] = [];
  private groups: WordGroup[] = [];
  private sentences: SentenceSegment[] = [];
  private currentSentenceIdx = 0;
  private isRunning = false;
  private isSilent = false;

  private voiceMode: VoiceEngineMode = 'browser';
  private aiVoiceName = 'Kore';
  private speed = 1.0;
  private pitch = 1.0;
  private timingOffset = 1.0;
  private pauseDuration: PauseDuration = 'media';
  private selectedBrowserVoice: SpeechSynthesisVoice | null = null;
  private selectedBrowserVoiceName: string | null = null;
  private selectedBrowserVoiceURI: string | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  private callbacks: SpeechEngineCallbacks;
  private timeoutId: any = null;
  private syncAnimFrameId: number | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private audioAnimFrameId: number | null = null;

  // Variáveis para o motor de sincronização híbrido de alta fidelidade
  private sentenceStartTime = 0;
  private activeWordLocalIdx = 0;

  // Cache de áudio de IA para reprodução fluida sem re-download
  private audioCache = new Map<string, string>();

  constructor(callbacks: SpeechEngineCallbacks) {
    this.callbacks = callbacks;
  }

  public setData(
    tokens: WordToken[],
    groups: WordGroup[],
    sentences: SentenceSegment[]
  ) {
    this.stop();
    this.tokens = tokens;
    this.groups = groups;
    this.sentences = sentences;
    this.audioCache.clear();
  }

  public setConfig(
    voiceMode: VoiceEngineMode,
    aiVoiceName: string,
    speed: number,
    pitch: number,
    timingOffset: number,
    pauseDuration: PauseDuration,
    browserVoice: SpeechSynthesisVoice | null
  ) {
    this.voiceMode = voiceMode;
    this.aiVoiceName = aiVoiceName;
    this.speed = speed;
    this.pitch = pitch;
    this.timingOffset = timingOffset;
    this.pauseDuration = pauseDuration;
    this.selectedBrowserVoice = browserVoice;
    this.selectedBrowserVoiceName = browserVoice?.name || null;
    this.selectedBrowserVoiceURI = browserVoice?.voiceURI || null;
  }

  public setSpeed(speed: number) {
    this.speed = Math.max(0.5, Math.min(2.0, speed));
    if (this.currentAudioElement) {
      this.currentAudioElement.playbackRate = this.speed;
    }
  }

  public start(silent = false) {
    this.stop();
    this.isRunning = true;
    this.isSilent = silent;
    this.currentSentenceIdx = 0;

    // Reseta qualquer áudio anterior apenas ao iniciar a leitura
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel();
    }

    if (this.isSilent) {
      this.playSilentSentence(0);
    } else if (this.voiceMode === 'ai') {
      this.playAIVoiceFullText();
    } else {
      this.playBrowserVoiceSentence(0);
    }
  }

  public stop() {
    this.isRunning = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.syncAnimFrameId) {
      cancelAnimationFrame(this.syncAnimFrameId);
      this.syncAnimFrameId = null;
    }
    if (this.audioAnimFrameId) {
      cancelAnimationFrame(this.audioAnimFrameId);
      this.audioAnimFrameId = null;
    }
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement.currentTime = 0;
      this.currentAudioElement = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      if ((window as any)._activeUtteranceSet) {
        (window as any)._activeUtteranceSet.clear();
      }
    }
    this.callbacks.onAudioLoadingChange?.(false);
    this.callbacks.onWordHighlight(-1);
    this.callbacks.onGroupHighlight(-1);
    this.callbacks.onSentenceChange(-1);
  }

  private getPeriodPauseMs(): number {
    let baseMs = 1100; // Padrão: 1.1s para permitir respiração e clareza
    if (this.pauseDuration === 'curta') baseMs = 600;
    if (this.pauseDuration === 'longa') baseMs = 1600;
    return Math.max(300, Math.round(baseMs / this.speed));
  }

  private findGroupByWordIndex(sentenceIdx: number, wordIndex: number): number {
    const sentence = this.sentences[sentenceIdx];
    if (!sentence) return -1;
    for (const group of sentence.groups) {
      if (group.words.some((w) => w.index === wordIndex)) {
        return group.groupIndex;
      }
    }
    return -1;
  }

  /**
   * Resolução infalível de palavra a partir de charIndex emitido pelo navegador
   */
  private resolveWordFromCharIndex(sentence: SentenceSegment, rawCharIndex: number): WordToken | null {
    if (!sentence.words || sentence.words.length === 0) return null;

    // Se o navegador enviar charIndex absoluto em vez de relativo à sentença, normaliza
    let charOffset = rawCharIndex;
    if (charOffset >= sentence.charStart && sentence.charStart > 0) {
      charOffset = charOffset - sentence.charStart;
    }

    // Busca exata ou por proximidade nos offsets pré-computados
    for (let i = 0; i < sentence.words.length; i++) {
      const w = sentence.words[i];
      const start = w.charOffsetInSentence ?? 0;
      const end = w.charEndInSentence ?? start + w.word.length;

      // Inclui a palavra e os espaços adjacentes até a próxima palavra
      const nextStart = i < sentence.words.length - 1
        ? (sentence.words[i + 1].charOffsetInSentence ?? end + 1)
        : end + 100;

      if (charOffset >= start && charOffset < nextStart) {
        return w;
      }
    }

    // Fallback: retorna a última palavra se charOffset ultrapassou o texto
    return sentence.words[sentence.words.length - 1];
  }

  /* -------------------------------------------------------------
   * REPRODUÇÃO COM VOZ DO NAVEGADOR (Web Speech API)
   * Motor Híbrido: Sincronização por Eventos onboundary + Calibração Temporal Contínua
   * Garante sincronia 100% precisa em QUALQUER velocidade (0.7x, 1.0x, 1.2x, 1.5x)
   * ------------------------------------------------------------- */
  private playBrowserVoiceSentence(sIdx: number) {
    if (!this.isRunning || sIdx >= this.sentences.length) {
      this.stop();
      this.callbacks.onFinished();
      return;
    }

    this.currentSentenceIdx = sIdx;
    const sentence = this.sentences[sIdx];
    this.callbacks.onSentenceChange(sIdx);

    if (typeof window === 'undefined' || !window.speechSynthesis) {
      this.playSilentSentence(sIdx);
      return;
    }

    // Garante que o sintetizador não está pausado
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    // Cancela no início da primeira sentença para limpar estado residual
    if (sIdx === 0) {
      window.speechSynthesis.cancel();
    }

    const words = sentence.words;
    if (words.length === 0) {
      this.playBrowserVoiceSentence(sIdx + 1);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(sentence.text);
    this.currentUtterance = utterance;

    // Previne coleta de lixo pelo V8 do Chrome durante a fala
    if (!(window as any)._activeUtteranceSet) {
      (window as any)._activeUtteranceSet = new Set();
    }
    (window as any)._activeUtteranceSet.add(utterance);

    // Resolução ativa e dinâmica da voz fresca da API do navegador
    let chosenVoice: SpeechSynthesisVoice | null = null;
    const freshVoices = window.speechSynthesis.getVoices();
    const ptFresh = freshVoices.filter(
      (v) => (v.lang.startsWith('pt') || v.lang.startsWith('por')) && !v.name.toLowerCase().includes('helena')
    );

    if (this.selectedBrowserVoiceURI || this.selectedBrowserVoiceName) {
      chosenVoice =
        ptFresh.find(
          (v) =>
            (this.selectedBrowserVoiceURI && v.voiceURI === this.selectedBrowserVoiceURI) ||
            (this.selectedBrowserVoiceName && v.name === this.selectedBrowserVoiceName)
        ) ||
        freshVoices.find(
          (v) =>
            (this.selectedBrowserVoiceURI && v.voiceURI === this.selectedBrowserVoiceURI) ||
            (this.selectedBrowserVoiceName && v.name === this.selectedBrowserVoiceName)
        ) ||
        null;
    }

    if (!chosenVoice) {
      chosenVoice =
        ptFresh.find((v) => {
          const n = v.name.toLowerCase();
          return (
            n.includes('natural') ||
            n.includes('neural') ||
            n.includes('google') ||
            n.includes('luciana') ||
            n.includes('beatriz') ||
            n.includes('francisca')
          );
        }) ||
        ptFresh.find((v) => v.lang === 'pt-BR') ||
        ptFresh[0] ||
        null;
    }

    if (chosenVoice) {
      this.selectedBrowserVoice = chosenVoice;
      this.selectedBrowserVoiceName = chosenVoice.name;
      this.selectedBrowserVoiceURI = chosenVoice.voiceURI;
      utterance.voice = chosenVoice;
      utterance.lang = chosenVoice.lang || 'pt-BR';
    } else {
      utterance.lang = 'pt-BR';
    }

    // Configura velocidade e tom no sintetizador
    utterance.rate = this.speed;
    utterance.pitch = this.pitch;

    // -------------------------------------------------------------
    // CALIBRAÇÃO TEMPORAL SILÁBICA PARA CADA PALAVRA DA SENTENÇA
    // -------------------------------------------------------------
    const wordDurations = words.map((w) => computeWordDurationMs(w, this.speed));
    const wordTimeOffsets: number[] = [];
    let accMs = 0;
    for (let i = 0; i < words.length; i++) {
      wordTimeOffsets.push(accMs);
      accMs += wordDurations[i];
    }

    this.activeWordLocalIdx = 0;
    this.sentenceStartTime = performance.now();

    // Destaque inicial da primeira palavra imediatamente
    const firstWord = words[0];
    this.callbacks.onWordHighlight(firstWord.index);
    const firstGrp = this.findGroupByWordIndex(sIdx, firstWord.index);
    if (firstGrp !== -1) this.callbacks.onGroupHighlight(firstGrp);

    let speechActuallyStarted = false;

    // LOOP CONTÍNUO DE SINCRONIZAÇÃO VIA requestAnimationFrame
    // Garante avanço suave e sincronizado mesmo se o navegador atrasar ou engolir boundaries
    const runContinuousSync = () => {
      if (!this.isRunning || this.currentSentenceIdx !== sIdx) return;

      const elapsed = performance.now() - this.sentenceStartTime;

      let targetIdx = this.activeWordLocalIdx;
      for (let i = 0; i < wordTimeOffsets.length; i++) {
        if (elapsed >= wordTimeOffsets[i]) {
          targetIdx = i;
        } else {
          break;
        }
      }

      if (targetIdx !== this.activeWordLocalIdx && targetIdx < words.length) {
        this.activeWordLocalIdx = targetIdx;
        const targetWord = words[targetIdx];
        if (targetWord) {
          this.callbacks.onWordHighlight(targetWord.index);
          const grpIdx = this.findGroupByWordIndex(sIdx, targetWord.index);
          if (grpIdx !== -1) this.callbacks.onGroupHighlight(grpIdx);
        }
      }

      this.syncAnimFrameId = requestAnimationFrame(runContinuousSync);
    };

    utterance.onstart = () => {
      if (!this.isRunning || this.currentSentenceIdx !== sIdx) return;
      speechActuallyStarted = true;
      this.sentenceStartTime = performance.now();
      if (this.syncAnimFrameId) cancelAnimationFrame(this.syncAnimFrameId);
      this.syncAnimFrameId = requestAnimationFrame(runContinuousSync);
    };

    // Sincronização por limites emitidos pela API de voz nativa
    utterance.onboundary = (event: SpeechSynthesisEvent) => {
      if (!this.isRunning || this.currentSentenceIdx !== sIdx) return;
      speechActuallyStarted = true;

      const matchedWord = this.resolveWordFromCharIndex(sentence, event.charIndex);
      if (matchedWord) {
        const localIdx = words.findIndex((w) => w.index === matchedWord.index);
        if (localIdx !== -1) {
          this.activeWordLocalIdx = localIdx;
          // RECALIBRAÇÃO DINÂMICA: alinha a linha do tempo do loop contínuo com a fala real
          const now = performance.now();
          const expectedOffset = wordTimeOffsets[localIdx] || 0;
          this.sentenceStartTime = now - expectedOffset;
        }

        this.callbacks.onWordHighlight(matchedWord.index);
        const grpIdx = this.findGroupByWordIndex(sIdx, matchedWord.index);
        if (grpIdx !== -1) this.callbacks.onGroupHighlight(grpIdx);
      }
    };

    utterance.onend = () => {
      if ((window as any)._activeUtteranceSet) {
        (window as any)._activeUtteranceSet.delete(utterance);
      }
      if (!this.isRunning || this.currentSentenceIdx !== sIdx) return;

      if (this.syncAnimFrameId) {
        cancelAnimationFrame(this.syncAnimFrameId);
        this.syncAnimFrameId = null;
      }

      // Destaca a última palavra e o último grupo da oração
      if (words.length > 0) {
        const lastWord = words[words.length - 1];
        this.callbacks.onWordHighlight(lastWord.index);
        const lastGroup = sentence.groups[sentence.groups.length - 1];
        if (lastGroup) this.callbacks.onGroupHighlight(lastGroup.groupIndex);
      }

      if (sIdx >= this.sentences.length - 1) {
        this.timeoutId = setTimeout(() => {
          this.stop();
          this.callbacks.onFinished();
        }, 400);
        return;
      }

      // PAUSA NO PONTO FINAL CONFORME AJUSTE PEDAGÓGICO
      const pauseMs = this.getPeriodPauseMs();
      this.timeoutId = setTimeout(() => {
        if (!this.isRunning) return;
        this.playBrowserVoiceSentence(sIdx + 1);
      }, pauseMs);
    };

    utterance.onerror = (err) => {
      if ((window as any)._activeUtteranceSet) {
        (window as any)._activeUtteranceSet.delete(utterance);
      }
      console.warn('SpeechSynthesis error:', err);
      if (this.syncAnimFrameId) {
        cancelAnimationFrame(this.syncAnimFrameId);
        this.syncAnimFrameId = null;
      }
      if (this.isRunning && this.currentSentenceIdx === sIdx) {
        if (sIdx < this.sentences.length - 1) {
          this.timeoutId = setTimeout(() => this.playBrowserVoiceSentence(sIdx + 1), 300);
        } else {
          this.stop();
          this.callbacks.onFinished();
        }
      }
    };

    // Disparo imediato da fala
    setTimeout(() => {
      if (!this.isRunning || this.currentSentenceIdx !== sIdx) return;
      window.speechSynthesis.speak(utterance);

      // Inicia o loop após 50ms se o evento onstart atrasar no browser
      setTimeout(() => {
        if (this.isRunning && this.currentSentenceIdx === sIdx && !speechActuallyStarted) {
          this.sentenceStartTime = performance.now();
          if (!this.syncAnimFrameId) {
            this.syncAnimFrameId = requestAnimationFrame(runContinuousSync);
          }
        }
      }, 50);
    }, 20);
  }

  /* -------------------------------------------------------------
   * REPRODUÇÃO SILENCIOSA GUIADA ("Só Destaque")
   * Segue a prosódia sintática e o ritmo leitor sem emissão de áudio
   * ------------------------------------------------------------- */
  private playSilentSentence(sIdx: number) {
    if (!this.isRunning || sIdx >= this.sentences.length) {
      this.stop();
      this.callbacks.onFinished();
      return;
    }

    this.currentSentenceIdx = sIdx;
    const sentence = this.sentences[sIdx];
    this.callbacks.onSentenceChange(sIdx);

    const words = sentence.words;
    if (words.length === 0) {
      this.playSilentSentence(sIdx + 1);
      return;
    }

    let wIdx = 0;
    const stepWord = () => {
      if (!this.isRunning || this.currentSentenceIdx !== sIdx) return;

      if (wIdx >= words.length) {
        const pauseMs = this.getPeriodPauseMs();
        this.timeoutId = setTimeout(() => {
          if (!this.isRunning) return;
          this.playSilentSentence(sIdx + 1);
        }, pauseMs);
        return;
      }

      const token = words[wIdx];
      this.callbacks.onWordHighlight(token.index);
      const grpIdx = this.findGroupByWordIndex(sIdx, token.index);
      if (grpIdx !== -1) this.callbacks.onGroupHighlight(grpIdx);

      const durationMs = computeWordDurationMs(token, this.speed) * this.timingOffset;
      wIdx++;
      this.timeoutId = setTimeout(stepWord, durationMs);
    };

    stepWord();
  }

  /* -------------------------------------------------------------
   * REPRODUÇÃO COM IA ULTRA-NATURAL (Áudio Integral do Texto)
   * Modelo com tracking temporal silábico proporcional à duração real
   * ------------------------------------------------------------- */
  private async playAIVoiceFullText() {
    if (!this.isRunning || this.tokens.length === 0) {
      this.stop();
      this.callbacks.onFinished();
      return;
    }

    const fullCleanText = this.sentences.map((s) => s.text).join(' ');
    const cacheKey = `${this.aiVoiceName}:${fullCleanText}`;

    try {
      this.callbacks.onAudioLoadingChange?.(true);

      let audioUrl = this.audioCache.get(cacheKey);

      if (!audioUrl) {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: fullCleanText,
            voiceName: this.aiVoiceName
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Status ${res.status}`);
        }

        const data = await res.json();
        if (!data.audioBase64) {
          throw new Error('Dados de áudio não retornados pelo servidor');
        }

        audioUrl = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
        this.audioCache.set(cacheKey, audioUrl);
      }

      this.callbacks.onAudioLoadingChange?.(false);

      if (!this.isRunning) return;

      const audio = new Audio(audioUrl);
      this.currentAudioElement = audio;
      audio.playbackRate = this.speed;

      const startTracking = () => {
        if (!this.isRunning) return;
        this.startFullAudioProgressTracking(audio);
      };

      if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
        startTracking();
      } else {
        audio.onloadedmetadata = startTracking;
      }

      audio.onended = () => {
        if (!this.isRunning) return;
        if (this.audioAnimFrameId) cancelAnimationFrame(this.audioAnimFrameId);

        if (this.tokens.length > 0) {
          const lastWord = this.tokens[this.tokens.length - 1];
          this.callbacks.onWordHighlight(lastWord.index);
          this.callbacks.onSentenceChange(lastWord.sentenceIndex);
          const lastGrpIdx = this.findGroupByWordIndex(lastWord.sentenceIndex, lastWord.index);
          if (lastGrpIdx !== -1) this.callbacks.onGroupHighlight(lastGrpIdx);
        }

        this.timeoutId = setTimeout(() => {
          this.stop();
          this.callbacks.onFinished();
        }, 400);
      };

      audio.onerror = (err) => {
        console.warn('Erro na reprodução do áudio de IA:', err);
        this.callbacks.onAudioLoadingChange?.(false);
        this.callbacks.onError?.('Não foi possível reproduzir o áudio de IA. Alternando para voz local.');
        this.playBrowserVoiceSentence(0);
      };

      await audio.play();
    } catch (err: any) {
      console.warn('Erro ao obter áudio de IA, alternando para voz local:', err);
      this.callbacks.onAudioLoadingChange?.(false);
      // Fallback gracioso para a voz do navegador sem interromper a experiência
      this.playBrowserVoiceSentence(0);
    }
  }

  private startFullAudioProgressTracking(audio: HTMLAudioElement) {
    const totalDuration = audio.duration || 1;
    const words = this.tokens;
    if (words.length === 0) return;

    // Calibração proporcional aos pesos silábicos das palavras
    const wordWeights = words.map((w) => computeWordDurationMs(w, 1.0));
    const totalWeight = wordWeights.reduce((acc, w) => acc + w, 0);

    const wordStartTimes: number[] = [];
    let accum = 0;
    for (let i = 0; i < words.length; i++) {
      wordStartTimes.push((accum / totalWeight) * totalDuration);
      accum += wordWeights[i];
    }

    let lastHighlightedIdx = -1;

    const track = () => {
      if (!this.isRunning || !this.currentAudioElement) return;

      const currentSec = audio.currentTime;
      let activeIdx = 0;
      for (let i = 0; i < wordStartTimes.length; i++) {
        if (currentSec >= wordStartTimes[i]) {
          activeIdx = i;
        } else {
          break;
        }
      }

      if (activeIdx !== lastHighlightedIdx && activeIdx < words.length) {
        lastHighlightedIdx = activeIdx;
        const activeWord = words[activeIdx];
        if (activeWord) {
          this.callbacks.onWordHighlight(activeWord.index);
          this.callbacks.onSentenceChange(activeWord.sentenceIndex);
          const grpIdx = this.findGroupByWordIndex(activeWord.sentenceIndex, activeWord.index);
          if (grpIdx !== -1) this.callbacks.onGroupHighlight(grpIdx);
        }
      }

      this.audioAnimFrameId = requestAnimationFrame(track);
    };

    this.audioAnimFrameId = requestAnimationFrame(track);
  }
}
