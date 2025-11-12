# 🤖 Usando Google Gemini ao invés do OpenAI

O projeto suporta tanto **OpenAI GPT** quanto **Google Gemini**. O Gemini é uma ótima alternativa gratuita!

## 🎯 Vantagens do Gemini

- ✅ **Gratuito** - API gratuita com limite generoso
- ✅ **Rápido** - Gemini 1.5 Flash é muito rápido
- ✅ **Bom para SQL** - Excelente em tarefas estruturadas
- ✅ **Sem cartão de crédito** - Apenas login com Google

## 🔑 Obtendo sua API Key do Gemini

1. Acesse: https://aistudio.google.com/app/apikey
2. Faça login com sua conta Google
3. Clique em **"Create API Key"**
4. Copie a chave gerada

## ⚙️ Configuração

### 1. Configure o .env

```bash
cd /home/phsilva/UFSC/test_mcp

# Edite o .env
nano .env
```

Adicione/modifique:
```bash
# Escolha o provider
AI_PROVIDER=gemini

# Cole sua chave do Gemini
GEMINI_API_KEY=AIzaSy...

# OpenAI é opcional agora
# OPENAI_API_KEY=sk-...
```

### 2. Configure o frontend/.env

```bash
cd frontend
nano .env
```

Adicione as mesmas configurações:
```bash
AI_PROVIDER=gemini
GEMINI_API_KEY=AIzaSy...
```

### 3. Reinicie os containers

```bash
cd ..
docker-compose down
docker-compose up -d
```

## 🔄 Alternando entre OpenAI e Gemini

Você pode alternar facilmente entre os dois:

### Usar Gemini (padrão)
```bash
AI_PROVIDER=gemini
GEMINI_API_KEY=sua_chave_gemini
```

### Usar OpenAI
```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sua_chave_openai
```

### Fallback Automático
Se você configurar ambas as chaves, o sistema usará o `AI_PROVIDER` especificado. Se não especificar, ele tentará usar qualquer chave disponível.

## 📊 Comparação

| Característica | Gemini 1.5 Flash | GPT-4o Mini |
|----------------|------------------|-------------|
| **Custo** | Gratuito (até 15 req/min) | Pago ($0.15/1M tokens) |
| **Velocidade** | Muito rápido | Rápido |
| **Qualidade SQL** | Excelente | Excelente |
| **Limite gratuito** | 1500 req/dia | Não tem |
| **Setup** | Sem cartão | Requer cartão |

## 🧪 Testando

Após configurar, teste fazendo uma pergunta:

```
Quantas rodovias tem em cada estado?
```

O sistema deve:
1. Usar o Gemini para gerar o SQL
2. Executar a query no PostGIS
3. Retornar os resultados

## 🔍 Verificando qual IA está sendo usada

Veja os logs do container:

```bash
docker-compose logs -f frontend
```

Você verá mensagens indicando qual provider está sendo usado.

## 💡 Dicas

### Limites do Gemini Free
- **15 requisições por minuto**
- **1500 requisições por dia**
- **1 milhão de tokens por minuto**

Para uso normal do chatbot, isso é mais que suficiente!

### Modelos Disponíveis

O código usa `gemini-1.5-flash` por padrão, mas você pode modificar em:
`frontend/app/api/chat/route.ts`

Modelos disponíveis:
- `gemini-1.5-flash` - Rápido e gratuito (recomendado)
- `gemini-1.5-pro` - Mais poderoso, limites menores
- `gemini-1.0-pro` - Versão anterior

### Problemas Comuns

#### "Gemini not configured"
- Verifique se a `GEMINI_API_KEY` está no `.env`
- Reinicie o container: `docker-compose restart frontend`

#### "Quota exceeded"
- Você atingiu o limite de 15 req/min
- Aguarde 1 minuto e tente novamente
- Ou mude para OpenAI temporariamente

#### "Invalid API key"
- Verifique se copiou a chave completa
- Gere uma nova chave em: https://aistudio.google.com/app/apikey

## 🌟 Recomendação

Para desenvolvimento e testes, **recomendamos usar Gemini**:
- É gratuito
- Não precisa de cartão de crédito
- Performance excelente para SQL
- Limites generosos

Para produção com alto volume, considere OpenAI ou Gemini pago.

## 📚 Links Úteis

- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Pricing](https://ai.google.dev/pricing)
- [Rate Limits](https://ai.google.dev/gemini-api/docs/rate-limits)

---

**Pronto!** Agora você pode usar o chatbot geoespacial com Gemini gratuitamente! 🎉
