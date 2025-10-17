# 🚀 Configuração da OpenAI API Key no Netlify

## ✅ O que foi feito

A OpenAI API key agora está **protegida** e **não é mais exposta** no frontend!

### Mudanças implementadas:

1. ✅ **Criada Netlify Function** (`netlify/functions/transcribe-audio.ts`)

   - Processa o áudio no backend
   - Chama a OpenAI API de forma segura
   - A API key fica apenas no servidor

2. ✅ **Refatorado `src/lib/openaiService.ts`**

   - Agora chama a Netlify Function ao invés da OpenAI diretamente
   - Removido `dangerouslyAllowBrowser: true`
   - API key não é mais exposta no navegador

3. ✅ **Atualizado `.env.local` e `.env.example`**

   - Mudado de `VITE_OPENAI_API_KEY` para `OPENAI_API_KEY`
   - Sem prefixo `VITE_` = não é exposto no frontend

4. ✅ **Criado `netlify.toml`**

   - Configuração para as Netlify Functions

5. ✅ **Atualizado README.md**
   - Instruções completas de deploy

---

## 📋 Próximos Passos - Configure no Netlify

### 1. Acesse o Dashboard do Netlify

Vá para: https://app.netlify.com

### 2. Selecione seu site (shopping-list-app)

### 3. Configure as Variáveis de Ambiente

Acesse: **Site settings → Environment variables**

### 4. Adicione as 3 variáveis:

#### Variável 1: VITE_SUPABASE_URL

```
Key: VITE_SUPABASE_URL
Value: https://qzwdwqmioexgfayxidkl.supabase.co
Secret: ❌ NÃO marcar
Scopes: ✅ All scopes (ou apenas "Builds")
Values: ✅ Same value for all deploy contexts
```

#### Variável 2: VITE_SUPABASE_ANON_KEY

```
Key: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6d2R3cW1pb2V4Z2ZheXhpZGtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMjY5MzAsImV4cCI6MjA3NTcwMjkzMH0.9HJPTsld7yXmWF6k6nALZxxWtb9RLYoFFvjkjNR18Ck
Secret: ❌ NÃO marcar
Scopes: ✅ All scopes (ou apenas "Builds")
Values: ✅ Same value for all deploy contexts
```

#### Variável 3: OPENAI_API_KEY ⚠️ IMPORTANTE!

```
Key: OPENAI_API_KEY
Value: [COLE_SUA_CHAVE_OPENAI_AQUI]
Secret: ✅ MARCAR como Secret
Scopes: ✅ All scopes (ou "Functions" + "Builds")
Values: ✅ Same value for all deploy contexts
```

**⚠️ ATENÇÃO:**

- Use `OPENAI_API_KEY` (SEM o prefixo `VITE_`)
- **MARQUE** como "Secret" ✅
- Isso garante que a chave fica **apenas no backend**

**Onde encontrar sua chave OpenAI:**

1. Acesse: https://platform.openai.com/api-keys
2. Copie sua API key (começa com `sk-proj-...`)
3. Cole no campo "Value" no Netlify
4. **NUNCA** commite a chave no Git!

### 5. Faça um Novo Deploy

Após adicionar as variáveis:

**Opção A - Pelo Dashboard:**

1. Vá em **Deploys**
2. Clique em **Trigger deploy**
3. Selecione **Deploy site**

**Opção B - Pelo Git:**

1. Faça commit das mudanças:
   ```bash
   git add .
   git commit -m "feat: proteger OpenAI API key com Netlify Functions"
   git push
   ```
2. O Netlify fará deploy automaticamente

---

## 🧪 Como Testar

### Teste Local (antes de fazer deploy):

1. Certifique-se de que `.env.local` tem `OPENAI_API_KEY` (sem `VITE_`)

2. Instale o Netlify CLI:

   ```bash
   npm install -g netlify-cli
   ```

3. Execute localmente com Netlify Dev:

   ```bash
   netlify dev
   ```

4. Teste a funcionalidade de voz no app

### Teste em Produção (após deploy):

