#!/bin/bash

# Script para verificar o status da migração MySQL
# Execução: chmod +x check-migration.sh && ./check-migration.sh

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   VERIFICAÇÃO DA MIGRAÇÃO DO SISTEMA DE CURSOS PARA MYSQL      ║"
echo "║   Data: 3 de março de 2026                                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
PASSED=0
FAILED=0

# Função para testar arquivo
check_file() {
    local file=$1
    local description=$2

    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $description"
        ((PASSED++))
    else
        echo -e "${RED}❌${NC} $description (NOT FOUND)"
        ((FAILED++))
    fi
}

# Função para testar conteúdo
check_content() {
    local file=$1
    local content=$2
    local description=$3

    if grep -q "$content" "$file" 2>/dev/null; then
        echo -e "${GREEN}✅${NC} $description"
        ((PASSED++))
    else
        echo -e "${RED}❌${NC} $description"
        ((FAILED++))
    fi
}

# Função para testar ausência de conteúdo
check_no_content() {
    local file=$1
    local content=$2
    local description=$3

    if ! grep -q "$content" "$file" 2>/dev/null; then
        echo -e "${GREEN}✅${NC} $description"
        ((PASSED++))
    else
        echo -e "${RED}❌${NC} $description (ENCONTRADO - DEVE SER REMOVIDO)"
        ((FAILED++))
    fi
}

echo "📁 VERIFICAÇÃO DE ARQUIVOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_file "pages/instructor/MyCoursesPage.tsx" "MyCoursesPage.tsx existe"
check_file "pages/instructor/CourseEditorPage.tsx" "CourseEditorPage.tsx existe"
check_file "server/routes/courses.ts" "routes/courses.ts existe"
check_file "server/db/connection.ts" "db/connection.ts existe"
check_file "services/api.ts" "services/api.ts existe"
check_file "COURSE_MIGRATION_SUMMARY.md" "Documentação COURSE_MIGRATION_SUMMARY.md"
check_file "MIGRATION_MYSQL_INSTRUCTOR.md" "Documentação MIGRATION_MYSQL_INSTRUCTOR.md"
check_file "QUICKSTART_GUIDE.md" "Guia QUICKSTART_GUIDE.md"

echo ""
echo "🔍 VERIFICAÇÃO DE ALTERAÇÕES - MyCoursesPage.tsx"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_content "pages/instructor/MyCoursesPage.tsx" "import api from" "✓ Importa api client"
check_content "pages/instructor/MyCoursesPage.tsx" "api.get\|/courses" "✓ Usa api.get() para cursos"
check_content "pages/instructor/MyCoursesPage.tsx" "api.put.*courses" "✓ Usa api.put() para atualizar"
check_content "pages/instructor/MyCoursesPage.tsx" "api.delete.*courses" "✓ Usa api.delete() para deletar"

check_no_content "pages/instructor/MyCoursesPage.tsx" "firebase/firestore" "✗ Nenhuma importação Firebase"
check_no_content "pages/instructor/MyCoursesPage.tsx" "from.*firebase" "✗ Nenhuma importação Firebase"
check_no_content "pages/instructor/MyCoursesPage.tsx" "updateDoc\|addDoc\|getDocs" "✗ Nenhuma chamada Firestore"
check_no_content "pages/instructor/MyCoursesPage.tsx" "collection(db," "✗ Nenhuma collection(db)"

echo ""
echo "🔍 VERIFICAÇÃO DE ALTERAÇÕES - CourseEditorPage.tsx"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_content "pages/instructor/CourseEditorPage.tsx" "import api from" "✓ Importa api client"
check_no_content "pages/instructor/CourseEditorPage.tsx" "isSupabaseConfigured" "✗ Nenhuma verificação Supabase"
check_no_content "pages/instructor/CourseEditorPage.tsx" "supabase.storage" "✗ Nenhuma chamada Supabase Storage"
check_no_content "pages/instructor/CourseEditorPage.tsx" "getStorage\|uploadBytes\|getDownloadURL" "✗ Nenhuma função Firebase Storage"

echo ""
echo "🗄️  VERIFICAÇÃO - API MySQL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_content "server/routes/courses.ts" "GET.*courses" "✓ Endpoint GET /courses"
check_content "server/routes/courses.ts" "POST.*courses" "✓ Endpoint POST /courses"
check_content "server/routes/courses.ts" "PUT.*courses" "✓ Endpoint PUT /courses/:id"
check_content "server/routes/courses.ts" "DELETE.*courses" "✓ Endpoint DELETE /courses/:id"
check_content "server/routes/courses.ts" "db.all\|db.get\|db.run" "✓ Usa métodos db (MySQL)"

echo ""
echo "🔧 VERIFICAÇÃO - Configuração"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_content "server/db/connection.ts" "mysql2" "✓ Usa mysql2 para conexão"
check_content "server/db/connection.ts" "createPool" "✓ Pool de conexões configurado"
check_content "package.json" "mysql2" "✓ mysql2 em dependencies"

echo ""
echo "📊 RELATÓRIO FINAL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Passou:${NC} $PASSED"
echo -e "${RED}❌ Falhou:${NC} $FAILED"

TOTAL=$((PASSED + FAILED))
PERCENTAGE=$((PASSED * 100 / TOTAL))

echo ""
echo "Taxa de Sucesso: ${PERCENTAGE}% ($PASSED/$TOTAL)"

if [ $FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗"
    echo "║                  ✅ MIGRAÇÃO COMPLETA COM SUCESSO!                 ║"
    echo "║                                                                    ║"
    echo "║  Próximo passo: npm run dev                                       ║"
    echo -e "╚════════════════════════════════════════════════════════════════╝${NC}"
else
    echo ""
    echo -e "${YELLOW}⚠️  ATENÇÃO: Existem ${FAILED} problema(s) a serem verificados${NC}"
fi

echo ""
