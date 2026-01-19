#!/bin/bash

echo "🚀 Portal Ciudadano - Script de Inicio"
echo "======================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar si Docker está corriendo
echo "📦 Verificando Docker..."
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker no está corriendo${NC}"
    echo "Por favor, inicia Docker Desktop y vuelve a ejecutar este script"
    exit 1
fi
echo -e "${GREEN}✓ Docker está corriendo${NC}"
echo ""

# Verificar si el contenedor de PostgreSQL existe
echo "🗄️  Verificando PostgreSQL..."
if ! docker ps | grep -q "portal-ciudadano-db"; then
    echo "⚙️  Iniciando PostgreSQL..."
    docker-compose up -d
    echo "⏳ Esperando a que PostgreSQL esté listo..."
    sleep 5
fi
echo -e "${GREEN}✓ PostgreSQL está corriendo${NC}"
echo ""

# Verificar si Prisma Client está generado
echo "🔧 Verificando Prisma Client..."
if [ ! -d "node_modules/@prisma/client" ]; then
    echo "⚙️  Generando Prisma Client..."
    npx prisma generate
fi
echo -e "${GREEN}✓ Prisma Client generado${NC}"
echo ""

# Verificar si las migraciones están aplicadas
echo "📊 Verificando migraciones de base de datos..."
if ! npx prisma migrate status 2>&1 | grep -q "Database schema is up to date"; then
    echo "⚙️  Aplicando migraciones..."
    npx prisma migrate dev --name init
fi
echo -e "${GREEN}✓ Base de datos lista${NC}"
echo ""

echo "======================================"
echo -e "${GREEN}✅ Todo listo para iniciar!${NC}"
echo ""
echo "Ejecutando: npm run dev"
echo ""
echo "🌐 El servidor estará disponible en:"
echo "   http://localhost:3000"
echo ""
echo "Para detener el servidor: Ctrl+C"
echo "======================================"
echo ""

# Iniciar el servidor de desarrollo
npm run dev