1. Acesse seu site no Netlify
2. Teste a funcionalidade de voz
3. Abra o DevTools → Console
4. Verifique que **não há** erros de API key
5. Abra DevTools → Network → Veja que a chamada vai para `/.netlify/functions/transcribe-audio`

---

## 🔍 Verificação de Segurança

### ✅ Como confirmar que a key está protegida:

1. Abra seu site em produção
2. Abra DevTools → Sources
3. Procure por "sk-proj" ou "openai" nos arquivos JavaScript
4. **Você NÃO deve encontrar** a API key em nenhum arquivo!

### ❌ Antes (INSEGURO):

```javascript
// A key estava visível no bundle JavaScript
const apiKey = "sk-proj-VM4YDeH..."; // ❌ EXPOSTO!
```

### ✅ Agora (SEGURO):

```javascript
// Apenas a URL da function está no código
fetch("/.netlify/functions/transcribe-audio", {...}); // ✅ SEGURO!
```

---

## 📊 Resumo das Variáveis

| Variável                 | Prefixo VITE\_ | Exposta no Frontend | Secret no Netlify | Onde é usada     |
| ------------------------ | -------------- | ------------------- | ----------------- | ---------------- |
| `VITE_SUPABASE_URL`      | ✅ Sim         | ✅ Sim (OK)         | ❌ Não            | Frontend         |
| `VITE_SUPABASE_ANON_KEY` | ✅ Sim         | ✅ Sim (OK)         | ❌ Não            | Frontend         |
| `OPENAI_API_KEY`         | ❌ Não         | ❌ Não (Seguro!)    | ✅ Sim            | Netlify Function |

---

## 🎯 Diferença Chave

### Antes:

```
Frontend → OpenAI API (com key exposta)
```

### Agora:

```
Frontend → Netlify Function → OpenAI API (key segura no backend)
```

---

## 💡 Dúvidas Comuns

**Q: Por que não usar `VITE_OPENAI_API_KEY`?**
A: Variáveis com `VITE_` são embutidas no bundle JavaScript e ficam visíveis no navegador.

**Q: A funcionalidade de voz ainda funciona igual?**
A: Sim! A experiência do usuário é idêntica, mas agora é segura.

**Q: Isso aumenta o custo?**
A: Não! Netlify Functions são gratuitas (125k requisições/mês no plano free).

**Q: E se eu esquecer de marcar como Secret?**
A: A variável ainda funcionará, mas não terá a proteção extra da UI do Netlify. O importante é que ela **não tem** o prefixo `VITE_`.

---

## ✅ Checklist Final

Antes de fazer deploy, confirme:

- [ ] Arquivo `netlify/functions/transcribe-audio.ts` criado
- [ ] Arquivo `netlify.toml` criado
- [ ] `src/lib/openaiService.ts` refatorado
- [ ] `.env.local` usa `OPENAI_API_KEY` (sem `VITE_`)
- [ ] `@netlify/functions` instalado
- [ ] Variáveis configuradas no Netlify
- [ ] `OPENAI_API_KEY` marcada como **Secret** ✅
- [ ] Novo deploy feito

---

## 🐛 Solução de Problemas

### Erro 500 ao processar áudio

Se você receber um erro 500 ao tentar gravar áudio, verifique:

1. **API Key configurada?**

   - Vá em **Site settings → Environment variables**
   - Confirme que `OPENAI_API_KEY` está configurada
   - Verifique se está marcada como **Secret**

2. **Verifique os logs da Function:**

   - Vá em **Netlify Dashboard → Functions → transcribe-audio → Logs**
   - Procure por mensagens de erro detalhadas
   - Erros comuns:
     - `OpenAI API key não configurada no Netlify` → Configure a variável
     - `Invalid API key` → Verifique se a chave está correta
     - `Insufficient quota` → Verifique seu saldo na OpenAI

3. **Faça um novo deploy:**
   - Após adicionar/corrigir variáveis, sempre faça um novo deploy
   - As variáveis só são aplicadas em novos deploys

---

## 🚀 Pronto!

Sua OpenAI API key agora está **100% protegida** e não será exposta no navegador! 🎉

Se tiver algum problema, verifique os logs da Netlify Function em:
**Netlify Dashboard → Functions → transcribe-audio → Logs**
