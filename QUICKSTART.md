# 🚀 Guia de Início Rápido

## Passo 1: Configure a OpenAI API Key

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite e adicione sua chave
nano .env
```

Adicione sua chave OpenAI:
```
OPENAI_API_KEY=sk-...
```

## Passo 2: Configure o Frontend

```bash
cd frontend
cp .env.example .env
nano .env  # Adicione a mesma OPENAI_API_KEY
cd ..
```

## Passo 3: Inicie os Containers

```bash
docker-compose up -d
```

Aguarde ~3 minutos para todos os serviços iniciarem.

## Passo 4: Verifique o Status

```bash
# Ver logs
docker-compose logs -f

# Verificar containers
docker-compose ps
```

Todos devem estar "Up" e "healthy".

## Passo 5: Acesse a Aplicação

Abra no navegador: **http://localhost:3000**

## Passo 6: Teste o Chatbot

Faça perguntas como:
- "Quantas rodovias tem em cada estado?"
- "Qual a distância entre São Paulo e Rio de Janeiro?"
- "Quais cidades estão em Santa Catarina?"

## 🎯 Próximos Passos

### Configurar GeoServer (Opcional)

1. Acesse: http://localhost:8080/geoserver
2. Login: `admin` / `geoserver`
3. Configure o data store PostGIS
4. Publique as camadas

### Configurar MCP no Cursor/Windsurf

1. Copie o conteúdo de `mcp-config.json`
2. Cole em `~/.cursor/mcp.json` ou `~/.windsurf/mcp.json`
3. Reinicie o editor
4. Use: `@geospatial_db sua pergunta aqui`

### Adicionar Seus Dados

```bash
# Acesse o PostgreSQL
docker-compose exec postgis psql -U geouser -d geospatial

# Execute seus INSERTs
INSERT INTO geo.estados ...
```

## 🛑 Parar os Serviços

```bash
# Parar
docker-compose down

# Parar e remover dados
docker-compose down -v
```

## 💡 Dicas

- **Primeira vez**: GeoServer demora ~2-3 minutos para iniciar
- **Logs**: Use `docker-compose logs -f [serviço]` para debug
- **Reiniciar**: `docker-compose restart [serviço]`
- **Dados**: Estão em volumes Docker, persistem entre reinicializações

## ❓ Problemas Comuns

### "Cannot connect to database"
- Aguarde mais tempo, PostGIS pode estar iniciando
- Verifique: `docker-compose logs postgis`

### "OpenAI API error"
- Verifique se a chave está correta no `.env`
- Reinicie: `docker-compose restart frontend`

### "Map not loading"
- GeoServer pode estar iniciando ainda
- Verifique: `docker-compose logs geoserver`
- Acesse: http://localhost:8080/geoserver

## 📚 Documentação Completa

Veja `README.md` para documentação detalhada.
