import { AIVoiceOption, ClassifiedBrowserVoice } from '../types';

export const AI_VOICES: AIVoiceOption[] = [
  {
    id: 'Kore',
    name: 'Beatriz (Kore)',
    gender: 'feminino',
    style: 'Expressiva & Narradora',
    description: 'Voz feminina rica em entonação dramática e ritmo natural de contação de histórias. Perfeita para treino de fluência.'
  },
  {
    id: 'Zephyr',
    name: 'Camila (Zephyr)',
    gender: 'feminino',
    style: 'Suave & Acolhedora',
    description: 'Voz feminina calorosa com cadência serena, articulação limpa e clareza pedagógica.'
  },
  {
    id: 'Puck',
    name: 'Gabriel (Puck)',
    gender: 'masculino',
    style: 'Jovem & Entusiasmado',
    description: 'Voz masculina jovem, alegre e dinâmica. Excelente para textos infantis, curiosidades e fábulas.'
  },
  {
    id: 'Charon',
    name: 'Eduardo (Charon)',
    gender: 'masculino',
    style: 'Profunda & Reflexiva',
    description: 'Voz masculina aveludada, firme e profunda. Ideal para textos científicos, históricos e reflexões.'
  },
  {
    id: 'Fenrir',
    name: 'Rodrigo (Fenrir)',
    gender: 'masculino',
    style: 'Firme & Cristalina',
    description: 'Voz masculina articulada com dicção cristalina e ritmo pausado pedagógico.'
  }
];

export function classifyBrowserVoice(voice: SpeechSynthesisVoice): ClassifiedBrowserVoice | null {
  const nameLower = voice.name.toLowerCase();

  // Remove vozes que o usuário explicitamente rejeita (ex: Microsoft Helena e variantes)
  if (nameLower.includes('helena')) {
    return null;
  }

  const isNeuralOrNatural =
    nameLower.includes('natural') ||
    nameLower.includes('online') ||
    nameLower.includes('neural') ||
    nameLower.includes('enhanced') ||
    nameLower.includes('premium') ||
    nameLower.includes('siri') ||
    nameLower.includes('luciana') ||
    nameLower.includes('felipe') ||
    nameLower.includes('joana');

  let qualityLabel = 'Voz Local (Sintetizador Padrão)';
  if (nameLower.includes('natural') || nameLower.includes('neural')) {
    qualityLabel = '🌟 Neural Natural (Ultra-Expressiva)';
  } else if (nameLower.includes('enhanced') || nameLower.includes('premium') || nameLower.includes('siri')) {
    qualityLabel = '💎 Alta Definição';
  } else if (nameLower.includes('google')) {
    qualityLabel = '🔊 Voz Básica do Navegador';
  }

  let genderEstimate: 'feminino' | 'masculino' | 'neutro' = 'neutro';
  if (
    nameLower.includes('maria') ||
    nameLower.includes('francisca') ||
    nameLower.includes('brenda') ||
    nameLower.includes('thalita') ||
    nameLower.includes('luciana') ||
    nameLower.includes('joana') ||
    nameLower.includes('camila') ||
    nameLower.includes('beatriz') ||
    nameLower.includes('female') ||
    nameLower.includes('mulher')
  ) {
    genderEstimate = 'feminino';
  } else if (
    nameLower.includes('antonio') ||
    nameLower.includes('donato') ||
    nameLower.includes('felipe') ||
    nameLower.includes('daniel') ||
    nameLower.includes('male') ||
    nameLower.includes('homem')
  ) {
    genderEstimate = 'masculino';
  }

  return {
    voice,
    isNeuralOrNatural,
    qualityLabel,
    genderEstimate
  };
}
