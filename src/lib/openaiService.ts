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
    console.log("🔄 Convertendo áudio para base64...");

    // Converte o blob para base64
    const arrayBuffer = await audioBlob.arrayBuffer();
    const base64Audio = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    console.log("📤 Enviando para Netlify Function...", {
      size: audioBlob.size,
      type: audioBlob.type,
      base64Length: base64Audio.length,
    });

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

    console.log("📥 Resposta recebida:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Erro da Netlify Function:", errorText);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }

      throw new Error(
        errorData.error ||
          `Erro HTTP ${response.status}: ${response.statusText}`
      );
    }

    const result: VoiceTranscriptionResult = await response.json();
    console.log("✅ Transcrição recebida da Netlify Function:", result);
    return result;
  } catch (error) {
    console.error("❌ Erro ao processar áudio:", error);

    // Mensagem de erro mais detalhada
    let errorMessage = "Falha ao processar o áudio";

    if (error instanceof Error) {
      errorMessage = error.message;

      // Erros específicos
      if (error.message.includes("Failed to fetch")) {
        errorMessage =
          "Erro de conexão. Verifique sua internet e tente novamente.";
      } else if (error.message.includes("NetworkError")) {
        errorMessage = "Erro de rede. Verifique sua conexão.";
      } else if (error.message.includes("500")) {
        errorMessage =
          "Erro no servidor. A API Key pode não estar configurada.";
      }
    }

    throw new Error(errorMessage);
  }
}

/**
 * Verifica se a OpenAI está configurada
 * Agora sempre retorna true pois a configuração está no backend
 */
export function isOpenAIConfigured(): boolean {
  return true; // A configuração agora está na Netlify Function
}
