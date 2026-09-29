import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LOGO_SRC } from './data/logo';
import { BIBLIOTECA_TEXTOS } from './data/biblioteca';
import { AI_VOICES, classifyBrowserVoice } from './data/aiVoices';
import {
  TextoFluencia,
  PauseDuration,
  VoiceEngineMode,
  ClassifiedBrowserVoice,
  AIVoiceOption,
  SessaoTreino,
  PerfilAluno
} from './types';
import { tokenizeText, createSyntacticGroups, autoFormatSyntacticSlashes } from './utils/syntacticChunker';
import { FluencySpeechEngine } from './utils/speechEngine';
import { PERFIL_ALUNO_PADRAO, SESSOES_PADRAO } from './data/defaultSessions';
import { ModalRelatorioProgresso } from './components/ModalRelatorioProgresso';
import {
  BookOpen,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Layers,
  Sparkles,
  Edit3,
  Check,
  X,
  Radio,
  Sliders,
  Loader2,
  Mic2,
  Upload,
  Image as ImageIcon,
  Trash2,
  ArrowUpDown,
  Info,
  Type,
  ChevronDown,
  ChevronUp,
  FileText,
  User,
  Calendar
} from 'lucide-react';

export default function App() {
  const [textoSelecionado, setTextoSelecionado] = useState<TextoFluencia>(BIBLIOTECA_TEXTOS[10] || BIBLIOTECA_TEXTOS[0]);
  const [mostrarBiblioteca, setMostrarBiblioteca] = useState<boolean>(false);
  const [mostrarVozes, setMostrarVozes] = useState<boolean>(false);
  const [abaVozes, setAbaVozes] = useState<'ai' | 'browser'>('ai');
  const [mostrarCustomTexto, setMostrarCustomTexto] = useState<boolean>(false);
  const [customTextoTitulo, setCustomTextoTitulo] = useState<string>('');
  const [customTextoConteudo, setCustomTextoConteudo] = useState<string>('');
  const [filtroNivel, setFiltroNivel] = useState<string>('todos');
  const [ordenacaoTextos, setOrdenacaoTextos] = useState<'pedagogica' | 'flesch-desc' | 'flesch-asc' | 'palavras-asc' | 'palavras-desc'>('pedagogica');

  // Gerenciamento e customização do Logotipo
  const [logoPersonalizado, setLogoPersonalizado] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('fluencia_custom_logo');
      return saved !== null ? saved : LOGO_SRC;
    } catch {
      return LOGO_SRC;
    }
  });
  const [logoHeight, setLogoHeight] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('fluencia_logo_height');
      return saved ? Number(saved) : 56;
    } catch {
      return 56;
    }
  });
  const [mostrarModalLogo, setMostrarModalLogo] = useState<boolean>(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Gestão e Persistência do Relatório de Progresso e Sessões
  const [mostrarRelatorio, setMostrarRelatorio] = useState<boolean>(false);
  const [perfilAluno, setPerfilAluno] = useState<PerfilAluno>(() => {
    try {
      const p = localStorage.getItem('fluencia_perfil_aluno');
      return p ? JSON.parse(p) : PERFIL_ALUNO_PADRAO;
    } catch {
      return PERFIL_ALUNO_PADRAO;
    }
  });
  const [sessoesTreino, setSessoesTreino] = useState<SessaoTreino[]>(() => {
    try {
      const s = localStorage.getItem('fluencia_sessoes_treino');
      return s ? JSON.parse(s) : SESSOES_PADRAO;
    } catch {
      return SESSOES_PADRAO;
    }
  });
  const [notificacaoConclusao, setNotificacaoConclusao] = useState<{
    texto: string;
    palavras: number;
    ppm: number;
  } | null>(null);

  const sessionStartTimeRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [silentMode, setSilentMode] = useState<boolean>(false);
  const [isAudioLoading, setIsAudioLoading] = useState<boolean>(false);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);
  const [currentGroupIndex, setCurrentGroupIndex] = useState<number>(-1);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(-1);

  // Configurações de voz e prosódia com persistência local (padrão voz do navegador para resposta imediata)
  const [voiceMode, setVoiceMode] = useState<VoiceEngineMode>(() => {
    try {
      const saved = localStorage.getItem('fluencia_voice_mode');
      return (saved as VoiceEngineMode) || 'browser';
    } catch {
      return 'browser';
    }
  });
  const [selectedAIVoice, setSelectedAIVoice] = useState<string>(() => {
    try {
      return localStorage.getItem('fluencia_ai_voice') || 'Kore';
    } catch {
      return 'Kore';
    }
  });
  const [speed, setSpeed] = useState<number>(() => {
    try {
      const s = localStorage.getItem('fluencia_speed');
      return s ? Number(s) : 1.0;
    } catch {
      return 1.0;
    }
  });
  const [pitch, setPitch] = useState<number>(() => {
    try {
      const p = localStorage.getItem('fluencia_pitch');
      return p ? Number(p) : 1.0;
    } catch {
      return 1.0;
    }
  });
  const [groupMode, setGroupMode] = useState<boolean>(() => {
    try {
      const g = localStorage.getItem('fluencia_group_mode');
      return g !== null ? g === 'true' : true;
    } catch {
      return true;
    }
  });
  const [highlightMode, setHighlightMode] = useState<'palavra' | 'grupo'>(() => {
    try {
      return (localStorage.getItem('fluencia_highlight_mode') as 'palavra' | 'grupo') || 'palavra';
    } catch {
      return 'palavra';
    }
  });
  const [showSlashes, setShowSlashes] = useState<boolean>(() => {
    try {
      const s = localStorage.getItem('fluencia_show_slashes');
      return s !== null ? s === 'true' : true;
    } catch {
      return true;
    }
  });
  const [timingOffset, setTimingOffset] = useState<number>(1.0);
  const [pauseDuration, setPauseDuration] = useState<PauseDuration>(() => {
    try {
      return (localStorage.getItem('fluencia_pause_duration') as PauseDuration) || 'media';
    } catch {
      return 'media';
    }
  });
  const [showDicas, setShowDicas] = useState<boolean>(false);

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedBrowserVoice, setSelectedBrowserVoice] = useState<SpeechSynthesisVoice | null>(null);

  // Setters com salvamento automático de preferências
  const changeVoiceMode = (mode: VoiceEngineMode) => {
    setVoiceMode(mode);
    try { localStorage.setItem('fluencia_voice_mode', mode); } catch {}
  };
  const changeAIVoice = (voiceId: string) => {
    setSelectedAIVoice(voiceId);
    try { localStorage.setItem('fluencia_ai_voice', voiceId); } catch {}
  };
  const changeBrowserVoice = (voice: SpeechSynthesisVoice) => {
    setSelectedBrowserVoice(voice);
    try { localStorage.setItem('fluencia_browser_voice_name', voice.name); } catch {}
  };
  const changeSpeed = (s: number) => {
    setSpeed(s);
    try { localStorage.setItem('fluencia_speed', String(s)); } catch {}
    if (engineRef.current) {
      engineRef.current.setSpeed(s);
    }
  };
  const changePitch = (p: number) => {
    setPitch(p);
    try { localStorage.setItem('fluencia_pitch', String(p)); } catch {}
  };
  const changePauseDuration = (p: PauseDuration) => {
    setPauseDuration(p);
    try { localStorage.setItem('fluencia_pause_duration', p); } catch {}
  };
  const changeHighlightMode = (m: 'palavra' | 'grupo') => {
    setHighlightMode(m);
    try { localStorage.setItem('fluencia_highlight_mode', m); } catch {}
  };
  const changeGroupMode = (g: boolean) => {
    setGroupMode(g);
    try { localStorage.setItem('fluencia_group_mode', String(g)); } catch {}
  };
  const changeShowSlashes = (s: boolean) => {
    setShowSlashes(s);
    try { localStorage.setItem('fluencia_show_slashes', String(s)); } catch {}
  };

  const textContainerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLSpanElement | null>(null);
  const activeGroupRef = useRef<HTMLSpanElement | null>(null);

  // Refs de estado para captura síncrona precisa no término do treino
  const textoSelecionadoRef = useRef(textoSelecionado);
  textoSelecionadoRef.current = textoSelecionado;
  const silentModeRef = useRef(silentMode);
  silentModeRef.current = silentMode;
  const voiceModeRef = useRef(voiceMode);
  voiceModeRef.current = voiceMode;
  const selectedAIVoiceRef = useRef(selectedAIVoice);
  selectedAIVoiceRef.current = selectedAIVoice;
  const selectedBrowserVoiceRef = useRef(selectedBrowserVoice);
  selectedBrowserVoiceRef.current = selectedBrowserVoice;
  const pauseDurationRef = useRef(pauseDuration);
  pauseDurationRef.current = pauseDuration;
  const highlightModeRef = useRef(highlightMode);
  highlightModeRef.current = highlightMode;

  const handleSalvarPerfil = (novoPerfil: PerfilAluno) => {
    setPerfilAluno(novoPerfil);
    try {
      localStorage.setItem('fluencia_perfil_aluno', JSON.stringify(novoPerfil));
    } catch {}
  };

  const handleAdicionarSessao = (sessao: SessaoTreino) => {
    setSessoesTreino((prev) => {
      const updated = [sessao, ...prev];
      try {
        localStorage.setItem('fluencia_sessoes_treino', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleRemoverSessao = (id: string) => {
    setSessoesTreino((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      try {
        localStorage.setItem('fluencia_sessoes_treino', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleResetarSessoes = () => {
    setSessoesTreino(SESSOES_PADRAO);
    try {
      localStorage.setItem('fluencia_sessoes_treino', JSON.stringify(SESSOES_PADRAO));
    } catch {}
  };

  // Processamento sintático e tokenização estruturada
  const { tokens, sentences, groups } = useMemo(() => {
    return tokenizeText(textoSelecionado.text, textoSelecionado.syntacticText);
  }, [textoSelecionado.text, textoSelecionado.syntacticText]);

  const activeGroupWordIndices = useMemo(() => {
    if (currentGroupIndex === -1) return new Set<number>();
    const activeGrp = groups.find((g) => g.groupIndex === currentGroupIndex);
    if (!activeGrp) return new Set<number>();
    return new Set<number>(activeGrp.words.map((w) => w.index));
  }, [currentGroupIndex, groups]);

  // Motor de fala com sincronização
  const engineRef = useRef<FluencySpeechEngine | null>(null);

  useEffect(() => {
    engineRef.current = new FluencySpeechEngine({
      onWordHighlight: (idx) => setCurrentWordIndex(idx),
      onGroupHighlight: (idx) => setCurrentGroupIndex(idx),
      onSentenceChange: (idx) => setCurrentSentenceIndex(idx),
      onAudioLoadingChange: (loading) => setIsAudioLoading(loading),
      onFinished: () => {
        setIsPlaying(false);
        setIsAudioLoading(false);
        setCurrentWordIndex(-1);
        setCurrentGroupIndex(-1);
        setCurrentSentenceIndex(-1);

        // Registro automático de sessão concluída no histórico de progresso
        const startTime = sessionStartTimeRef.current || Date.now();
        const elapsedSec = Math.max(3, Math.round((Date.now() - startTime) / 1000));
        const words = textoSelecionadoRef.current.text.split(/\s+/).filter(Boolean).length;
        const calculatedPPM = Math.max(20, Math.round((words / (elapsedSec / 60))));

        const novaSessao: SessaoTreino = {
          id: `sess-${Date.now()}`,
          dataHora: new Date().toISOString(),
          textoId: textoSelecionadoRef.current.id,
          textoTitulo: textoSelecionadoRef.current.title,
          nivel: textoSelecionadoRef.current.nivel,
          flesch: textoSelecionadoRef.current.leiturabilidade?.flesch ?? 65,
          totalPalavras: words,
          tempoSegundos: elapsedSec,
          velocidadePPM: calculatedPPM,
          modo: silentModeRef.current ? 'silencioso' : 'modelar',
          vozUtilizada: silentModeRef.current
            ? 'Guia Silencioso'
            : voiceModeRef.current === 'ai'
            ? selectedAIVoiceRef.current
            : (selectedBrowserVoiceRef.current?.name || 'Voz do Navegador'),
          pausaConfigurada: pauseDurationRef.current,
          modoDestaque: highlightModeRef.current,
          concluida: true,
          observacoes: `Leitura concluída com ${calculatedPPM} PPM em ${elapsedSec}s.`
        };

        handleAdicionarSessao(novaSessao);
        setNotificacaoConclusao({
          texto: textoSelecionadoRef.current.title,
          palavras: words,
          ppm: calculatedPPM
        });
      }
    });

    return () => {
      engineRef.current?.stop();
    };
  }, []);

  // Atualiza dados estruturados de texto no motor de fala somente quando o texto mudar
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setData(tokens, groups, sentences);
    }
  }, [tokens, groups, sentences]);

  // Atualiza configurações dinâmicas de voz, prosódia e velocidade sem resetar o texto
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setConfig(
        voiceMode,
        selectedAIVoice,
        speed,
        pitch,
        timingOffset,
        pauseDuration,
        selectedBrowserVoice
      );
    }
  }, [
    voiceMode,
    selectedAIVoice,
    speed,
    pitch,
    timingOffset,
    pauseDuration,
    selectedBrowserVoice
  ]);

  // Status da API de IA para suporte em repositórios clonados e implantações locais
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/ai-status')
      .then((res) => {
        if (!res.ok) throw new Error('status error');
        return res.json();
      })
      .then((data) => {
        const hasKey = Boolean(data.hasKey);
        setAiAvailable(hasKey);
        if (!hasKey) {
          // Se a chave não estiver configurada no repositório, usa a voz do dispositivo por padrão
          setVoiceMode('browser');
        }
      })
      .catch(() => {
        setAiAvailable(false);
        setVoiceMode('browser');
      });
  }, []);

  // Carregamento e sincronização contínua das vozes do navegador
  const loadVoices = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const voices = window.speechSynthesis.getVoices();
    setAvailableVoices(voices);

    const allPtVoices = voices.filter((v) => v.lang.startsWith('pt') || v.lang.startsWith('por'));
    const preferredPt = allPtVoices.filter((v) => !v.name.toLowerCase().includes('helena'));
    // Prefere não-Helena se existirem vozes modernas/neurais; se Helena for a única voz instalada (comum no Windows), mantém para não emudecer
    const ptVoices = preferredPt.length > 0 ? preferredPt : allPtVoices;

    if (ptVoices.length > 0) {
      const savedVoiceName = localStorage.getItem('fluencia_browser_voice_name');
      let targetVoice: SpeechSynthesisVoice | undefined;

      if (savedVoiceName) {
        targetVoice = ptVoices.find((v) => v.name === savedVoiceName);
      }
      if (!targetVoice && selectedBrowserVoice) {
        targetVoice = ptVoices.find(
          (v) => v.name === selectedBrowserVoice.name || v.voiceURI === selectedBrowserVoice.voiceURI
        );
      }
      if (!targetVoice) {
        targetVoice =
          ptVoices.find((v) => {
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
          ptVoices.find((v) => v.lang === 'pt-BR') ||
          ptVoices[0];
      }

      if (targetVoice) {
        setSelectedBrowserVoice(targetVoice);
      }
    }
  };

  useEffect(() => {
    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
      const t1 = setTimeout(loadVoices, 200);
      const t2 = setTimeout(loadVoices, 800);
      const t3 = setTimeout(loadVoices, 2000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, []);

  // Classifica e ordena as vozes em português
  const classifiedVoices: ClassifiedBrowserVoice[] = useMemo(() => {
    const allPtVoices = availableVoices.filter((v) => v.lang.startsWith('pt') || v.lang.startsWith('por'));
    const preferredPt = allPtVoices.filter((v) => !v.name.toLowerCase().includes('helena'));
    const ptVoices = preferredPt.length > 0 ? preferredPt : allPtVoices;

    const mapped = ptVoices
      .map(classifyBrowserVoice)
      .filter((item): item is ClassifiedBrowserVoice => item !== null);

    mapped.sort((a, b) => {
      if (a.isNeuralOrNatural && !b.isNeuralOrNatural) return -1;
      if (!a.isNeuralOrNatural && b.isNeuralOrNatural) return 1;
      return a.voice.name.localeCompare(b.voice.name);
    });
    return mapped;
  }, [availableVoices]);

  // Rolagem suave automática para manter o texto destacado sempre visível
  useEffect(() => {
    const targetElement =
      highlightMode === 'palavra'
        ? (activeWordRef.current || activeGroupRef.current)
        : (activeGroupRef.current || activeWordRef.current);

    if (targetElement && textContainerRef.current) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  }, [currentWordIndex, currentGroupIndex, highlightMode, groupMode]);

  const testBrowserVoice = (voice: SpeechSynthesisVoice) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance('Olá! Esta é a voz de teste do navegador para o treino de leitura.');
    u.voice = voice;
    u.lang = 'pt-BR';
    u.rate = speed;
    u.pitch = pitch;
    (window as any)._testUtterance = u;
    setTimeout(() => {
      window.speechSynthesis.speak(u);
    }, 20);
  };

  const testAIVoice = async (voiceId: string) => {
    try {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Olá! Sou uma voz neural de inteligência artificial, expressiva, natural e humana.',
          voiceName: voiceId
        })
      });
      if (!res.ok) throw new Error('Erro');
      const data = await res.json();
      if (data.audioBase64) {
        const audio = new Audio(`data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`);
        audio.playbackRate = speed;
        audio.play().catch(console.warn);
      }
    } catch (err) {
      console.warn('Erro ao testar voz de IA, testando com voz do dispositivo:', err);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        const u = new SpeechSynthesisUtterance('Voz IA não configurada neste repositório. Testando com a voz do dispositivo!');
        u.lang = 'pt-BR';
        if (selectedBrowserVoice) u.voice = selectedBrowserVoice;
        window.speechSynthesis.speak(u);
      }
    }
  };

  const togglePlay = (silent = false) => {
    if (isPlaying) {
      engineRef.current?.stop();
      setIsPlaying(false);
      setSilentMode(false);
      setIsAudioLoading(false);
      setCurrentWordIndex(-1);
      setCurrentGroupIndex(-1);
      return;
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }

    sessionStartTimeRef.current = Date.now();
    setSilentMode(silent);
    setIsPlaying(true);
    engineRef.current?.setConfig(
      voiceMode,
      selectedAIVoice,
      speed,
      pitch,
      timingOffset,
      pauseDuration,
      selectedBrowserVoice
    );
    engineRef.current?.start(silent);
  };

  const handleReset = () => {
    engineRef.current?.stop();
    setIsPlaying(false);
    setSilentMode(false);
    setIsAudioLoading(false);
    setCurrentWordIndex(-1);
    setCurrentGroupIndex(-1);
    setCurrentSentenceIndex(-1);
  };

  const speakSingleWord = (word: string, index: number) => {
    if (isPlaying || typeof window === 'undefined' || !window.speechSynthesis) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word.replace(/[.,!?;:«»"()]/g, ''));
    u.lang = 'pt-BR';
    u.rate = speed;
    u.pitch = pitch;
    if (selectedBrowserVoice) u.voice = selectedBrowserVoice;
    (window as any)._wordUtterance = u;
    setCurrentWordIndex(index);
    u.onend = () => setCurrentWordIndex(-1);
    u.onerror = () => setCurrentWordIndex(-1);
    setTimeout(() => {
      window.speechSynthesis.speak(u);
    }, 20);
  };

  const handleSelectTexto = (texto: TextoFluencia) => {
    handleReset();
    setTextoSelecionado(texto);
    setMostrarBiblioteca(false);
  };

  const handleSalvarTextoPersonalizado = () => {
    if (!customTextoConteudo.trim()) return;
    const rawInput = customTextoConteudo.trim();
    const hasSlashes = rawInput.includes('/');
    const cleanText = hasSlashes ? rawInput.replace(/\s*\/\s*/g, ' ') : rawInput;

    const words = cleanText.split(/\s+/).filter(Boolean).length;
    const novoTexto: TextoFluencia = {
      id: Date.now(),
      title: customTextoTitulo.trim() || 'Texto Personalizado',
      nivel: 'Intermediário',
      cor: 'blue',
      text: cleanText,
      syntacticText: hasSlashes ? rawInput : undefined,
      leiturabilidade: {
        flesch: 70,
        classificacao: 'Intermediário',
        anoEscolar: '5º e 6º ano',
        palavras: words,
        tempoLeituraSegundos: Math.round((words / 120) * 60)
      }
    };
    setTextoSelecionado(novoTexto);
    setMostrarCustomTexto(false);
    handleReset();
  };

  const handleAutoMarcarSintaxe = () => {
    if (!customTextoConteudo.trim()) return;
    const formatted = autoFormatSyntacticSlashes(customTextoConteudo);
    setCustomTextoConteudo(formatted);
  };

  // Funções de manipulação do logotipo
  const handleUploadLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecione um arquivo de imagem válido (PNG, JPG, SVG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        setLogoPersonalizado(dataUrl);
        try {
          localStorage.setItem('fluencia_custom_logo', dataUrl);
        } catch (err) {
          console.warn('LocalStorage com limite de cota, logo mantido na memória:', err);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRestaurarLogoPadrao = () => {
    setLogoPersonalizado(LOGO_SRC);
    try {
      localStorage.setItem('fluencia_custom_logo', LOGO_SRC);
    } catch {}
  };

  const handleRemoverLogo = () => {
    setLogoPersonalizado(null);
    try {
      localStorage.removeItem('fluencia_custom_logo');
    } catch {}
  };

  const handleSalvarAlturaLogo = (val: number) => {
    setLogoHeight(val);
    try {
      localStorage.setItem('fluencia_logo_height', String(val));
    } catch {}
  };

  const corNivelClasses: Record<string, string> = {
    teal: 'bg-teal-100 text-teal-800 border-teal-300',
    emerald: 'bg-teal-100 text-teal-800 border-teal-300',
    green: 'bg-teal-100 text-teal-800 border-teal-300',
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
    purple: 'bg-purple-100 text-purple-800 border-purple-300',
    rose: 'bg-rose-100 text-rose-800 border-rose-300',
    amber: 'bg-amber-100 text-amber-800 border-amber-300'
  };

  // Filtragem e ordenação por grau de leiturabilidade
  const textosFiltrados = useMemo(() => {
    let list = BIBLIOTECA_TEXTOS.filter((t) => {
      if (filtroNivel === 'todos') return true;
      const normalizedNivel = t.nivel.toLowerCase().replace(/\s+/g, '');
      const normalizedFiltro = filtroNivel.toLowerCase().replace(/\s+/g, '');
      if (normalizedFiltro === 'ensinomédio' || normalizedFiltro === 'desafiador') {
        return normalizedNivel.includes('médio') || normalizedNivel.includes('desafiador');
      }
      return normalizedNivel === normalizedFiltro;
    });

    switch (ordenacaoTextos) {
      case 'flesch-desc':
        return [...list].sort((a, b) => (b.leiturabilidade?.flesch ?? 50) - (a.leiturabilidade?.flesch ?? 50));
      case 'flesch-asc':
        return [...list].sort((a, b) => (a.leiturabilidade?.flesch ?? 50) - (b.leiturabilidade?.flesch ?? 50));
      case 'palavras-asc':
        return [...list].sort((a, b) => a.text.split(/\s+/).length - b.text.split(/\s+/).length);
      case 'palavras-desc':
        return [...list].sort((a, b) => b.text.split(/\s+/).length - a.text.split(/\s+/).length);
      case 'pedagogica':
      default:
        return [...list].sort((a, b) => a.id - b.id);
    }
  }, [filtroNivel, ordenacaoTextos]);

  const activeAIVoiceObj = AI_VOICES.find((v) => v.id === selectedAIVoice) || AI_VOICES[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50/40 to-sky-50 text-stone-800 p-2 sm:p-4 md:p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">

        {/* MODAL: BIBLIOTECA DE TEXTOS COM PROGRESSÃO DE LEITURABILIDADE */}
        {mostrarBiblioteca && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-amber-50 border-3 border-amber-500 rounded-2xl max-w-3xl w-full p-4 sm:p-6 max-h-[90vh] flex flex-col shadow-2xl">
              <div className="flex justify-between items-center pb-3 border-b border-amber-200">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-amber-950 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-amber-600" />
                    Biblioteca de Textos Graduados
                  </h2>
                  <p className="text-xs sm:text-sm text-amber-800">
                    {BIBLIOTECA_TEXTOS.length} textos estruturados por ordem de dificuldade e índice de leiturabilidade (Flesch)
                  </p>
                </div>
                <button
                  onClick={() => setMostrarBiblioteca(false)}
                  className="p-1 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Explicação pedagógica de leiturabilidade */}
              <div className="bg-amber-100/70 border border-amber-300 rounded-xl p-2.5 my-2 text-[11px] text-amber-950 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Critério de Leiturabilidade (Flesch adaptado ao Português):</strong> Índices acima de 75 indicam textos muito fáceis para anos iniciais (1º ao 4º ano); índices entre 60 e 74 trabalham a fluência intermediária (5º ao 6º ano); índices de 48 a 59 desenvolvem o fundamental II (7º ao 9º ano); e textos de Ensino Médio (Flesch 54 a 64) trazem temas modernos com períodos rítmicos para treino de velocidade, prosódia e pausas sem barreira de conteúdo.
                </div>
              </div>

              {/* Controles de Filtro e Ordenação */}
              <div className="py-2 space-y-2 border-b border-amber-200">
                {/* Filtros de nível */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold text-stone-600">Nível:</span>
                  {[
                    { id: 'todos', label: `Todos (${BIBLIOTECA_TEXTOS.length})` },
                    { id: 'muitofácil', label: '🟢 Muito Fácil (1º-2º ano)' },
                    { id: 'fácil', label: '🟢 Fácil (3º-4º ano)' },
                    { id: 'intermediário', label: '🔵 Intermediário (5º-6º ano)' },
                    { id: 'avançado', label: '🟣 Avançado (7º-9º ano)' },
                    { id: 'ensinomédio', label: '🌹 Ensino Médio' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFiltroNivel(f.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        filtroNivel === f.id
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white border border-amber-200 text-amber-900 hover:bg-amber-100'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Seletor de ordenação */}
                <div className="flex items-center gap-2 text-xs text-stone-700 flex-wrap">
                  <span className="font-semibold flex items-center gap-1">
                    <ArrowUpDown className="w-3.5 h-3.5 text-amber-700" />
                    Ordenar por:
                  </span>
                  {[
                    { id: 'pedagogica', label: 'Sequência Pedagógica' },
                    { id: 'flesch-desc', label: 'Maior Leiturabilidade (Fácil → Difícil)' },
                    { id: 'flesch-asc', label: 'Maior Complexidade (Difícil → Fácil)' },
                    { id: 'palavras-asc', label: 'Mais Curtos' },
                    { id: 'palavras-desc', label: 'Mais Longos' }
                  ].map((ord) => (
                    <button
                      key={ord.id}
                      onClick={() => setOrdenacaoTextos(ord.id as any)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-all cursor-pointer ${
                        ordenacaoTextos === ord.id
                          ? 'bg-amber-700 text-white border-amber-700'
                          : 'bg-amber-50 text-amber-950 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      {ord.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista de textos com métricas de leiturabilidade */}
              <div className="overflow-y-auto space-y-2.5 pr-1 flex-1 py-2">
                {textosFiltrados.map((texto) => {
                  const isSelected = textoSelecionado.id === texto.id;
                  const wordCount = texto.text.split(/\s+/).filter(Boolean).length;
                  const estTime = texto.leiturabilidade?.tempoLeituraSegundos ?? Math.round((wordCount / 120) * 60);

                  return (
                    <button
                      key={texto.id}
                      onClick={() => handleSelectTexto(texto)}
                      className={`w-full text-left p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-amber-600 bg-amber-100/90 shadow-md ring-2 ring-amber-400/50'
                          : 'border-amber-200/80 bg-white hover:border-amber-300 hover:bg-amber-50/70'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className="font-bold text-amber-950 text-base">
                              {texto.id}. {texto.title}
                            </span>
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                                corNivelClasses[texto.cor] || 'bg-amber-100 text-amber-800 border-amber-300'
                              }`}
                            >
                              {texto.nivel}
                            </span>
                            {texto.leiturabilidade && (
                              <>
                                <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                  📊 Flesch: {texto.leiturabilidade.flesch}/100 ({texto.leiturabilidade.classificacao})
                                </span>
                                <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-stone-100 text-stone-700 border border-stone-200">
                                  🎒 {texto.leiturabilidade.anoEscolar}
                                </span>
                              </>
                            )}
                          </div>
                          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                            {texto.text}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-stone-500 mt-2 font-medium">
                            <span>📝 {wordCount} palavras</span>
                            <span>⏱️ ~{estTime}s a 120 ppm</span>
                            <span className="text-amber-800 font-semibold">Grupos sintáticos demarcados ✓</span>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-600 text-white shrink-0 mt-1">
                            <Check className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* MODAL: VOZES EXPRESSIVAS & NATURAIS */}
        {mostrarVozes && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-purple-50 border-3 border-purple-400 rounded-2xl max-w-2xl w-full p-4 sm:p-6 max-h-[90vh] flex flex-col shadow-2xl">
              <div className="flex justify-between items-center pb-3 border-b border-purple-200">
                <div className="flex items-center gap-2">
                  <Mic2 className="w-6 h-6 text-purple-700" />
                  <div>
                    <h2 className="text-xl font-bold text-purple-950">Vozes Expressivas &amp; Naturais</h2>
                    <p className="text-xs text-purple-700">Escolha entre vozes neurais de IA humana ou do navegador</p>
                  </div>
                </div>
                <button
                  onClick={() => setMostrarVozes(false)}
                  className="p-1 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Seletor de Abas de Voz */}
              <div className="flex border-b border-purple-200 my-3 gap-2">
                <button
                  onClick={() => setAbaVozes('ai')}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                    abaVozes === 'ai'
                      ? 'border-purple-600 text-purple-900 bg-purple-100/70 rounded-t-lg'
                      : 'border-transparent text-stone-600 hover:text-purple-800'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Vozes de IA Ultra-Naturais (Gemini)</span>
                  <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px]">Recomendado</span>
                </button>
                <button
                  onClick={() => setAbaVozes('browser')}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
                    abaVozes === 'browser'
                      ? 'border-purple-600 text-purple-900 bg-purple-100/70 rounded-t-lg'
                      : 'border-transparent text-stone-600 hover:text-purple-800'
                  }`}
                >
                  <Radio className="w-4 h-4 text-purple-600" />
                  <span>Vozes do Dispositivo ({classifiedVoices.length})</span>
                </button>
              </div>

              {/* CONTEÚDO DA ABA DE IA */}
              {abaVozes === 'ai' && (
                <div className="overflow-y-auto space-y-2.5 pr-1 flex-1 py-1">
                  {aiAvailable === false && (
                    <div className="bg-amber-100 border-2 border-amber-400 rounded-xl p-3 text-xs text-amber-950 space-y-1.5 shadow-2xs">
                      <div className="font-bold flex items-center gap-1.5 text-amber-950 text-sm">
                        <Info className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>Como habilitar as Vozes de IA no seu Repositório:</span>
                      </div>
                      <p className="text-stone-700 leading-relaxed">
                        No seu repositório local, crie um arquivo <code className="bg-amber-200/80 px-1 py-0.5 rounded font-mono">.env</code> contendo sua chave <code className="bg-amber-200/80 px-1 py-0.5 rounded font-mono">GEMINI_API_KEY=sua_chave</code> e inicie o projeto com <code className="bg-amber-200/80 px-1 py-0.5 rounded font-mono">npm run dev</code>.
                      </p>
                      <div className="bg-purple-100/90 border border-purple-300 rounded-lg p-2 text-purple-950 font-medium">
                        👉 <strong>Prefere sem chave de API e sem configuração?</strong> Clique na aba <strong>"Vozes do Dispositivo"</strong> acima para usar a fala nativa do seu navegador/computador 100% gratuita e offline!
                      </div>
                    </div>
                  )}

                  <div className="bg-amber-100/70 border border-amber-300 rounded-xl p-3 text-xs text-amber-950">
                    <strong>✨ Máxima Expressividade:</strong> Estas vozes usam inteligência artificial avançada para ler com emoção, respiração natural e entonação de contador de histórias, sem soar robóticas.
                  </div>

                  {AI_VOICES.map((voice) => {
                    const isSelected = voiceMode === 'ai' && selectedAIVoice === voice.id;
                    return (
                      <div
                        key={voice.id}
                        className={`p-3.5 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-purple-600 bg-purple-100 shadow-md ring-2 ring-purple-300'
                            : 'border-purple-200 bg-white hover:bg-purple-50/70'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-purple-950 text-sm">{voice.name}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-200 text-purple-900">
                                {voice.style}
                              </span>
                              <span className="text-[10px] text-stone-500 capitalize">
                                ({voice.gender})
                              </span>
                            </div>
                            <p className="text-xs text-stone-600 leading-relaxed">{voice.description}</p>
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            <button
                              onClick={() => testAIVoice(voice.id)}
                              className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              title="Ouvir amostra desta voz"
                            >
                              🔊 Ouvir
                            </button>
                            <button
                              onClick={() => {
                                changeVoiceMode('ai');
                                changeAIVoice(voice.id);
                                setMostrarVozes(false);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-purple-700 text-white'
                                  : 'bg-purple-200 text-purple-900 hover:bg-purple-300'
                              }`}
                            >
                              {isSelected ? '✓ Em uso' : 'Usar'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* CONTEÚDO DA ABA DO NAVEGADOR */}
              {abaVozes === 'browser' && (
                <div className="overflow-y-auto space-y-2.5 pr-1 flex-1 py-1">
                  {/* Controle de Tom (Pitch) para humanizar vozes do navegador */}
                  <div className="bg-white border border-purple-200 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-purple-600" />
                        Tom da Voz (Entonação):
                      </span>
                      <span className="text-xs text-purple-700 font-semibold">
                        {pitch === 0.9 ? 'Suave / Grave' : pitch === 1.1 ? 'Clara / Jovem' : 'Padrão'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {[
                        { p: 0.9, label: 'Suave & Acolhedora (0.9)' },
                        { p: 1.0, label: 'Natural Padrão (1.0)' },
                        { p: 1.1, label: 'Clara & Vivaz (1.1)' }
                      ].map((item) => (
                        <button
                          key={item.p}
                          onClick={() => changePitch(item.p)}
                          className={`flex-1 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                            pitch === item.p
                              ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                              : 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {classifiedVoices.length === 0 ? (
                    <div className="bg-rose-50 border-2 border-rose-300 rounded-xl p-4 text-center">
                      <p className="text-rose-900 font-bold text-sm">
                        Nenhuma voz em português encontrada no navegador.
                      </p>
                      <p className="text-xs text-rose-700 mt-2">
                        Recomendamos usar a aba <strong>Vozes de IA Ultra-Naturais</strong> acima!
                      </p>
                    </div>
                  ) : (
                    classifiedVoices.map(({ voice, isNeuralOrNatural, qualityLabel }) => {
                      const isSelected =
                        voiceMode === 'browser' && selectedBrowserVoice?.name === voice.name;
                      return (
                        <div
                          key={voice.name}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            isSelected
                              ? 'border-purple-600 bg-purple-100 shadow-sm'
                              : isNeuralOrNatural
                              ? 'border-teal-300 bg-teal-50/60 hover:bg-teal-50'
                              : 'border-purple-200 bg-white hover:bg-purple-50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="font-bold text-purple-950 text-sm truncate">{voice.name}</p>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    isNeuralOrNatural
                                      ? 'bg-teal-200 text-teal-900 border border-teal-300'
                                      : 'bg-stone-200 text-stone-700'
                                  }`}
                                >
                                  {qualityLabel}
                                </span>
                              </div>
                              <p className="text-xs text-purple-700">{voice.lang}</p>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                              <button
                                onClick={() => testBrowserVoice(voice)}
                                className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              >
                                🔊 Testar
                              </button>
                              <button
                                onClick={() => {
                                  changeVoiceMode('browser');
                                  changeBrowserVoice(voice);
                                  setMostrarVozes(false);
                                }}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-purple-700 text-white'
                                    : 'bg-purple-200 text-purple-900 hover:bg-purple-300'
                                }`}
                              >
                                {isSelected ? '✓ Em uso' : 'Usar'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Seção Pedagógica: Pausas nos Pontos Finais */}
              <div className="mt-3 pt-3 border-t border-purple-200 bg-purple-50/70 p-3 rounded-xl">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                    ⏸️ Tempo de Pausa nos Pontos Finais (. ! ?):
                  </span>
                  <span className="text-[11px] text-purple-800 font-medium">
                    Respiração e cadência expressiva
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'curta', label: 'Curta (0.6s)', desc: 'Pausa rápida para leitores ágeis' },
                    { id: 'media', label: '⭐ Média (1.1s)', desc: 'Recomendada pela Fga. Mara Daher' },
                    { id: 'longa', label: 'Longa (1.6s)', desc: 'Pausa prolongada para apoio respiratório' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => changePauseDuration(p.id as PauseDuration)}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                        pauseDuration === p.id
                          ? 'bg-purple-700 text-white border-purple-700 shadow-xs ring-2 ring-purple-300'
                          : 'bg-white text-purple-950 border-purple-200 hover:bg-purple-100/60'
                      }`}
                    >
                      <div className="font-bold text-xs">{p.label}</div>
                      <div className={`text-[10px] mt-0.5 ${pauseDuration === p.id ? 'text-purple-200' : 'text-stone-500'}`}>
                        {p.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: TEXTO PERSONALIZADO */}
        {mostrarCustomTexto && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-amber-50 border-3 border-amber-500 rounded-2xl max-w-xl w-full p-4 sm:p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold text-amber-950 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-600" />
                  Inserir Texto Próprio
                </h2>
                <button
                  onClick={() => setMostrarCustomTexto(false)}
                  className="p-1 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-amber-100 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-xs text-amber-800 mb-3">
                Cole qualquer parágrafo ou história para treinar com a mesma sincronização precisa e grupos sintáticos.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Título do Texto:</label>
                  <input
                    type="text"
                    value={customTextoTitulo}
                    onChange={(e) => setCustomTextoTitulo(e.target.value)}
                    placeholder="Ex: Minha História de Treino"
                    className="w-full px-3 py-2 text-sm bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Conteúdo do Texto:</label>
                  <textarea
                    rows={6}
                    value={customTextoConteudo}
                    onChange={(e) => setCustomTextoConteudo(e.target.value)}
                    placeholder="Digite ou cole aqui o texto (você pode usar barras / para delimitar sintagmas)..."
                    className="w-full px-3 py-2 text-sm bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-serif leading-relaxed"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                    <button
                      type="button"
                      onClick={handleAutoMarcarSintaxe}
                      disabled={!customTextoConteudo.trim()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
                      title="Analisar a gramática do texto e inserir as barras / automaticamente"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                      <span>Sugerir Grupos Sintáticos (Inserir Barras /)</span>
                    </button>
                    <span className="text-[11px] text-amber-800 font-medium">
                      {customTextoConteudo.includes('/') ? '✓ Contém barras ( / )' : 'Texto contínuo (auto-sintaxe)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800 mt-1.5 leading-relaxed">
                    💡 <strong>Dica de Sintaxe:</strong> Você pode usar a barra <code>/</code> para definir exatamente os cortes dos grupos sintáticos para leitura (ex: <em>A lua / não tem luz própria / e brilha / porque reflete / a luz do sol.</em>). Se não usar barras, o botão acima organiza automaticamente ou você pode treinar diretamente!
                  </p>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setMostrarCustomTexto(false)}
                    className="px-4 py-2 text-xs font-bold text-stone-600 bg-stone-200 hover:bg-stone-300 rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSalvarTextoPersonalizado}
                    className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm cursor-pointer"
                  >
                    Salvar e Praticar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: GERENCIAR E INSERIR LOGOTIPO */}
        {mostrarModalLogo && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-amber-50 border-3 border-amber-500 rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold text-amber-950 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-amber-600" />
                  Inserir / Personalizar Logotipo
                </h2>
                <button
                  onClick={() => setMostrarModalLogo(false)}
                  className="p-1 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-amber-100 cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <p className="text-xs text-amber-900 mb-4 leading-relaxed">
                Você pode inserir o logotipo da sua escola, clínica fonoaudiológica, consultório ou projeto pedagógico. Ele ficará salvo e visível no topo da aplicação.
              </p>

              {/* Área de Visualização e Ajuste */}
              <div className="bg-white border-2 border-dashed border-amber-300 rounded-xl p-4 flex flex-col items-center justify-center min-h-[140px] mb-4 relative overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                {logoPersonalizado ? (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={logoPersonalizado}
                      alt="Logo Pré-visualização"
                      style={{ height: `${logoHeight}px` }}
                      className="w-auto object-contain max-w-full drop-shadow-xs"
                    />
                    <span className="text-[11px] text-stone-500 font-medium">Pré-visualização da logo atual</span>
                  </div>
                ) : (
                  <div className="text-center text-stone-500 py-4">
                    <ImageIcon className="w-10 h-10 mx-auto text-amber-400 mb-1" />
                    <p className="text-xs font-semibold">Nenhum logotipo selecionado</p>
                    <p className="text-[11px] text-stone-400">Clique no botão abaixo para carregar uma imagem</p>
                  </div>
                )}
              </div>

              {/* Controles de Tamanho */}
              {logoPersonalizado && (
                <div className="mb-4 bg-amber-100/60 p-3 rounded-xl border border-amber-200">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-700" />
                      Tamanho da Logo no Cabeçalho:
                    </span>
                    <span className="text-xs font-bold text-amber-800">{logoHeight}px</span>
                  </div>
                  <input
                    type="range"
                    min="36"
                    max="84"
                    step="2"
                    value={logoHeight}
                    onChange={(e) => handleSalvarAlturaLogo(Number(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-amber-800 font-semibold mt-1">
                    <span>Compacto (36px)</span>
                    <span>Padrão (56px)</span>
                    <span>Destaque (84px)</span>
                  </div>
                </div>
              )}

              {/* Botões de Ação de Upload */}
              <input
                ref={logoFileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleUploadLogo}
                className="hidden"
              />

              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <button
                  onClick={() => logoFileInputRef.current?.click()}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>{logoPersonalizado ? 'Escolher Outra Imagem' : 'Carregar Meu Logo (PNG/JPG)'}</span>
                </button>

                <button
                  onClick={handleRestaurarLogoPadrao}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  title="Restaurar logotipo padrão"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Logo Padrão</span>
                </button>

                {logoPersonalizado && (
                  <button
                    onClick={handleRemoverLogo}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                    title="Remover logotipo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remover</span>
                  </button>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-amber-200">
                <button
                  onClick={() => setMostrarModalLogo(false)}
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl shadow-xs cursor-pointer"
                >
                  Concluir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CABEÇALHO COM ESPAÇO PARA LOGOTIPO PERSONALIZADO */}
        <header className="bg-white border-2 border-amber-200 rounded-2xl p-3 sm:p-4 shadow-sm flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-3">
            {logoPersonalizado ? (
              <div
                onClick={() => setMostrarModalLogo(true)}
                className="relative group cursor-pointer"
                title="Clique para alterar ou inserir seu próprio logotipo"
              >
                <img
                  src={logoPersonalizado}
                  alt="Logotipo"
                  style={{ height: `${logoHeight}px` }}
                  className="w-auto object-contain drop-shadow-xs transition-transform group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-black/45 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold gap-1 pointer-events-none">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Alterar</span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setMostrarModalLogo(true)}
                className="border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/70 hover:bg-amber-100/80 rounded-xl px-3 py-2 flex items-center gap-2 text-amber-900 text-xs font-bold transition-all cursor-pointer shadow-xs"
                title="Inserir logotipo próprio"
              >
                <ImageIcon className="w-5 h-5 text-amber-600" />
                <div className="text-left">
                  <div className="font-bold">Inserir Meu Logo</div>
                  <div className="text-[10px] text-amber-700 font-normal">PNG, JPG ou SVG</div>
                </div>
              </button>
            )}

            <div>
              <h1 className="text-base sm:text-lg font-bold text-amber-950 leading-tight">
                Treino de Fluência
              </h1>
              <p className="text-xs text-amber-800 font-medium">
                Leitura Guiada &amp; Sincronização Sintática
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMostrarModalLogo(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="Inserir ou gerenciar seu logotipo"
            >
              <ImageIcon className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Meu Logo</span>
            </button>

            <button
              onClick={() => setMostrarCustomTexto(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="Inserir texto personalizado com ou sem barras /"
            >
              <Edit3 className="w-4 h-4 text-amber-700" />
              <span>Novo Texto</span>
            </button>

            <button
              onClick={() => setMostrarBiblioteca(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Textos ({BIBLIOTECA_TEXTOS.length})</span>
            </button>

            <button
              onClick={() => setMostrarRelatorio(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer border border-emerald-500/50"
              title="Gerar e Exportar Relatório PDF de Progresso"
            >
              <FileText className="w-4 h-4 text-emerald-100" />
              <span>Relatório PDF</span>
              {sessoesTreino.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white/25 text-white">
                  {sessoesTreino.length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* BARRA DE IDENTIFICAÇÃO RÁPIDA: PACIENTE & DATA DA AVALIAÇÃO */}
        <div className="bg-gradient-to-r from-amber-100/90 via-amber-50 to-amber-100/90 border-2 border-amber-300/80 rounded-2xl p-2.5 sm:px-4 sm:py-2 flex flex-wrap items-center justify-between gap-2.5 shadow-2xs">
          <div className="flex items-center gap-2 flex-1 min-w-[260px]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 shrink-0">
              <User className="w-4 h-4 text-amber-700" />
              <span>Paciente / Aluno:</span>
            </div>
            <input
              type="text"
              value={perfilAluno.nome}
              onChange={(e) => {
                const novo = { ...perfilAluno, nome: e.target.value };
                handleSalvarPerfil(novo);
              }}
              placeholder="Digite o nome do paciente..."
              className="flex-1 max-w-sm px-3 py-1 text-xs font-bold bg-white border border-amber-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 shrink-0">
              <Calendar className="w-4 h-4 text-amber-700" />
              <span>Data:</span>
            </div>
            <input
              type="text"
              value={perfilAluno.dataAvaliacao || perfilAluno.dataInicio || new Date().toLocaleDateString('pt-BR')}
              onChange={(e) => {
                const novo = { ...perfilAluno, dataAvaliacao: e.target.value };
                handleSalvarPerfil(novo);
              }}
              placeholder="DD/MM/AAAA"
              className="w-28 text-center px-2 py-1 text-xs font-bold bg-white border border-amber-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
            />

            <button
              onClick={() => setMostrarRelatorio(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="Abrir o relatório de fluência com o nome e data deste paciente"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Gerar Relatório</span>
            </button>
          </div>
        </div>

        {/* NOTIFICAÇÃO DE CONCLUSÃO DE TREINO */}
        {notificacaoConclusao && (
          <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white p-3 rounded-2xl shadow-md flex items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-emerald-200" />
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm">
                  Parabéns! Leitura concluída: "{notificacaoConclusao.texto}"
                </div>
                <div className="text-[11px] text-emerald-100">
                  {notificacaoConclusao.palavras} palavras a {notificacaoConclusao.ppm} PPM &bull; Registrado no histórico de progresso!
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setMostrarRelatorio(true)}
                className="px-3 py-1.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-700" />
                <span>Ver Relatório PDF</span>
              </button>
              <button
                onClick={() => setNotificacaoConclusao(null)}
                className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* PAINEL DE CONTROLES COMPACTO - MÁXIMO ESPAÇO PARA O TEXTO NA TELA */}
        <div className="bg-amber-50/95 border-2 border-amber-200/90 rounded-2xl p-2.5 sm:p-3 space-y-2 shadow-xs">
          {/* Linha 1: Botões Principais de Reprodução & Acesso a Vozes */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {/* Botão Voz + Destaque */}
              <button
                onClick={() => togglePlay(false)}
                disabled={isAudioLoading}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm text-white shadow-xs transition-all cursor-pointer ${
                  isPlaying && !silentMode
                    ? 'bg-rose-600 hover:bg-rose-700 ring-2 ring-rose-300'
                    : 'bg-orange-500 hover:bg-orange-600 active:scale-98'
                }`}
              >
                {isAudioLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Carregando Voz...</span>
                  </>
                ) : isPlaying && !silentMode ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pausar</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Voz + Destaque</span>
                  </>
                )}
              </button>

              {/* Botão Só Destaque */}
              <button
                onClick={() => togglePlay(true)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs sm:text-sm text-white shadow-xs transition-all cursor-pointer ${
                  isPlaying && silentMode
                    ? 'bg-rose-600 hover:bg-rose-700 ring-2 ring-rose-300'
                    : 'bg-purple-600 hover:bg-purple-700 active:scale-98'
                }`}
              >
                {isPlaying && silentMode ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pausar</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>Só Destaque</span>
                  </>
                )}
              </button>

              {/* Botão Reiniciar */}
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1 px-2.5 py-2 bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                title="Reiniciar leitura do início"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reiniciar</span>
              </button>
            </div>

            {/* Botão Configurar Vozes & Prosódia (Com Resumo em Tempo Real) */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setMostrarVozes(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                title="Configurações completas de voz, tom e tempo de pausa"
              >
                <Mic2 className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  {voiceMode === 'ai'
                    ? `✨ Voz: ${activeAIVoiceObj.name.split(' ')[0]}`
                    : `🌐 Voz: ${selectedBrowserVoice?.name.split(' ')[0] || 'Sistema'}`}
                </span>
                <span className="hidden sm:inline px-1.5 py-0.5 rounded-md bg-purple-900/60 text-[10px] text-amber-200 font-semibold">
                  ⏸️ {pauseDuration === 'curta' ? '0.6s' : pauseDuration === 'longa' ? '1.6s' : '1.1s'}
                </span>
              </button>
            </div>
          </div>

          {/* Linha 2: Barra Pedagógica Integrada Compacta (Destaque, Visual, Velocidade e Pausa no Ponto) */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-amber-100/75 rounded-xl border border-amber-300 text-xs">
            {/* Bloco 1: Modo de Destaque */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-amber-950 hidden sm:inline mr-0.5">Destaque:</span>
              <button
                onClick={() => {
                  changeHighlightMode('grupo');
                  changeGroupMode(true);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  highlightMode === 'grupo'
                    ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-300'
                    : 'bg-white/80 text-stone-700 hover:bg-white border border-amber-200'
                }`}
                title="Destaca o grupo de palavras (sintagma inteiro) como uma unidade de sentido"
              >
                <span>📦 Sintagma (Grupo)</span>
              </button>
              <button
                onClick={() => changeHighlightMode('palavra')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  highlightMode === 'palavra'
                    ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-300'
                    : 'bg-white/80 text-stone-700 hover:bg-white border border-amber-200'
                }`}
                title="Destaca palavra por palavra individualmente em tempo real"
              >
                <span>🔤 Palavra a Palavra</span>
              </button>
            </div>

            {/* Bloco 2: Organização Visual */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-teal-950 hidden sm:inline mr-0.5">Organização:</span>
              <button
                onClick={() => {
                  if (isPlaying) handleReset();
                  changeGroupMode(true);
                  changeHighlightMode('grupo');
                }}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  groupMode && highlightMode === 'grupo'
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'bg-white/80 text-stone-700 hover:bg-white border border-teal-200'
                }`}
                title="Exibe e destaca o texto organizado em sintagmas (grupos de palavras)"
              >
                📦 Sintagmas
              </button>
              <button
                onClick={() => {
                  if (isPlaying) handleReset();
                  changeGroupMode(false);
                }}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !groupMode
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'bg-white/80 text-stone-700 hover:bg-white border border-teal-200'
                }`}
                title="Exibe o texto contínuo como parágrafo tradicional"
              >
                📄 Contínuo
              </button>
              {groupMode && (
                <button
                  onClick={() => changeShowSlashes(!showSlashes)}
                  className={`px-1.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                    showSlashes
                      ? 'bg-amber-200/90 border-amber-400 text-amber-950'
                      : 'bg-white/80 border-stone-300 text-stone-500'
                  }`}
                  title="Exibir ou ocultar as barras ( / ) de separação de sintagmas"
                >
                  {showSlashes ? 'Barras: ( / )' : 'Barras: Off'}
                </button>
              )}
            </div>

            {/* Bloco 3: Velocidade Compacta */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-orange-950 hidden sm:inline mr-0.5">Velocidade:</span>
              {[
                { v: 0.7, l: '0.7x' },
                { v: 1.0, l: '1.0x' },
                { v: 1.2, l: '1.2x' },
                { v: 1.5, l: '1.5x' }
              ].map((opt) => (
                <button
                  key={opt.v}
                  onClick={() => changeSpeed(opt.v)}
                  className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    speed === opt.v
                      ? 'bg-orange-600 text-white shadow-2xs'
                      : 'bg-white/80 text-orange-950 hover:bg-white border border-orange-200'
                  }`}
                >
                  {opt.l}
                </button>
              ))}
            </div>

            {/* Bloco 4: Pausa nos Pontos Finais (Compacto em linha, sem ocupar espaço vertical!) */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-teal-950 hidden sm:inline mr-0.5" title="Duração do descanso nos pontos finais (. ! ?)">
                Pausa:
              </span>
              {[
                { id: 'curta', label: '0.6s', title: 'Pausa rápida (0.6s)' },
                { id: 'media', label: '⭐ 1.1s', title: 'Pausa recomendada Mara Daher (1.1s)' },
                { id: 'longa', label: '1.6s', title: 'Pausa prolongada (1.6s)' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => changePauseDuration(p.id as PauseDuration)}
                  className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    pauseDuration === p.id
                      ? 'bg-teal-700 text-white shadow-2xs'
                      : 'bg-white/80 text-teal-950 hover:bg-white border border-teal-200'
                  }`}
                  title={p.title}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Linha 3: Barra de Diagnóstico / Status Super Discreta (1 linha fina) */}
          <div className="flex flex-wrap items-center justify-between text-[10px] text-stone-500 px-1 pt-0.5">
            <span>
              <strong>Status:</strong>{' '}
              {isAudioLoading ? (
                <span className="text-amber-700 font-bold">Sintetizando Voz Neural...</span>
              ) : isPlaying ? (
                <span className="text-teal-700 font-bold">{silentMode ? '👀 Treino Solo' : '🔊 Voz Sincronizada'}</span>
              ) : (
                '⏹️ Pronto'
              )}
            </span>
            <span>
              {voiceMode === 'ai'
                ? `✨ Voz IA: ${activeAIVoiceObj.name.split(' ')[0]}`
                : `🌐 ${selectedBrowserVoice?.name.split(' ')[0] || 'Navegador'}`}{' '}
              &bull; Pausa:{' '}
              {pauseDuration === 'curta' ? '0.6s' : pauseDuration === 'longa' ? '1.6s' : '1.1s'} &bull;{' '}
              {highlightMode === 'palavra' ? 'Destaque: Palavra a Palavra' : 'Destaque: Sintagma (Grupo)'}
            </span>
          </div>
        </div>

        {/* ÁREA PRINCIPAL DO TEXTO COM DESTAQUE SINCRONIZADO */}
        <main
          ref={textContainerRef}
          className="bg-white border-2 border-amber-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4"
        >
          {/* Cabeçalho do Texto */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 flex-wrap gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-amber-950">
                {textoSelecionado.title}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {sentences.length} frases &bull; {tokens.length} palavras &bull;{' '}
                {groups.length} grupos sintáticos
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  corNivelClasses[textoSelecionado.cor] || 'bg-blue-100 text-blue-800'
                }`}
              >
                {textoSelecionado.nivel}
              </span>
              <button
                onClick={() => setMostrarRelatorio(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                title="Abrir Relatório de Progresso em PDF"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Progresso</span>
              </button>
            </div>
          </div>

          {/* Corpo do Texto: Renderização Dinâmica (Palavra ou Grupo) */}
          <div className="text-lg sm:text-xl leading-loose font-serif text-stone-800 tracking-wide select-none">
            {groupMode ? (
              // MODO GRUPOS SINTÁTICOS (Com destaque configurável por bloco ou palavra a palavra)
              <div className="flex flex-wrap items-baseline gap-y-2.5 sm:gap-y-3 leading-loose">
                {groups.map((grp, grpIdx) => {
                  const isGroupActive = currentGroupIndex === grp.groupIndex;
                  const isLastInSentence = grp.words.length > 0 && grp.words[grp.words.length - 1].hasPeriod;
                  const isLastOverall = grpIdx === groups.length - 1;

                  const isGroupHighlighted = isGroupActive && highlightMode === 'grupo';

                  // No modo palavra a palavra, o grupo de palavras NÃO possui moldura, borda ou caixa de fundo.
                  // O destaque foca unicamente na palavra ativa, atendendo à orientação fonoaudiológica.
                  const groupClasses =
                    highlightMode === 'palavra'
                      ? 'inline-flex flex-wrap items-baseline bg-transparent border-0 ring-0 shadow-none px-0 py-0'
                      : isGroupHighlighted
                      ? 'inline-flex flex-wrap items-baseline px-2 py-0.5 rounded-xl bg-amber-300 text-amber-950 font-bold shadow-md ring-2 ring-amber-500 scale-102 transition-all duration-150 cursor-pointer'
                      : 'inline-flex flex-wrap items-baseline px-1 py-0.5 rounded-lg bg-transparent text-stone-800 hover:bg-amber-100/60 transition-colors cursor-pointer';

                  return (
                    <React.Fragment key={grp.groupIndex}>
                      <span
                        ref={highlightMode === 'grupo' && isGroupActive ? activeGroupRef : null}
                        className={groupClasses}
                      >
                        {grp.words.map((w, wIdx) => {
                          const isWordActive = currentWordIndex === w.index;
                          const isWordHighlighted = highlightMode === 'palavra' && isWordActive;

                          return (
                            <React.Fragment key={w.index}>
                              <span
                                ref={isWordHighlighted ? activeWordRef : null}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  speakSingleWord(w.word, w.index);
                                }}
                                className={`inline px-1 py-0.5 rounded-md transition-all duration-100 cursor-pointer ${
                                  isWordHighlighted
                                    ? 'bg-amber-400 text-amber-950 font-black shadow-md ring-2 ring-amber-500 scale-105'
                                    : 'hover:underline hover:text-amber-900'
                                }`}
                                title="Clique para ouvir esta palavra"
                              >
                                {w.word}
                              </span>
                              {wIdx < grp.words.length - 1 && (
                                <span className="inline select-none">&nbsp;</span>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </span>

                      {/* Separador entre grupos sintáticos */}
                      {!isLastOverall && (
                        showSlashes ? (
                          <span
                            className={`mx-1.5 sm:mx-2 font-bold select-none text-base sm:text-lg transition-colors ${
                              isLastInSentence
                                ? 'text-amber-600/90 font-black'
                                : 'text-amber-500/80'
                            }`}
                            title={isLastInSentence ? 'Fim de frase (pausa no ponto final)' : 'Pausa de sintagma'}
                          >
                            /
                          </span>
                        ) : (
                          <span className="inline select-none">&nbsp;&nbsp;</span>
                        )
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            ) : (
              // MODO TEXTO CONTÍNUO
              <div className="flex flex-wrap items-baseline gap-y-1">
                {tokens.map((tk) => {
                  const isWordActive = currentWordIndex === tk.index;
                  const isInActiveGroup = activeGroupWordIndices.has(tk.index);
                  const isHighlighted =
                    highlightMode === 'palavra'
                      ? isWordActive
                      : isInActiveGroup;

                  return (
                    <span
                      key={tk.index}
                      ref={
                        highlightMode === 'palavra'
                          ? (isWordActive ? activeWordRef : null)
                          : (isWordActive ? activeGroupRef : null)
                      }
                      onClick={() => speakSingleWord(tk.word, tk.index)}
                      className={`inline-block px-1.5 py-0.5 mx-0.5 my-0.5 rounded-lg transition-all duration-100 cursor-pointer ${
                        isHighlighted
                          ? 'bg-amber-400 text-amber-950 font-bold shadow-md ring-2 ring-amber-500 scale-105'
                          : 'bg-transparent text-stone-800 hover:bg-amber-100/60'
                      }`}
                      title="Clique para ouvir esta palavra"
                    >
                      {tk.word}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dicas Pedagógicas de Treino (Retrátil para priorizar a área de texto) */}
          <div className="mt-3 bg-teal-50/70 border border-teal-200 rounded-xl overflow-hidden text-xs text-teal-900">
            <button
              onClick={() => setShowDicas(!showDicas)}
              className="w-full px-3 py-2 flex items-center justify-between font-bold text-teal-950 hover:bg-teal-100/60 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Orientações Pedagógicas de Leitura &amp; Sintaxe</span>
              </span>
              <span className="flex items-center gap-1 text-[11px] text-teal-700 font-semibold">
                {showDicas ? 'Ocultar' : 'Ver dicas'}
                {showDicas ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </span>
            </button>

            {showDicas && (
              <div className="px-3 pb-3 pt-1 border-t border-teal-100 space-y-1 bg-white/60">
                <ul className="list-disc list-inside space-y-1 text-teal-800 text-[11px] leading-relaxed">
                  <li>
                    <strong>🔤 Destaque Palavra a Palavra:</strong> Acompanha em tempo real cada vocábulo individualmente, permitindo treinar a leitura sequencial com foco pontual mantendo a estrutura de sintagmas e barras ( / ).
                  </li>
                  <li>
                    <strong>📦 Destaque Bloco Sintático:</strong> Ilumina o sintagma completo como uma unidade de sentido, exercitando a fixação ocular por blocos de significado.
                  </li>
                  <li>
                    <strong>⏸️ Pausa nos Pontos Finais:</strong> Permite à criança respirar entre sentenças e processar o conteúdo antes do próximo período.
                  </li>
                  <li>
                    <strong>👀 Só Destaque:</strong> Modo silencioso para leitura autônoma pelo aluno no ritmo sincronizado.
                  </li>
                </ul>
              </div>
            )}
          </div>
        </main>

        {/* MODAL: RELATÓRIO PDF DE PROGRESSO E EVOLUÇÃO */}
        <ModalRelatorioProgresso
          isOpen={mostrarRelatorio}
          onClose={() => setMostrarRelatorio(false)}
          perfil={perfilAluno}
          onSalvarPerfil={handleSalvarPerfil}
          sessoes={sessoesTreino}
          onAdicionarSessao={handleAdicionarSessao}
          onRemoverSessao={handleRemoverSessao}
          onResetarSessoes={handleResetarSessoes}
          textoAtual={textoSelecionado}
          logoPersonalizado={logoPersonalizado}
          speed={speed}
        />

      </div>
    </div>
  );
}
