#!/bin/bash

echo "🧪 Testando Setup do Chatbot Geoespacial"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Docker Compose
echo "1️⃣  Verificando docker-compose.yml..."
if [ -f "docker-compose.yml" ]; then
    echo -e "${GREEN}✓ docker-compose.yml encontrado${NC}"
else
    echo -e "${RED}✗ docker-compose.yml não encontrado${NC}"
    exit 1
fi

# Test 2: Database files
echo ""
echo "2️⃣  Verificando arquivos do banco..."
if [ -f "database/init/01-init-postgis.sql" ]; then
    echo -e "${GREEN}✓ Script de inicialização encontrado${NC}"
else
    echo -e "${RED}✗ Script de inicialização não encontrado${NC}"
    exit 1
fi

if [ -f "database/db-schema.sql" ]; then
    echo -e "${GREEN}✓ Schema do banco encontrado${NC}"
else
    echo -e "${RED}✗ Schema do banco não encontrado${NC}"
    exit 1
fi

if [ -f "database/example-queries.sql" ]; then
    echo -e "${GREEN}✓ Queries de exemplo encontradas${NC}"
else
    echo -e "${RED}✗ Queries de exemplo não encontradas${NC}"
    exit 1
fi

# Test 3: Frontend files
echo ""
echo "3️⃣  Verificando arquivos do frontend..."
if [ -f "frontend/package.json" ]; then
    echo -e "${GREEN}✓ package.json encontrado${NC}"
else
    echo -e "${RED}✗ package.json não encontrado${NC}"
    exit 1
fi

if [ -f "frontend/app/page.tsx" ]; then
    echo -e "${GREEN}✓ Página principal encontrada${NC}"
else
    echo -e "${RED}✗ Página principal não encontrada${NC}"
    exit 1
fi

if [ -f "frontend/app/api/chat/route.ts" ]; then
    echo -e "${GREEN}✓ API do chatbot encontrada${NC}"
else
    echo -e "${RED}✗ API do chatbot não encontrada${NC}"
    exit 1
fi

# Test 4: Environment files
echo ""
echo "4️⃣  Verificando arquivos de ambiente..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ .env encontrado${NC}"
    
    # Check for OpenAI key
    if grep -q "OPENAI_API_KEY=sk-" .env; then
        echo -e "${GREEN}✓ OpenAI API Key configurada${NC}"
    else
        echo -e "${YELLOW}⚠ OpenAI API Key não configurada (necessária para o chatbot)${NC}"
    fi
else
    echo -e "${YELLOW}⚠ .env não encontrado (copie de .env.example)${NC}"
fi

if [ -f "frontend/.env" ]; then
    echo -e "${GREEN}✓ frontend/.env encontrado${NC}"
else
    echo -e "${YELLOW}⚠ frontend/.env não encontrado (copie de frontend/.env.example)${NC}"
fi

# Test 5: Docker running
echo ""
echo "5️⃣  Verificando Docker..."
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker instalado${NC}"
    
    if docker info &> /dev/null; then
        echo -e "${GREEN}✓ Docker rodando${NC}"
    else
        echo -e "${RED}✗ Docker não está rodando${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ Docker não instalado${NC}"
    exit 1
fi

if command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✓ docker-compose instalado${NC}"
else
    echo -e "${RED}✗ docker-compose não instalado${NC}"
    exit 1
fi

# Test 6: Check if containers are running
echo ""
echo "6️⃣  Verificando containers..."
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✓ Containers rodando${NC}"
    docker-compose ps
    
    # Test PostGIS
    echo ""
    echo "7️⃣  Testando PostGIS..."
    if docker-compose exec -T postgis psql -U geouser -d geospatial -c "SELECT PostGIS_Version();" &> /dev/null; then
        echo -e "${GREEN}✓ PostGIS respondendo${NC}"
        
        # Check data
        ESTADOS=$(docker-compose exec -T postgis psql -U geouser -d geospatial -t -c "SELECT COUNT(*) FROM geo.estados;" 2>/dev/null | tr -d ' ')
        if [ "$ESTADOS" -gt 0 ]; then
            echo -e "${GREEN}✓ Dados carregados ($ESTADOS estados)${NC}"
        else
            echo -e "${YELLOW}⚠ Nenhum dado encontrado${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ PostGIS não está respondendo ainda${NC}"
    fi
    
    # Test Frontend
    echo ""
    echo "8️⃣  Testando Frontend..."
    if curl -s http://localhost:3000 > /dev/null; then
        echo -e "${GREEN}✓ Frontend respondendo em http://localhost:3000${NC}"
    else
        echo -e "${YELLOW}⚠ Frontend não está respondendo ainda${NC}"
    fi
    
    # Test GeoServer
    echo ""
    echo "9️⃣  Testando GeoServer..."
    if curl -s http://localhost:8080/geoserver > /dev/null; then
        echo -e "${GREEN}✓ GeoServer respondendo em http://localhost:8080/geoserver${NC}"
    else
        echo -e "${YELLOW}⚠ GeoServer não está respondendo ainda (pode demorar 2-3 min)${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Containers não estão rodando${NC}"
    echo ""
    echo "Para iniciar os containers, execute:"
    echo "  docker-compose up -d"
fi

echo ""
echo "=========================================="
echo "✅ Verificação completa!"
echo ""
echo "📝 Próximos passos:"
echo "  1. Configure .env com sua OPENAI_API_KEY"
echo "  2. Execute: docker-compose up -d"
echo "  3. Aguarde ~3 minutos"
echo "  4. Acesse: http://localhost:3000"
echo ""
echo "📚 Documentação: README.md"
echo "🚀 Início rápido: QUICKSTART.md"
