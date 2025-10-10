# 🛒 Shopping List App

Uma aplicação moderna de lista de compras com funcionalidade de entrada por voz, desenvolvida com React, TypeScript, Supabase e OpenAI.

## ✨ Funcionalidades

- ✅ Adicionar, editar e remover itens da lista
- 🎤 **Adicionar itens por voz** (estilo WhatsApp)
  - Segurar o botão para gravar
  - Arrastar para cima para travar a gravação
  - Transcrição automática com OpenAI Whisper
  - Interpretação inteligente com GPT para extrair itens
- 🌓 Modo escuro/claro
- 📤 Compartilhar lista como imagem
- 💾 Persistência de dados com Supabase
- 📱 Design responsivo

## 🚀 Tecnologias

- **React 19** + **TypeScript**
- **Vite** - Build tool
- **Supabase** - Backend e banco de dados
- **OpenAI** - Whisper (transcrição) + GPT (interpretação)
- **Tailwind CSS** - Estilização
- **Shadcn/ui** - Componentes UI
- **Lucide React** - Ícones

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no [Supabase](https://supabase.com)
- Conta na [OpenAI](https://platform.openai.com) com créditos disponíveis

## ⚙️ Configuração

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd shopping-list-app
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Supabase

1. Crie um projeto no [Supabase](https://app.supabase.com)
2. Execute o SQL do arquivo `supabase-setup.sql` no SQL Editor do Supabase
3. Copie a URL e a chave anon do seu projeto

### 4. Configure a OpenAI

1. Acesse [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Crie uma nova API key
3. **Importante**: Adicione créditos à sua conta OpenAI (a API é paga)

### 5. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` e adicione suas credenciais:

```env
# Supabase
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase

# OpenAI
VITE_OPENAI_API_KEY=sua_chave_da_openai
```

### 6. Execute o projeto

```bash
npm run dev
```

Acesse `http://localhost:5173` no navegador.

## 🎤 Como usar a funcionalidade de voz

### No celular (touch):

1. **Segurar** o botão do microfone para começar a gravar
2. **Arrastar para cima** para travar a gravação (continua gravando)
3. **Soltar** para parar e processar (ou clicar em "Enviar" se travado)
4. **Arrastar para baixo** ou clicar em "Cancelar" para descartar

### No desktop (mouse):

1. **Segurar** o botão do microfone (mouse down)
2. **Soltar** para parar e processar

### Exemplos de comandos de voz:

- "Adiciona leite, pão e café"
- "Preciso comprar arroz, feijão e 2 quilos de tomate"
- "Coloca maçã na lista"
- "Adiciona chocolate"

O sistema irá:

1. Transcrever sua fala usando Whisper
2. Interpretar o texto com GPT
3. Extrair os itens mencionados
4. Adicionar automaticamente à lista

## 💰 Custos da API OpenAI

A funcionalidade de voz utiliza duas APIs da OpenAI:

- **Whisper API**: ~$0.006 por minuto de áudio
- **GPT-4o-mini**: ~$0.00015 por requisição (para interpretação)

**Custo estimado**: ~$0.01 por comando de voz de 10 segundos

## 🔒 Segurança

⚠️ **Importante**: Este projeto usa `dangerouslyAllowBrowser: true` para permitir chamadas à OpenAI diretamente do navegador. Isso é adequado para:

- Desenvolvimento local
- Projetos pessoais
- Protótipos

Para produção, recomenda-se:

- Criar um backend intermediário
- Não expor a API key da OpenAI no cliente
- Implementar rate limiting e autenticação

## 📱 Build para produção

```bash
npm run build
```

Os arquivos otimizados estarão na pasta `dist/`.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📄 Licença

MIT
