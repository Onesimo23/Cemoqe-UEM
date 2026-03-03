# 🚀 GUIA DE EXECUÇÃO - Sistema de Cursos (MySQL)

## 📋 Pré-requisitos

- Node.js 16+ (preferencialmente 18+)
- MySQL 8.0+
- Git

---

## 🔧 CONFIGURAÇÃO INICIAL

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Criar ou editar arquivo `.env.local` na raiz do projeto:

```env
# ===== DATABASE =====
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_mysql
DB_NAME=cemoque

# ===== API =====
API_PORT=3005
VITE_API_PORT=3005

# ===== CORS =====
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# ===== FEATURES =====
ENABLE_OFFLINE_MODE=false
```

### 3. Criar Banco de Dados MySQL

```bash
# Conectar ao MySQL
mysql -u root -p

# No prompt do MySQL:
CREATE DATABASE cemoque CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 4. Executar Migrações

```bash
npm run db:create      # Cria tabelas
npm run db:migrate     # Executa migrações
npm run db:seed        # Insere dados iniciais (opcional)
```

---

## ▶️ RODANDO O PROJETO

### Opção 1: Desenvolvimento (Frontend + Backend Concorrentes)

```bash
npm run dev
```

Isso iniciará:

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3005

### Opção 2: Apenas Frontend

```bash
npm run dev:frontend
```

- Acesse: http://localhost:5173

### Opção 3: Apenas Backend

```bash
npm run dev:backend
```

- Backend estará em: http://localhost:3005

---

## 🧪 TESTANDO O SISTEMA

### Verificar Saúde do Backend

```bash
curl http://localhost:3005/health
# Resposta: {"status":"ok","timestamp":"..."}
```

### Teste 1: Login do Admin

```bash
curl -X POST http://localhost:3005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"admin@eduprimes.mz",
    "password":"AdminEduPrime@2024"
  }'
```

**Resposta esperada:**

```json
{
  "token": "eyJ...",
  "user": {
    "uid": "admin_...",
    "email": "admin@eduprimes.mz",
    "role": "admin"
  }
}
```

### Teste 2: Listar Cursos

```bash
curl http://localhost:3005/api/courses
```

**Resposta esperada:** Array de cursos

### Teste 3: Criar Curso

```bash
# 1. Obter token (veja Teste 1)
TOKEN="eyJ..."

# 2. Criar curso
curl -X POST http://localhost:3005/api/courses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "instructor_uid":"admin_...",
    "title":"Meu Novo Curso",
    "description":"Descrição do curso",
    "category":"Tecnologia",
    "level":"beginner",
    "price":0
  }'
