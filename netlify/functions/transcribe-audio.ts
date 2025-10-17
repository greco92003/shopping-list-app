import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import OpenAI from "openai";
import { toFile } from "openai/uploads";
import { Readable } from "stream";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Variável secreta do Netlify (sem prefixo VITE_)
});

interface TranscribeResponse {
  transcription: string;
  items: string[];
}

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  // Apenas aceita POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    console.log("🎤 Netlify Function iniciada");

    // Verifica se a API key está configurada
    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ OpenAI API key não configurada");
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify({
          error:
            "OpenAI API key não configurada no Netlify. Configure a variável OPENAI_API_KEY.",
        }),
      };
    }

    console.log("✅ OpenAI API key encontrada");

    // Parse do body (base64 encoded audio)
    if (!event.body) {
      console.error("❌ Body vazio");
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify({ error: "Request body is required" }),
      };
    }

    const { audioData, mimeType } = JSON.parse(event.body);
    console.log("📦 Dados recebidos:", {
      hasAudioData: !!audioData,
      audioDataLength: audioData?.length || 0,
      mimeType: mimeType || "não especificado",
    });

    if (!audioData) {
      console.error("❌ audioData não fornecido");
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify({ error: "Audio data is required" }),
      };
    }

    // Converte base64 para buffer
    const audioBuffer = Buffer.from(audioData, "base64");

    // Valida tamanho mínimo do áudio (10KB)
    const MIN_AUDIO_SIZE = 10 * 1024; // 10KB
    if (audioBuffer.length < MIN_AUDIO_SIZE) {
      console.log("Áudio muito pequeno:", audioBuffer.length, "bytes");
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify({
          error: "Áudio muito curto. Grave por pelo menos 1 segundo.",
        }),
      };
    }

    // Prepara o áudio para envio
    console.log("📦 Preparando áudio...");
    console.log("Tamanho do áudio:", audioBuffer.length, "bytes");
    console.log("Tipo MIME:", mimeType || "audio/webm");

    // Determina a extensão do arquivo baseado no mimeType
    let fileExtension = "webm";
    if (mimeType) {
      if (mimeType.includes("mp4")) fileExtension = "mp4";
      else if (mimeType.includes("wav")) fileExtension = "wav";
      else if (mimeType.includes("ogg")) fileExtension = "ogg";
      else if (mimeType.includes("mp3")) fileExtension = "mp3";
    }

    // Cria o arquivo de áudio
    // Tenta usar toFile (Node 20+), se falhar usa abordagem alternativa
    let audioFile;
    try {
      console.log("🔄 Tentando usar toFile (Node 20+)...");
      audioFile = await toFile(audioBuffer, `audio.${fileExtension}`, {
        type: mimeType || "audio/webm",
      });
      console.log("✅ toFile funcionou!");
    } catch (error) {
      console.log("⚠️ toFile falhou, usando abordagem alternativa...");
      // Fallback para Node < 20: cria um objeto File-like manualmente
      const stream = Readable.from(audioBuffer);
      audioFile = {
        name: `audio.${fileExtension}`,
        type: mimeType || "audio/webm",
        stream: () => stream,
      } as any;
      console.log("✅ Abordagem alternativa configurada!");
    }

    // 1. Transcreve o áudio usando Whisper
    console.log("Transcrevendo áudio...");
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "pt",
      prompt:
        "Lista de compras: arroz, feijão, maçã, banana, leite, pão, tomate, cebola, alho, batata, carne, frango, peixe, queijo, manteiga, café, açúcar, sal, óleo, azeite",
    });

    console.log("Transcrição:", transcription.text);

    // 2. Interpreta o texto e extrai itens usando GPT
    console.log("Interpretando itens...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
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
Maçã`,
        },
        {
          role: "user",
          content: transcription.text,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content?.trim() || "";

    // Divide por linhas e remove linhas vazias
    const items = response
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    console.log("Itens extraídos:", items);

    // Se não houver itens, retorna erro específico
    if (items.length === 0) {
      console.log(
        "Nenhum item identificado na transcrição:",
        transcription.text
      );
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify({
          error:
            "Nenhum item de compra foi identificado. Tente falar mais claramente.",
          transcription: transcription.text,
        }),
      };
    }

    // Retorna o resultado
    const result: TranscribeResponse = {
      transcription: transcription.text,
      items,
    };

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Permite CORS
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error("❌ Erro na function:", error);

    // Log detalhado do erro
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    // Mensagens de erro mais específicas
    let errorMessage = "Erro ao processar áudio";
    let errorDetails = "";

    if (error instanceof Error) {
      errorDetails = error.message;

      // Erros específicos da OpenAI
      if (error.message.includes("API key")) {
        errorMessage = "Erro de autenticação com OpenAI. Verifique a API key.";
      } else if (error.message.includes("quota")) {
        errorMessage = "Limite de uso da OpenAI excedido.";
      } else if (error.message.includes("rate limit")) {
        errorMessage = "Muitas requisições. Aguarde um momento.";
      } else if (error.message.includes("timeout")) {
        errorMessage = "Timeout ao processar áudio. Tente novamente.";
      } else {
        errorMessage = `Erro: ${error.message}`;
      }
    }

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({
        error: errorMessage,
        details: errorDetails,
      }),
    };
  }
};
