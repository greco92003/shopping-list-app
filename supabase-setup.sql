-- Criação da tabela shopping_items
CREATE TABLE IF NOT EXISTS shopping_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  checked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;

-- Política para permitir SELECT (leitura) para todos
CREATE POLICY "Permitir leitura para todos" ON shopping_items
  FOR SELECT
  USING (true);

-- Política para permitir INSERT (criação) para todos
CREATE POLICY "Permitir inserção para todos" ON shopping_items
  FOR INSERT
  WITH CHECK (true);

-- Política para permitir UPDATE (atualização) para todos
CREATE POLICY "Permitir atualização para todos" ON shopping_items
  FOR UPDATE
  USING (true);

-- Política para permitir DELETE (exclusão) para todos
CREATE POLICY "Permitir exclusão para todos" ON shopping_items
  FOR DELETE
  USING (true);

-- Função para atualizar automaticamente o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_shopping_items_updated_at
  BEFORE UPDATE ON shopping_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

