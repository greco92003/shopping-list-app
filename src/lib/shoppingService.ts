import { supabase, ShoppingItem, ShoppingItemInsert, ShoppingItemUpdate } from './supabase';

/**
 * Busca todos os itens da lista de compras
 */
export async function getAllItems(): Promise<ShoppingItem[]> {
  const { data, error } = await supabase
    .from('shopping_items')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Erro ao buscar itens:', error);
    throw error;
  }

  return data || [];
}

/**
 * Adiciona um novo item à lista
 */
export async function addItem(item: ShoppingItemInsert): Promise<ShoppingItem> {
  const { data, error } = await supabase
    .from('shopping_items')
    .insert(item)
    .select()
    .single();

  if (error) {
    console.error('Erro ao adicionar item:', error);
    throw error;
  }

  return data;
}

/**
 * Atualiza um item existente
 */
export async function updateItem(id: string, updates: ShoppingItemUpdate): Promise<ShoppingItem> {
  const { data, error } = await supabase
    .from('shopping_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar item:', error);
    throw error;
  }

  return data;
}

/**
 * Deleta um item da lista
 */
export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('shopping_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar item:', error);
    throw error;
  }
}

/**
 * Deleta todos os itens da lista
 */
export async function clearAllItems(): Promise<void> {
  const { error } = await supabase
    .from('shopping_items')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Deleta todos os registros

  if (error) {
    console.error('Erro ao limpar lista:', error);
    throw error;
  }
}

/**
 * Alterna o status checked de um item
 */
export async function toggleItemChecked(id: string, currentChecked: boolean): Promise<ShoppingItem> {
  return updateItem(id, { checked: !currentChecked });
}

