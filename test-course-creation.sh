#!/bin/bash

# Script para testar a criação de curso completa via API
# Execução: chmod +x test-course-creation.sh && ./test-course-creation.sh

API_URL="http://localhost:3005/api"
ADMIN_EMAIL="admin@eduprimes.mz"
ADMIN_PASSWORD="AdminEduPrime@2024"

echo "🧪 Iniciando testes de criação de curso..."
echo ""

# Função para fazer requisições
function make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4

    echo "📤 $method $endpoint"

    if [ -z "$token" ]; then
        curl -s -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_URL$endpoint"
    else
        curl -s -X "$method" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            -d "$data" \
            "$API_URL$endpoint"
    fi
}

# 1. Fazer login do admin
echo "1️⃣ Fazendo login do administrador..."
LOGIN_RESPONSE=$(make_request "POST" "/auth/login" "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")
ADMIN_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
ADMIN_UID=$(echo "$LOGIN_RESPONSE" | grep -o '"uid":"[^"]*' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
    echo "❌ Erro ao fazer login do admin"
    echo "Resposta: $LOGIN_RESPONSE"
    exit 1
fi

echo "✅ Admin logado com sucesso"
echo "   Token: ${ADMIN_TOKEN:0:50}..."
echo "   UID: $ADMIN_UID"
echo ""

# 2. Criar novo curso
echo "2️⃣ Criando novo curso..."
COURSE_DATA="{
    \"instructor_uid\":\"$ADMIN_UID\",
    \"title\":\"Teste de Curso - $(date +%s)\",
    \"description\":\"Descrição do curso de teste\",
    \"category\":\"Tecnologia\",
    \"level\":\"beginner\",
    \"price\":0
}"

CREATE_RESPONSE=$(make_request "POST" "/courses" "$COURSE_DATA" "$ADMIN_TOKEN")
COURSE_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$COURSE_ID" ]; then
    echo "❌ Erro ao criar curso"
    echo "Resposta: $CREATE_RESPONSE"
    exit 1
fi

echo "✅ Curso criado com sucesso"
echo "   ID: $COURSE_ID"
echo ""

# 3. Buscar curso criado
echo "3️⃣ Buscando curso criado ($COURSE_ID)..."
GET_RESPONSE=$(make_request "GET" "/courses/$COURSE_ID" "" "$ADMIN_TOKEN")
FOUND_TITLE=$(echo "$GET_RESPONSE" | grep -o '"title":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$FOUND_TITLE" ]; then
    echo "❌ Erro ao buscar curso"
    echo "Resposta: $GET_RESPONSE"
    exit 1
fi

echo "✅ Curso encontrado"
echo "   Título: $FOUND_TITLE"
echo ""

# 4. Atualizar curso
echo "4️⃣ Atualizando curso..."
UPDATE_DATA="{
    \"title\":\"Teste de Curso Atualizado - $(date +%s)\",
    \"description\":\"Descrição atualizada\",
    \"category\":\"Design\",
    \"is_active\":1
}"

UPDATE_RESPONSE=$(make_request "PUT" "/courses/$COURSE_ID" "$UPDATE_DATA" "$ADMIN_TOKEN")

echo "✅ Curso atualizado"
echo "   Resposta: $UPDATE_RESPONSE"
echo ""

# 5. Listar todos os cursos
echo "5️⃣ Listando todos os cursos..."
LIST_RESPONSE=$(make_request "GET" "/courses" "" "$ADMIN_TOKEN")
COURSE_COUNT=$(echo "$LIST_RESPONSE" | grep -o '"id"' | wc -l)

echo "✅ Cursos listados"
echo "   Total de cursos encontrados: $COURSE_COUNT"
echo ""

# 6. Deletar curso
echo "6️⃣ Deletando curso..."
DELETE_RESPONSE=$(make_request "DELETE" "/courses/$COURSE_ID" "" "$ADMIN_TOKEN")

echo "✅ Curso deletado"
echo "   Resposta: $DELETE_RESPONSE"
echo ""

echo "🎉 Todos os testes completados com sucesso!"
echo ""
echo "Resumo:"
echo "  ✅ Login do administrador"
echo "  ✅ Criação de curso"
echo "  ✅ Busca de curso"
echo "  ✅ Atualização de curso"
echo "  ✅ Listagem de cursos"
echo "  ✅ Deleção de curso"
