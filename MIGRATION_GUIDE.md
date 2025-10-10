# Guia de Migração - localStorage para Supabase

## ✅ Alterações Realizadas

A aplicação foi atualizada para usar o Supabase ao invés do localStorage para armazenar os itens da lista de compras.

### O que mudou:

1. **Armazenamento de Dados**
   - ❌ Antes: Dados salvos no localStorage do navegador
   - ✅ Agora: Dados salvos no banco de dados Supabase (PostgreSQL)

2. **Sincronização**
   - Os dados agora são sincronizados em tempo real com o banco de dados
   - Você pode acessar sua lista de qualquer dispositivo (futuramente com autenticação)

3. **Persistência**
   - Os dados não são mais perdidos ao limpar o cache do navegador
   - Backup automático no banco de dados

### O que NÃO mudou:

- ✅ O darkMode ainda é salvo no localStorage (preferência local)
- ✅ A interface e funcionalidades permanecem as mesmas

## 🔄 Migração de Dados Antigos (Opcional)

Se você tinha itens salvos no localStorage antes desta atualização, você pode migrá-los para o Supabase.

### Opção 1: Migração Manual via Console do Navegador

1. Abra o DevTools do navegador (F12)
2. Vá para a aba **Console**
3. Cole o seguinte código:

```javascript
// Importar a função de migração
import { migrateLocalStorageToSupabase } from './lib/migrateLocalStorage';

// Executar a migração
migrateLocalStorageToSupabase()
  .then(() => console.log('Migração concluída!'))
  .catch((error) => console.error('Erro na migração:', error));
```

### Opção 2: Adicionar Botão Temporário de Migração

Se preferir, você pode adicionar um botão temporário na interface para fazer a migração:

1. Abra o arquivo `src/App.tsx`
2. Adicione o import:
```typescript
import { migrateLocalStorageToSupabase } from "@/lib/migrateLocalStorage";
```

3. Adicione a função de migração:
```typescript
const handleMigration = async () => {
  if (confirm("Deseja migrar os dados do localStorage para o Supabase?")) {
    try {
      await migrateLocalStorageToSupabase();
      await loadItems(); // Recarrega os itens
      alert("Migração concluída com sucesso!");
    } catch (error) {
      alert("Erro ao migrar dados. Verifique o console.");
    }
  }
};
```

4. Adicione o botão na interface (temporariamente):
```tsx
<Button onClick={handleMigration}>
  Migrar Dados Antigos
</Button>
```

5. Após a migração, remova o botão e o código relacionado

## 🧪 Testando a Integração

1. **Adicionar um item**
   - Digite um item e clique em "Adicionar"
   - Verifique no Supabase Dashboard → Table Editor → shopping_items
   - O item deve aparecer na tabela

2. **Marcar/Desmarcar item**
   - Clique no checkbox de um item
   - Verifique no Supabase que o campo `checked` foi atualizado

3. **Deletar um item**
   - Clique no ícone de lixeira
   - Verifique no Supabase que o item foi removido

4. **Limpar lista**
   - Clique em "Limpar Lista"
   - Verifique no Supabase que todos os itens foram removidos

5. **Persistência**
   - Adicione alguns itens
   - Feche e reabra o navegador
   - Os itens devem continuar lá (carregados do Supabase)

## 🔍 Verificando Dados no Supabase

1. Acesse https://app.supabase.com
2. Selecione seu projeto
3. Vá em **Table Editor**
4. Clique na tabela `shopping_items`
5. Você verá todos os itens da sua lista

## ⚠️ Observações Importantes

- O localStorage agora é usado APENAS para salvar a preferência de darkMode
- Todos os itens da lista são salvos no Supabase
- Se você limpar o cache do navegador, os itens NÃO serão perdidos (estão no banco de dados)
- A migração do localStorage para Supabase é opcional e deve ser feita apenas uma vez

## 🚀 Próximos Passos Sugeridos

1. **Autenticação de Usuários**
   - Adicionar login/registro
   - Cada usuário terá sua própria lista

2. **Sincronização em Tempo Real**
   - Usar Supabase Realtime para atualizar a lista automaticamente

3. **Compartilhamento de Listas**
   - Permitir compartilhar listas entre usuários

4. **Categorias**
   - Adicionar categorias aos itens (frutas, laticínios, etc.)

5. **Histórico**
   - Manter histórico de compras anteriores

