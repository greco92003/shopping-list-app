import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Sun, Moon, Share, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import { ShoppingItem } from "@/lib/supabase";
import {
  getAllItems,
  addItem as addItemToDb,
  deleteItem as deleteItemFromDb,
  clearAllItems,
  toggleItemChecked,
  saveVoiceTranscription,
} from "@/lib/shoppingService";
import { VoiceButton } from "@/components/VoiceButton";
import { processVoiceToItems, isOpenAIConfigured } from "@/lib/openaiService";
import { DebugPanel, DebugLog } from "@/components/DebugPanel";

export default function App() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingVoice, setProcessingVoice] = useState<boolean>(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Função para adicionar log de debug
  const addDebugLog = (
    type: DebugLog["type"],
    message: string,
    details?: string
  ) => {
    const timestamp = new Date().toLocaleTimeString("pt-BR");
    const log: DebugLog = { timestamp, type, message, details };
    setDebugLogs((prev) => [...prev, log]);
    console.log(
      `[${timestamp}] ${type.toUpperCase()}: ${message}`,
      details || ""
    );
  };

  // Função para limpar logs
  const clearDebugLogs = () => {
    setDebugLogs([]);
  };

  // Carrega os itens do Supabase e o darkMode do localStorage
  useEffect(() => {
    loadItems();

    const storedDarkMode = localStorage.getItem("darkMode");
    if (storedDarkMode !== null) {
      setDarkMode(storedDarkMode === "true");
    }
  }, []);

  // Salva o estado do darkMode no localStorage
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  // Função para carregar itens do Supabase
  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await getAllItems();
      setItems(data);
    } catch (error) {
      console.error("Erro ao carregar itens:", error);
    } finally {
      setLoading(false);
    }
  };

  const capitalizeWords = (text: string) =>
    text
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

  const addItem = async () => {
    if (inputValue.trim() !== "") {
      try {
        // Separa itens por vírgula
        const itemTexts = inputValue
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item.length > 0);

        // Adiciona cada item individualmente
        for (const itemText of itemTexts) {
          const newItem = await addItemToDb({
            text: capitalizeWords(itemText),
            checked: false,
          });
          setItems((prevItems) => [...prevItems, newItem]);
        }

        setInputValue("");

        if (inputRef.current) {
          inputRef.current.focus();
        }
      } catch (error) {
        console.error("Erro ao adicionar item:", error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Return") {
      e.preventDefault();
      addItem();
    }
  };

  const handleVoiceRecording = async (audioBlob: Blob) => {
    // Limpa logs anteriores
    clearDebugLogs();

    if (!isOpenAIConfigured()) {
      const errorMsg =
        "OpenAI não está configurada. Adicione a chave VITE_OPENAI_API_KEY no arquivo .env.local";
      setVoiceError(errorMsg);
      addDebugLog("error", "OpenAI não configurada", errorMsg);
      setTimeout(() => setVoiceError(null), 5000);
      return;
    }

    try {
      setProcessingVoice(true);
      setVoiceError(null);

      // Log 1: Informações do áudio
      addDebugLog(
        "info",
        "Áudio gravado",
        `Tamanho: ${audioBlob.size} bytes | Tipo: ${audioBlob.type}`
      );

      // Log 2: Enviando para processamento
      addDebugLog("info", "Enviando áudio para transcrição...");

      const result = await processVoiceToItems(audioBlob);

      // Log 3: Transcrição recebida
      addDebugLog(
        "success",
        "Transcrição recebida",
        `"${result.transcription}"`
      );

      if (result.items.length === 0) {
        const errorMsg = "Nenhum item foi identificado. Tente novamente.";
        setVoiceError(errorMsg);
        addDebugLog("warning", errorMsg);
        setTimeout(() => setVoiceError(null), 5000);
        return;
      }

      // Log 4: Itens extraídos
      addDebugLog(
        "success",
        `${result.items.length} itens extraídos`,
        result.items.join(", ")
      );

      // Log 5: Salvando transcrição
      addDebugLog("info", "Salvando transcrição no Supabase...");

      const savedTranscription = await saveVoiceTranscription({
        transcription: result.transcription,
        items_extracted: result.items,
      });

      // Log 6: Transcrição salva
      addDebugLog(
        "success",
        "Transcrição salva no Supabase",
        `ID: ${savedTranscription.id}`
      );

      // Log 7: Adicionando itens
      addDebugLog("info", "Adicionando itens à lista...");

      // 2. Adiciona cada item à lista, vinculando à transcrição
      for (const itemText of result.items) {
        const newItem = await addItemToDb({
          text: itemText,
          checked: false,
          transcription_id: savedTranscription.id,
        });
        setItems((prevItems) => [...prevItems, newItem]);
      }

      // Log 8: Sucesso final
      addDebugLog(
        "success",
        "Processo concluído!",
        `${result.items.length} item(ns) adicionado(s) e vinculados à transcrição`
      );
    } catch (error) {
      console.error("Erro ao processar voz:", error);

      // Extrai mensagem de erro mais específica
      let errorMessage = "Erro ao processar áudio";
      let errorDetails = "";

      if (error instanceof Error) {
        errorMessage = error.message;
        errorDetails = error.stack || "";
      }

      // Log de erro detalhado
      addDebugLog("error", errorMessage, errorDetails);

      setVoiceError(errorMessage);
      setTimeout(() => setVoiceError(null), 5000);
    } finally {
      setProcessingVoice(false);
    }
  };

  const toggleChecked = async (id: string) => {
    try {
      const item = items.find((item) => item.id === id);
      if (!item) return;

      const updatedItem = await toggleItemChecked(id, item.checked);
      setItems((prevItems) =>
        prevItems.map((item) => (item.id === id ? updatedItem : item))
      );
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await deleteItemFromDb(id);
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Erro ao deletar item:", error);
    }
  };

  const clearList = async () => {
    try {
      await clearAllItems();
      setItems([]);
    } catch (error) {
      console.error("Erro ao limpar lista:", error);
    }
  };

  // Função para capturar toda a tela e compartilhar a imagem
  const handleShare = async () => {
    // Certifique-se de que o container principal tenha o id "app-container"
    const element = document.getElementById("app-container");
    if (!element) return;

    try {
      // Captura toda a tela com html2canvas
      const canvas = await html2canvas(element);
      // Converte o canvas para blob utilizando canvas.toBlob()
      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error("Erro ao gerar o blob da imagem.");
          return;
        }

        // Cria um objeto File a partir do blob
        const file = new File([blob], "screenshot.png", { type: "image/png" });
        console.log("Arquivo criado:", file);

        // Verifica se o navegador suporta a Web Share API com arquivos
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: "Meu App",
              text: "Confira a tela do meu aplicativo!",
            });
          } catch (error) {
            console.error("Erro ao compartilhar a imagem:", error);
          }
        } else {
          // Fallback: se o compartilhamento nativo não for suportado, aciona o download da imagem
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "screenshot.png";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          alert(
            "Compartilhamento nativo não disponível. A imagem foi baixada para compartilhamento manual."
          );
        }
      }, "image/png");
    } catch (error) {
      console.error("Erro ao capturar a tela:", error);
    }
  };

  return (
    // O id "app-container" garante que toda a interface seja capturada
    <div
      id="app-container"
      className={`min-h-screen p-4 ${
        darkMode ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      <div className="max-w-md mx-auto">
        <div className="flex flex-col justify-between items-center mb-8">
          <img src="/logo.png" alt="Logo" className="w-auto h-10" />
        </div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl font-bold">Lista de Compras 🛒</h1>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>
            {/* Botão de Compartilhamento */}
            <Button variant="ghost" onClick={handleShare}>
              <Share className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Adicionar Item..."
            className={`w-full border ${
              darkMode ? "border-gray-700" : "border-gray-300 text-black"
            }`}
          />
          <VoiceButton
            onAudioRecorded={handleVoiceRecording}
            darkMode={darkMode}
            disabled={processingVoice}
          />
          <Button onClick={addItem} className="bg-green-500 hover:bg-green-600">
            Adicionar
          </Button>
        </div>

        {/* Feedback de processamento de voz */}
        {processingVoice && (
          <div
            className={`flex items-center gap-2 mb-4 p-3 rounded-lg ${
              darkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-800"
            }`}
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Processando áudio...</span>
          </div>
        )}

        {/* Mensagem de erro de voz */}
        {voiceError && (
          <div className="mb-4 p-3 rounded-lg bg-red-500 text-white text-sm">
            {voiceError}
          </div>
        )}
        <Card
          className={
            darkMode ? "bg-black border-gray-700" : "bg-white border-gray-300"
          }
        >
          <CardContent className="p-4">
            {loading ? (
              <p className="text-gray-500">Carregando...</p>
            ) : items.length === 0 ? (
              <p className="text-gray-500">Nenhum Item Na Lista.</p>
            ) : (
              <ul className="space-y-2">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className={`flex items-center gap-2 justify-between border p-2 rounded-lg ${
                      darkMode ? "border-gray-700" : "border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={item.checked}
                        onCheckedChange={() => toggleChecked(item.id)}
                        className={`${
                          darkMode
                            ? "text-white border-white"
                            : "text-black border-gray-400"
                        }`}
                      />
                      <span
                        className={
                          item.checked
                            ? `${
                                darkMode
                                  ? "line-through text-gray-400"
                                  : "line-through text-gray-600"
                              }`
                            : `${darkMode ? "text-white" : "text-black"}`
                        }
                      >
                        {item.text}
                      </span>
                    </div>
                    <Button variant="ghost" onClick={() => deleteItem(item.id)}>
                      <Trash2 className="w-4 h-4 text-red-500 hover:bg-gray-700" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        {items.length > 0 && (
          <Button
            className={`mt-4 w-full ${darkMode ? "bg-red-600" : "bg-red-500"}`}
            onClick={clearList}
            variant="destructive"
          >
            Limpar Lista
          </Button>
        )}
      </div>

      {/* Painel de Debug para iPhone */}
      <DebugPanel
        logs={debugLogs}
        onClear={clearDebugLogs}
        darkMode={darkMode}
      />
    </div>
  );
}
