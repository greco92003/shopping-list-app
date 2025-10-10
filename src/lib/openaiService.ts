import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  console.warn('VITE_OPENAI_API_KEY não encontrada. Funcionalidade de voz não estará disponível.');
}

const openai = apiKey ? new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true // Necessário para uso no navegador
}) : null;

export interface VoiceTranscriptionResult {
  transcription: string;
  items: string[];
}

/**
 * Transcreve áudio usando Whisper API da OpenAI
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  if (!openai) {
    throw new Error('OpenAI não está configurada. Verifique a variável VITE_OPENAI_API_KEY.');
  }

  try {
    // Converte o blob para File (necessário para a API)
    const audioFile = new File([audioBlob], 'audio.webm', { type: audioBlob.type });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'pt', // Português
    });

    return transcription.text;
  } catch (error) {
    console.error('Erro ao transcrever áudio:', error);
    throw new Error('Falha ao transcrever o áudio. Tente novamente.');
  }
}

/**
 * Interpreta o texto transcrito e extrai itens de compras usando GPT
 */
export async function interpretShoppingItems(transcription: string): Promise<string[]> {
  if (!openai) {
    throw new Error('OpenAI não está configurada. Verifique a variável VITE_OPENAI_API_KEY.');
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Você é um assistente que extrai itens de lista de compras de textos em português.
Regras:
1. Extraia APENAS itens de compras mencionados
2. Retorne cada item em uma linha separada
3. Capitalize a primeira letra de cada palavra
4. Remova quantidades e detalhes desnecessários (mantenha apenas o nome do item)
5. Se não houver itens, retorne uma linha vazia
6. Normalize nomes similares (ex: "tomate" e "tomates" vira "Tomate")
7. Separe itens compostos se fizer sentido (ex: "arroz e feijão" vira duas linhas: "Arroz" e "Feijão")

Exemplos:
Entrada: "preciso comprar leite, pão e 2 quilos de tomate"
Saída:
Leite
Pão
Tomate

Entrada: "adiciona arroz e feijão na lista"
Saída:
Arroz
Feijão

Entrada: "coloca maçã"
Saída:
Maçã`
        },
        {
          role: 'user',
          content: transcription
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content?.trim() || '';
    
    if (!response) {
      return [];
    }

    // Divide por linhas e remove linhas vazias
    const items = response
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    return items;
  } catch (error) {
    console.error('Erro ao interpretar itens:', error);
    throw new Error('Falha ao interpretar os itens. Tente novamente.');
  }
}

/**
 * Processa áudio completo: transcreve e interpreta itens
 */
export async function processVoiceToItems(audioBlob: Blob): Promise<VoiceTranscriptionResult> {
  const transcription = await transcribeAudio(audioBlob);
  const items = await interpretShoppingItems(transcription);

  return {
    transcription,
    items,
  };
}

/**
 * Verifica se a OpenAI está configurada
 */
export function isOpenAIConfigured(): boolean {
  return openai !== null;
}

