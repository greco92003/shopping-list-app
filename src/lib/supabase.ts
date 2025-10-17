import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltam as variáveis de ambiente do Supabase. Verifique o arquivo .env.local"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para a tabela shopping_items
export interface ShoppingItem {
  id: string;
  text: string;
  checked: boolean;
  created_at: string;
  updated_at: string;
  transcription_id?: string | null;
}

export interface ShoppingItemInsert {
  text: string;
  checked?: boolean;
  transcription_id?: string | null;
}

export interface ShoppingItemUpdate {
  text?: string;
  checked?: boolean;
}

// Tipos para a tabela voice_transcriptions
export interface VoiceTranscription {
  id: string;
  transcription: string;
  items_extracted: string[];
  created_at: string;
}

export interface VoiceTranscriptionInsert {
  transcription: string;
  items_extracted: string[];
}
