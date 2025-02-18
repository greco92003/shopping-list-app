import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Sun, Moon } from "lucide-react";

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

  // 🔹 Carregar os itens do localStorage ANTES de renderizar
  useEffect(() => {
    const storedItems = localStorage.getItem("shoppingList");
    if (storedItems) {
      try {
        setItems(JSON.parse(storedItems));
      } catch (error) {
        console.error("Erro ao carregar localStorage:", error);
      }
    }
  }, []);

  // 🔹 Salvar itens no localStorage sempre que a lista for atualizada
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem("shoppingList", JSON.stringify(items));
    }
  }, [items]);

  const capitalizeWords = (text: string) => {
    return text
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const addItem = () => {
    if (inputValue.trim() !== "") {
      const newItem = { id: Date.now(), text: capitalizeWords(inputValue), checked: false };
      setItems(prevItems => [...prevItems, newItem]);
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
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const deleteItem = (id: number) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const clearList = () => {
    setItems([]);
    localStorage.removeItem("shoppingList"); // 🔹 Agora limpamos o localStorage corretamente
  };

  return (
    <div className={`min-h-screen p-4 ${darkMode ? "bg-black text-white" : "bg-white text-black"}`}>
      <div className="max-w-md mx-auto">
        <div className="flex flex-col justify-between items-center mb-8">
          <img src="/logo.png" alt="Logo" className="w-auto h-10" />
        </div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl font-bold">Lista de Compras 🛒</h1>
          <Button variant="ghost" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
        <div className="flex gap-2 mb-4">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Adicionar Item..."
            className={`w-full border ${darkMode ? "border-gray-700" : "border-gray-300 text-black"}`}
          />
          <Button onClick={addItem} className="bg-green-500 hover:bg-green-600">Adicionar</Button>
        </div>
        <Card className={darkMode ? "bg-black border-gray-700" : "bg-white border-gray-300"}>
          <CardContent className="p-4">
            {items.length === 0 ? (
              <p className="text-gray-500">Nenhum Item Na Lista.</p>
            ) : (
              <ul className="space-y-2">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className={`flex items-center gap-2 justify-between border p-2 rounded-lg ${darkMode ? "border-gray-700" : "border-gray-300"}`}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={item.checked}
                        onCheckedChange={() => toggleChecked(item.id)}
                        className={`${darkMode ? "text-white border-white" : "text-black border-gray-400"}`}
                      />
                      <span className={item.checked
                        ? `${darkMode ? "line-through text-gray-400" : "line-through text-gray-600"}`
                        : `${darkMode ? "text-white" : "text-black"}`
                      }>
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
