import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import OpenAI from "openai";
import { toFile } from "openai/uploads";

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
    // Verifica se a API key está configurada
    if (!process.env.OPENAI_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "OpenAI API key não configurada no Netlify",
        }),
      };
    }

    // Parse do body (base64 encoded audio)
    const { audioData, mimeType } = JSON.parse(event.body || "{}");

    if (!audioData) {
      return {
        statusCode: 400,
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

    // Usa toFile para criar um objeto File compatível com a OpenAI SDK
    console.log("Preparando áudio...");
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

    const audioFile = await toFile(audioBuffer, `audio.${fileExtension}`, {
      type: mimeType || "audio/webm",
    });

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
    console.error("Erro na function:", error);

    // Log detalhado do erro
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({
        error: "Erro ao processar áudio",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};