```

### Teste 4: Via Interface Visual

1. **Abrir aplicação:**
   - Acesse http://localhost:5173

2. **Fazer login como instrutor:**
   - Email: `admin@eduprimes.mz`
   - Senha: `AdminEduPrime@2024`

3. **Navegar para "Meus Cursos":**
   - Menu esquerdo → "Instrutor" → "Meus Cursos"

4. **Criar novo curso:**
   - Clique em "Criar Novo Curso"
   - Preencha informações:
     - Título obrigatório
     - Categoria (ex: "Design")
     - Descrição do card
     - Descrição completa
   - Clique em "Salvar Curso"

5. **Verificar curso criado:**
   - Veja na lista "Meus Cursos"
   - Status deve ser "Rascunho"

6. **Publicar curso:**
   - Clique no ícone de status (Rascunho → Publicado)
   - Status deve mudar para "Publicado"

7. **Editar curso:**
   - Clique em "Editar" no curso da lista
   - Modifique informações
   - Clique em "Salvar Curso"

8. **Deletar curso:**
   - Clique em "Deletar"
   - Confirme deleção
   - Curso deve desaparecer da lista

---

## 🔍 VERIFICANDO DADOS NO BANCO

### Listar cursos criados

```bash
mysql -u root -p cemoque -e "SELECT id, title, is_active FROM courses LIMIT 10;"
```

### Ver estrutura da tabela

```bash
mysql -u root -p cemoque -e "DESCRIBE courses;"
```

### Ver tudo em uma tabela específica

```bash
mysql -u root -p cemoque -e "SELECT * FROM courses WHERE is_active = 1;"
```

---

## 🔗 ENDPOINTS DA API

### Cursos

- `GET /api/courses` – Listar cursos ativos
- `GET /api/courses/:id` – Obter curso específico
- `POST /api/courses` – Criar novo curso
- `PUT /api/courses/:id` – Atualizar curso
- `DELETE /api/courses/:id` – Deletar curso

### Autenticação

- `POST /api/auth/login` – Login
- `POST /api/auth/register` – Registrar usuário
- `GET /api/auth/me` – Obter usuário atual

### Inscrições

- `POST /api/enrollments` – Inscrever em curso
- `GET /api/enrollments/user/:uid` – Cursos do usuário
- `GET /api/enrollments/course/:id` – Inscrições do curso

### Usuários

- `GET /api/users` – Listar usuários (admin)
- `GET /api/users/:uid/profile` – Perfil do usuário
- `PUT /api/users/:uid/profile` – Atualizar perfil

---

## 📊 MONITORAMENTO

### Logs do Backend

Verifique os logs no console do terminal onde rodou `npm run dev:backend`:

```
[2024-03-03T...] POST /api/courses/
📝 [POST /courses] Creating course: {...}
🔑 Generating course ID...
✅ Course ID generated: course_1709470800000_abc123
💾 Inserting course into database...
✅ Course inserted successfully
```

### Logs do Navegador

Abra DevTools (F12) → Console para ver logs do frontend.

---

## ⚠️ PROBLEMAS COMUNS

### Erro: "Can't reach database"

```bash
# Verificar se MySQL está rodando
# Windows: Services → MySQL
# Linux: sudo service mysql status
# Mac: brew services list
```

### Erro: "Table courses not found"

```bash
npm run db:migrate
```

### Erro: "CORS Error"

Verificar se `CORS_ORIGIN` em `.env.local` inclui sua URL do frontend.

### API não responde

```bash
curl http://localhost:3005/health
# Se não funcionar, backend não está rodando
npm run dev:backend
```

### Cursos não aparecem

1. Verificar se `is_active = 1` no banco
2. Verificar se o `instructor_uid` está correto
3. Limpar cache: DevTools → Application → Clear storage → Clear all

---

## 🛑 PARAR O PROJETO

### Parar tudo

```bash
# No terminal onde rodou "npm run dev", pressione Ctrl+C
^C
```

### Encerrar MySQL

```bash
# Linux/Mac
sudo service mysql stop

# Windows: Services → Stop MySQL

# Ou no MySQL prompt:
SHUTDOWN;
```

---

## 📚 ESTRUTURA DE PASTAS RELEVANTES

```
d:\Amec\Cemoqe-UEM\
├── pages/instructor/          # Páginas do instrutor
│   ├── MyCoursesPage.tsx      # ✅ Lista de cursos (MIGRADO)
│   ├── CourseEditorPage.tsx   # ✅ Editor de cursos (MIGRADO)
│   └── ...
├── server/
│   ├── routes/
│   │   ├── courses.ts         # ✅ Endpoints de cursos
│   │   ├── auth.ts
│   │   └── ...
│   ├── db/
│   │   ├── connection.ts      # ✅ Pool MySQL
│   │   ├── migrate.ts
│   │   └── ...
│   └── index.ts               # ✅ Servidor Express
├── services/
│   ├── api.ts                 # ✅ Cliente API
│   └── firebase.ts            # (Não usado para cursos)
└── package.json
```

---

## 📝 NOTAS IMPORTANTES

1. **Senhas:** Não compartilhe senhas ou tokens
2. **Backup:** Faça backup do banco antes de mudanças
3. **Produção:** Use variáveis de ambiente secretas
4. **SSL:** Configure HTTPS em produção
5. **CORS:** Atualize `CORS_ORIGIN` para URLs de produção

---

## ✅ CHECKLIST DE VERIFICAÇÃO

- [ ] MySQL instalado e rodando
- [ ] Banco `cemoque` criado
- [ ] Migrações executadas (`npm run db:migrate`)
- [ ] `.env.local` configurado corretamente
- [ ] `npm install` completado
- [ ] Backend roda em `http://localhost:3005`
- [ ] Frontend roda em `http://localhost:5173`
- [ ] Health check responde: `curl http://localhost:3005/health`
- [ ] Pode fazer login com admin
- [ ] Pode criar curso
- [ ] Curso aparece em "Meus Cursos"
- [ ] Pode editar curso
- [ ] Pode publicar/despublicar curso
- [ ] Pode deletar curso

---

**Qualquer dúvida, revise os arquivos:**

- `COURSE_MIGRATION_SUMMARY.md` – Resumo técnico
- `MIGRATION_MYSQL_INSTRUCTOR.md` – Detalhes da migração
- `README.md` – Documentação geral do projeto
