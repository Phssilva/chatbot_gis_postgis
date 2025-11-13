# Chatbot Geoespacial com MCP, PostGIS e GeoServer

Sistema de chatbot inteligente para consulta de dados geoespaciais usando linguagem natural, integrado com PostGIS, GeoServer e visualização em mapa interativo.

## Funcionalidades

- **Chatbot com IA**: Faça perguntas em português sobre dados espaciais
- **SQL Automático**: IA converte perguntas em queries SQL/PostGIS
- **Visualização em Mapa**: Integração com GeoServer e OpenLayers
- **Dados Brasileiros**: Estados, rodovias e cidades pré-carregados
- **Interface Moderna**: Next.js 15 + TailwindCSS + shadcn/ui

## Arquitetura

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Next.js   │────▶│   OpenAI     │────▶│   PostGIS    │
│  Frontend   │     │   (GPT-4)    │     │  (Queries)   │
└─────────────┘     └──────────────┘     └──────────────┘
       │                                         │
       │                                         │
       ▼                                         ▼
┌─────────────┐                          ┌──────────────┐
│  OpenLayers │◀─────────────────────────│  GeoServer   │
│    Mapa     │        WMS/WFS           │   (Layers)   │
└─────────────┘                          └──────────────┘
```

## Pré-requisitos

- Docker e Docker Compose
- **OpenAI API Key** OU **Google Gemini API Key** (para o chatbot funcionar)
  - **Recomendado**: Use Gemini - é gratuito! Veja [GEMINI_SETUP.md](GEMINI_SETUP.md)
- 4GB+ RAM disponível
- Portas livres: 3000, 5432, 8080

## Instalação e Uso

### 1. Clone e Configure

```bash
cd /home/phsilva/UFSC/test_mcp

# Copie o arquivo de exemplo
cp .env.example .env

# Edite o .env e adicione sua API Key
nano .env
```

**Opção A - Usar Gemini (Gratuito, Recomendado):**
```bash
AI_PROVIDER=gemini
GEMINI_API_KEY=sua_chave_aqui  # Obtenha em: https://aistudio.google.com/app/apikey
```

**Opção B - Usar OpenAI:**
```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-sua_chave_aqui
```

📖 **Guia completo do Gemini**: [GEMINI_SETUP.md](GEMINI_SETUP.md)

### 2. Configure o Frontend

```bash
cd frontend
cp .env.example .env
nano .env  # Adicione as mesmas configurações do passo 1
```

### 3. Inicie os Containers

```bash
# Volte para a raiz do projeto
cd ..

# Inicie todos os serviços
docker-compose up -d

# Acompanhe os logs
docker-compose logs -f
```

### 4. Aguarde a Inicialização

- **PostGIS**: ~30 segundos
- **GeoServer**: ~2-3 minutos
- **Frontend**: ~1 minuto (primeira vez)

### 5. Acesse a Aplicação

- **Frontend**: http://localhost:3000
- **GeoServer**: http://localhost:8080/geoserver
  - Usuário: `admin`
  - Senha: `geoserver`

## Dados Incluídos

### Estados (geo.estados)
- 6 estados brasileiros (SP, RJ, MG, PR, SC, RS)
- Geometrias (polígonos)
- População, área, região

### Rodovias (geo.rodovias)
- Rodovias federais e estaduais
- Geometrias (linhas)
- Extensão, condição, tipo

### Cidades (geo.cidades)
- Principais cidades
- Geometrias (pontos)
- População

## Exemplos de Perguntas

```
Quantas rodovias tem em cada estado?
Qual a distância entre São Paulo e Rio de Janeiro?
Quais cidades estão próximas da BR-101?
Qual estado tem rodovias em melhor condição?
Me mostre as estatísticas de rodovias por estado
Quais rodovias passam por Santa Catarina?
Qual a densidade populacional dos estados?
```

## Configurando GeoServer

### Primeira Configuração (Opcional)

1. Acesse http://localhost:8080/geoserver
2. Login: `admin` / `geoserver`
3. Vá em **Stores** → **Add new Store** → **PostGIS**
4. Configure:
   - **Workspace**: Crie um workspace chamado `geo`
   - **Data Source Name**: `geospatial`
   - **host**: `postgis`
   - **port**: `5432`
   - **database**: `geospatial`
   - **user**: `geouser`
   - **passwd**: `geopass`
5. Publique as camadas: `estados`, `rodovias`, `cidades`

## Comandos Úteis

```bash
# Ver logs de um serviço específico
docker-compose logs -f frontend
docker-compose logs -f postgis
docker-compose logs -f geoserver

# Parar todos os serviços
docker-compose down

