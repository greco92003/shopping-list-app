import { addItem } from './shoppingService';

interface LocalStorageItem {
  id: number;
  text: string;
  checked: boolean;
}

/**
 * Migra os itens do localStorage para o Supabase
 * Esta função deve ser executada apenas uma vez
 */
export async function migrateLocalStorageToSupabase(): Promise<void> {
  try {
    const storedItems = localStorage.getItem("shoppingList");
    
    if (!storedItems) {
      console.log("Nenhum item encontrado no localStorage para migrar.");
      return;
    }

    const items: LocalStorageItem[] = JSON.parse(storedItems);
    
    if (items.length === 0) {
      console.log("Lista vazia no localStorage.");
      return;
    }

    console.log(`Migrando ${items.length} itens do localStorage para o Supabase...`);

    // Adiciona cada item ao Supabase
    for (const item of items) {
      await addItem({
        text: item.text,
        checked: item.checked,
      });
    }

    console.log("Migração concluída com sucesso!");
    
    // Remove os itens do localStorage após migração bem-sucedida
    localStorage.removeItem("shoppingList");
    console.log("Dados removidos do localStorage.");
    
  } catch (error) {
    console.error("Erro ao migrar dados do localStorage:", error);
    throw error;
  }
}

