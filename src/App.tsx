import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Sun, Moon, Share } from "lucide-react";
import html2canvas from "html2canvas";

interface Item {
  id: number;
  text: string;
  checked: boolean;
}

export default function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Carrega a lista e o estado do darkMode do localStorage
  useEffect(() => {
    const storedItems = localStorage.getItem("shoppingList");
    if (storedItems) {
      try {
        setItems(JSON.parse(storedItems));
      } catch (error) {
        console.error("Erro ao carregar os itens do localStorage:", error);
      }
    }
    const storedDarkMode = localStorage.getItem("darkMode");
    if (storedDarkMode !== null) {
      setDarkMode(storedDarkMode === "true");
    }
  }, []);

  // Salva os itens no localStorage sempre que houver alterações
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem("shoppingList", JSON.stringify(items));
    }
  }, [items]);

  // Salva o estado do darkMode no localStorage
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  const capitalizeWords = (text: string) =>
    text
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

  const addItem = () => {
    if (inputValue.trim() !== "") {
      const newItem = {
        id: Date.now(),
        text: capitalizeWords(inputValue),
        checked: false,
      };
      setItems((prevItems) => [...prevItems, newItem]);
      setInputValue("");

      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Return") {
      e.preventDefault();
      addItem();
    }
  };

  const toggleChecked = (id: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const deleteItem = (id: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const clearList = () => {
    setItems([]);
    localStorage.removeItem("shoppingList");
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
          <Button onClick={addItem} className="bg-green-500 hover:bg-green-600">
            Adicionar
          </Button>
        </div>
        <Card
          className={
            darkMode ? "bg-black border-gray-700" : "bg-white border-gray-300"
          }
        >
          <CardContent className="p-4">
            {items.length === 0 ? (
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
    </div>
  );
}
