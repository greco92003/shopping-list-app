import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltam as variáveis de ambiente do Supabase. Verifique o arquivo .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para a tabela shopping_items
export interface ShoppingItem {
  id: string;
  text: string;
  checked: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShoppingItemInsert {
  text: string;
  checked?: boolean;
}

export interface ShoppingItemUpdate {
  text?: string;
  checked?: boolean;
}

