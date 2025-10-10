# Configuração do Supabase

## Passo 1: Criar a tabela no Supabase

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New Query**
5. Copie todo o conteúdo do arquivo `supabase-setup.sql`
6. Cole no editor SQL
7. Clique em **Run** (ou pressione Ctrl+Enter)

## Passo 2: Verificar a tabela criada

1. No menu lateral, clique em **Table Editor**
2. Você deve ver a tabela `shopping_items` listada
3. A tabela terá as seguintes colunas:
   - `id` (UUID) - Chave primária gerada automaticamente
   - `text` (TEXT) - Texto do item
   - `checked` (BOOLEAN) - Status de marcado/desmarcado
   - `created_at` (TIMESTAMP) - Data de criação
   - `updated_at` (TIMESTAMP) - Data da última atualização

## Estrutura da Tabela

```sql
shopping_items
├── id (UUID, PRIMARY KEY)
├── text (TEXT, NOT NULL)
├── checked (BOOLEAN, DEFAULT false)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## Políticas de Segurança (RLS)

A tabela está configurada com Row Level Security (RLS) habilitado e as seguintes políticas:

- ✅ **Leitura (SELECT)**: Permitido para todos
- ✅ **Inserção (INSERT)**: Permitido para todos
- ✅ **Atualização (UPDATE)**: Permitido para todos
- ✅ **Exclusão (DELETE)**: Permitido para todos

> **Nota**: Estas políticas permitem acesso público. Se você quiser adicionar autenticação no futuro, será necessário modificar essas políticas.

## Funcionalidades Automáticas

- O campo `updated_at` é atualizado automaticamente sempre que um registro é modificado
- O campo `id` é gerado automaticamente como UUID
- Os campos `created_at` e `updated_at` são preenchidos automaticamente com a data/hora atual

## Próximos Passos

Após criar a tabela, você pode:

1. Testar inserindo dados manualmente no Table Editor
2. Integrar a aplicação React com o Supabase usando o cliente já configurado em `src/lib/supabase.ts`
3. Migrar os dados do localStorage para o Supabase (se necessário)