# Parar e remover volumes (apaga dados)
docker-compose down -v

# Reiniciar um serviço
docker-compose restart frontend

# Executar SQL no PostGIS
docker-compose exec postgis psql -U geouser -d geospatial

# Acessar shell do container
docker-compose exec frontend sh
```

## Estrutura do Projeto

```
test_mcp/
├── docker-compose.yml          # Orquestração dos containers
├── database/
│   ├── init/
│   │   └── 01-init-postgis.sql # Schema e dados iniciais
│   ├── db-schema.sql           # Documentação do schema
│   └── example-queries.sql     # Queries de exemplo para IA
├── frontend/
│   ├── app/
│   │   ├── api/chat/           # API route do chatbot
│   │   ├── globals.css         # Estilos globais
│   │   ├── layout.tsx          # Layout principal
│   │   └── page.tsx            # Página inicial
│   ├── components/
│   │   ├── ChatPanel.tsx       # Painel do chatbot
│   │   ├── MapView.tsx         # Visualização do mapa
│   │   ├── MapLegend.tsx       # Legenda do mapa
│   │   └── ui/                 # Componentes UI
│   ├── lib/
│   │   └── utils.ts            # Utilitários
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
└── README.md
```

## Integrando com MCP (Model Context Protocol)

Para usar o MCP Server Postgres localmente no Cursor/Windsurf:

### 1. Configure o MCP

Edite `~/.cursor/mcp.json` ou `~/.windsurf/mcp.json`:

```json
{
  "mcpServers": {
    "geospatial_db": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://geouser:geopass@localhost:5432/geospatial"
      ]
    }
  }
}
```

### 2. Reinicie o Editor

Após configurar, reinicie o Cursor/Windsurf.

### 3. Use no Chat

Agora você pode fazer perguntas diretamente no chat do editor:

```
@geospatial_db Quantas rodovias tem em cada estado?
```

## Adicionando Seus Próprios Dados

### Opção 1: SQL Direto

```bash
docker-compose exec postgis psql -U geouser -d geospatial

# No psql:
INSERT INTO geo.estados (nome, sigla, regiao, populacao, area_km2, geom)
VALUES ('Bahia', 'BA', 'Nordeste', 14985284, 564733.08,
  ST_GeomFromText('MULTIPOLYGON((...))', 4326));
```

### Opção 2: Importar Shapefile

```bash
# Copie o shapefile para o container
docker cp meu_arquivo.shp postgis:/tmp/

# Importe usando shp2pgsql
docker-compose exec postgis shp2pgsql -I -s 4326 /tmp/meu_arquivo.shp geo.nova_tabela | \
  docker-compose exec -T postgis psql -U geouser -d geospatial
```

### Opção 3: Importar GeoJSON

Use ferramentas como `ogr2ogr` ou bibliotecas Python (GeoPandas).

## Troubleshooting

### Frontend não conecta ao PostGIS

```bash
# Verifique se o PostGIS está rodando
docker-compose ps

# Teste a conexão
docker-compose exec frontend sh
nc -zv postgis 5432
```

### GeoServer não inicia

```bash
# Verifique os logs
docker-compose logs geoserver

# Pode precisar de mais memória
# Edite docker-compose.yml e aumente MAXIMUM_MEMORY
```

### Queries da IA não funcionam

- Verifique se a `OPENAI_API_KEY` está configurada
- Veja os logs: `docker-compose logs -f frontend`
- Teste a API: `curl http://localhost:3000/api/chat`

### Mapa não carrega camadas

1. Configure o GeoServer manualmente (veja seção acima)
2. Verifique se as camadas foram publicadas
3. Teste WMS: http://localhost:8080/geoserver/geo/wms?service=WMS&version=1.1.0&request=GetCapabilities

## Tecnologias Utilizadas

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: TailwindCSS, shadcn/ui, Lucide Icons
- **Mapa**: OpenLayers 10
- **Backend**: Node.js, PostgreSQL, PostGIS
- **GeoServer**: Kartoza GeoServer 2.25
- **IA**: OpenAI GPT-4
- **Containerização**: Docker, Docker Compose

## Contribuindo

Sinta-se à vontade para:
- Adicionar mais dados geoespaciais
- Melhorar as queries de exemplo
- Criar novos componentes de visualização
- Otimizar performance

## Licença

MIT License - use livremente!

## Links Úteis

- [PostGIS Documentation](https://postgis.net/documentation/)
- [GeoServer Documentation](https://docs.geoserver.org/)
- [OpenLayers Documentation](https://openlayers.org/doc/)
- [MCP Protocol](https://modelcontextprotocol.io/)
- [Next.js Documentation](https://nextjs.org/docs)


