import {
  supabase,
  ShoppingItem,
  ShoppingItemInsert,
  ShoppingItemUpdate,
  VoiceTranscription,
  VoiceTranscriptionInsert,
} from "./supabase";

/**
 * Busca todos os itens da lista de compras
 */
export async function getAllItems(): Promise<ShoppingItem[]> {
  const { data, error } = await supabase
    .from("shopping_items")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erro ao buscar itens:", error);
    throw error;
  }

  return data || [];
}

/**
 * Adiciona um novo item à lista
 */
export async function addItem(item: ShoppingItemInsert): Promise<ShoppingItem> {
  const { data, error } = await supabase
    .from("shopping_items")
    .insert(item)
    .select()
    .single();

  if (error) {
    console.error("Erro ao adicionar item:", error);
    throw error;
  }

  return data;
}

/**
 * Atualiza um item existente
 */
export async function updateItem(
  id: string,
  updates: ShoppingItemUpdate
): Promise<ShoppingItem> {
  const { data, error } = await supabase
    .from("shopping_items")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar item:", error);
    throw error;
  }

  return data;
}

/**
 * Deleta um item da lista
 */
export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase.from("shopping_items").delete().eq("id", id);

  if (error) {
    console.error("Erro ao deletar item:", error);
    throw error;
  }
}

/**
 * Deleta todos os itens da lista
 */
export async function clearAllItems(): Promise<void> {
  const { error } = await supabase
    .from("shopping_items")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // Deleta todos os registros

  if (error) {
    console.error("Erro ao limpar lista:", error);
    throw error;
  }
}

/**
 * Alterna o status checked de um item
 */
export async function toggleItemChecked(
  id: string,
  currentChecked: boolean
): Promise<ShoppingItem> {
  return updateItem(id, { checked: !currentChecked });
}

/**
 * Salva uma transcrição de voz no banco de dados
 */
export async function saveVoiceTranscription(
  transcription: VoiceTranscriptionInsert
): Promise<VoiceTranscription> {
  const { data, error } = await supabase
    .from("voice_transcriptions")
    .insert(transcription)
    .select()
    .single();

  if (error) {
    console.error("Erro ao salvar transcrição:", error);
    throw error;
  }

  console.log("✅ Transcrição salva no Supabase:", data.id);
  return data;
}

/**
 * Busca todas as transcrições de voz
 */
export async function getAllTranscriptions(): Promise<VoiceTranscription[]> {
  const { data, error } = await supabase
    .from("voice_transcriptions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar transcrições:", error);
    throw error;
  }

  return data || [];
}

/**
 * Busca uma transcrição específica por ID
 */
export async function getTranscriptionById(
  id: string
): Promise<VoiceTranscription | null> {
  const { data, error } = await supabase
    .from("voice_transcriptions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Erro ao buscar transcrição:", error);
    return null;
  }

  return data;
}
