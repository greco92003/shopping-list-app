# Configuração de Transcrições de Voz

## O que foi implementado

Agora o sistema salva **as transcrições de texto** no Supabase quando você usa a funcionalidade de voz. Isso permite:

1. ✅ Armazenar o texto completo que foi falado
2. ✅ Guardar os itens extraídos da transcrição
3. ✅ Vincular cada item da lista à transcrição original
4. ✅ Ver histórico de todas as transcrições

## Passo 1: Criar a tabela no Supabase

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New Query**
5. Copie todo o conteúdo do arquivo `supabase-transcriptions.sql`
6. Cole no editor SQL
7. Clique em **Run** (ou pressione Ctrl+Enter)

## O que a tabela armazena

### Tabela `voice_transcriptions`
- `id` (UUID) - Identificador único da transcrição
- `transcription` (TEXT) - Texto completo transcrito do áudio
- `items_extracted` (TEXT[]) - Array com os itens extraídos
- `created_at` (TIMESTAMP) - Data e hora da transcrição

### Atualização na tabela `shopping_items`
- `transcription_id` (UUID, opcional) - Vincula o item à transcrição de origem

## Como funciona

### Fluxo quando você grava um áudio:

1. 🎤 Você grava o áudio pelo botão de microfone
2. 🔄 O áudio é enviado para a Netlify Function
3. 🤖 A OpenAI transcreve o áudio e extrai os itens
4. 💾 **A transcrição é salva no Supabase** (NOVO!)
5. 📝 Cada item é adicionado à lista vinculado à transcrição
6. ✅ Você pode ver no console os logs de confirmação

### Exemplo de log no console:

```
📝 Transcrição recebida: "Preciso comprar arroz, feijão e maçã"
📦 Itens extraídos: ["Arroz", "Feijão", "Maçã"]
✅ Transcrição salva com ID: 123e4567-e89b-12d3-a456-426614174000
✅ 3 item(ns) adicionado(s) e vinculados à transcrição
```

## Verificar se está funcionando

### No Console do Navegador (F12):
Quando você gravar um áudio, deve ver:
- ✅ "Transcrição salva com ID: [uuid]"
- ✅ "X item(ns) adicionado(s) e vinculados à transcrição"

### No Supabase Dashboard:
1. Vá em **Table Editor**
2. Selecione a tabela `voice_transcriptions`
3. Você deve ver suas transcrições listadas com:
   - O texto completo que foi falado
   - Os itens extraídos
   - A data de criação

4. Selecione a tabela `shopping_items`
5. Os itens que vieram de áudio terão o campo `transcription_id` preenchido

## Consultar transcrições via código

```typescript
import { getAllTranscriptions } from '@/lib/shoppingService';

// Buscar todas as transcrições
const transcriptions = await getAllTranscriptions();

// Cada transcrição tem:
// - id: string
// - transcription: string (texto completo)
// - items_extracted: string[] (itens extraídos)
// - created_at: string (data de criação)
```

## Próximos passos (opcional)

Se quiser exibir o histórico de transcrições na interface:

1. Criar um componente `TranscriptionHistory.tsx`
2. Listar todas as transcrições com `getAllTranscriptions()`
3. Mostrar para o usuário o que foi falado e quando
4. Permitir reprocessar transcrições antigas

## Troubleshooting

### "Erro ao salvar transcrição"
- Verifique se você executou o SQL `supabase-transcriptions.sql`
- Confirme que a tabela `voice_transcriptions` existe no Supabase
- Verifique as políticas RLS (devem permitir INSERT)

### "Transcrição não aparece no Supabase"
- Abra o console do navegador (F12)
- Procure por erros em vermelho
- Verifique se vê a mensagem "✅ Transcrição salva com ID:"

### Itens são adicionados mas sem transcription_id
- Verifique se a coluna `transcription_id` foi adicionada à tabela `shopping_items`
- Execute novamente o SQL se necessário

