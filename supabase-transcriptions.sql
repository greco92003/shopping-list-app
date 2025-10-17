-- Criação da tabela voice_transcriptions para armazenar transcrições de áudio
CREATE TABLE IF NOT EXISTS voice_transcriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transcription TEXT NOT NULL,
  items_extracted TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE voice_transcriptions ENABLE ROW LEVEL SECURITY;

-- Política para permitir SELECT (leitura) para todos
CREATE POLICY "Permitir leitura para todos" ON voice_transcriptions
  FOR SELECT
  USING (true);

-- Política para permitir INSERT (criação) para todos
CREATE POLICY "Permitir inserção para todos" ON voice_transcriptions
  FOR INSERT
  WITH CHECK (true);

-- Política para permitir UPDATE (atualização) para todos
CREATE POLICY "Permitir atualização para todos" ON voice_transcriptions
  FOR UPDATE
  USING (true);

-- Política para permitir DELETE (exclusão) para todos
CREATE POLICY "Permitir exclusão para todos" ON voice_transcriptions
  FOR DELETE
  USING (true);

-- Adicionar campo opcional transcription_id na tabela shopping_items
-- para vincular itens às transcrições de voz
ALTER TABLE shopping_items 
ADD COLUMN IF NOT EXISTS transcription_id UUID REFERENCES voice_transcriptions(id) ON DELETE SET NULL;

-- Criar índice para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_shopping_items_transcription_id 
ON shopping_items(transcription_id);

CREATE INDEX IF NOT EXISTS idx_voice_transcriptions_created_at 
ON voice_transcriptions(created_at DESC);

