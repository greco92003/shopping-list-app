export interface VoiceTranscriptionResult {
  transcription: string;
  items: string[];
}

/**
 * Processa áudio completo: transcreve e interpreta itens
 * Agora usa a Netlify Function ao invés de chamar OpenAI diretamente
 */
export async function processVoiceToItems(
  audioBlob: Blob
): Promise<VoiceTranscriptionResult> {
  try {
    // Converte o blob para base64
    const arrayBuffer = await audioBlob.arrayBuffer();
    const base64Audio = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    // Chama a Netlify Function
    const response = await fetch("/.netlify/functions/transcribe-audio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audioData: base64Audio,
        mimeType: audioBlob.type,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Erro ao processar áudio");
    }

    const result: VoiceTranscriptionResult = await response.json();
    return result;
  } catch (error) {
    console.error("Erro ao processar áudio:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Falha ao processar o áudio. Tente novamente."
    );
  }
}

/**
 * Verifica se a OpenAI está configurada
 * Agora sempre retorna true pois a configuração está no backend
 */
export function isOpenAIConfigured(): boolean {
  return true; // A configuração agora está na Netlify Function
}
