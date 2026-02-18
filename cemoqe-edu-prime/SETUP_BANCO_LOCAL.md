# 🗄️ Setup Banco de Dados Local - CEmoque Edu

## Visão Geral

Você agora tem um **backend local completo** com:
- ✅ Servidor Express.js rodando em `http://localhost:5000`
- ✅ Banco de dados SQLite local em `./data/cemoque.db`
- ✅ Full offline support (dados sincronizados quando volta online)
- ✅ API compatible com Firebase (mesmos endpoints)

## Arquitetura

```
┌─────────────────────────────────────────────┐
│         React Frontend (Vite)                │
│      http://localhost:5173                   │
└──────────────────┬──────────────────────────┘
                   │ HTTP/REST
                   ↓
┌─────────────────────────────────────────────┐
│    Express Backend Server                    │
│      http://localhost:5000                   │
│    - Autenticação                            │
│    - CRUD operations                         │
│    - Real-time sync                          │
└──────────────────┬──────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────┐
│      SQLite Database (Local)                 │
│      ./data/cemoque.db                       │
│    - Users                                   │
│    - Courses & Modules & Lessons             │
│    - Enrollments                             │
│    - Certificates                            │
│    - Submissions                             │
│    - Sync Queue (para offline)               │
└─────────────────────────────────────────────┘
```

## 🚀 Instalação Rápida

### 1. Instalar dependências
```bash
npm install
```

### 2. Inicializar banco de dados
```bash
npm run db:migrate
```

Isso cria o arquivo `./data/cemoque.db` com todas as tabelas.

### 3. Iniciar (Frontend + Backend)
```bash
npm run dev
```

Abre:
- 🖥️ Frontend: http://localhost:5173
- 🔧 Backend: http://localhost:5000

### 4. Verificar saúde
```bash
curl http://localhost:5000/health
```

Resposta esperada:
```json
{ "status": "ok", "timestamp": "2026-02-15T..." }
```

## 📊 Estrutura de Tabelas

### Users (Autenticação)
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  uid TEXT UNIQUE,
  email TEXT UNIQUE,
  name TEXT,
  role TEXT (student|instructor|admin),
  created_at DATETIME
)
```

### Courses & Learning
```sql
CREATE TABLE courses (
  id, instructor_uid, title, description,
  image_url, category, level, price, is_active
)

CREATE TABLE modules (
  id, course_id, title, order_index
)

CREATE TABLE lessons (
  id, module_id, course_id, title,
  content, video_url, duration_minutes
)
```

### Enrollments & Progress
```sql
CREATE TABLE enrollments (
  id, user_uid, course_id, instructor_uid,
  status, progress, enrolled_at, completed_at
)

CREATE TABLE lesson_completions (
  id, user_uid, course_id, lesson_id,
  instructor_uid, completed_at
)
```

### Certificates
```sql
CREATE TABLE certificates (
  id, user_uid, course_id, instructor_uid,
  status (pending|confirmed|rejected),
  transaction_id, verification_code, approved_at
)
```

## 🔄 Migrando do Firebase para SQLite

### Opção 1: Migração Manual (Recomendado)

1. **Exportar dados do Firebase:**
```bash
# No console do Firebase:
db.collection('users').get().then(snap => {
  const data = [];
  snap.docs.forEach(doc => data.push({id: doc.id, ...doc.data()}));
  console.log(JSON.stringify(data, null, 2));
});
```

2. **Criar script de import:**
```bash
npm run db:seed
```

### Opção 2: Migração Automática
```typescript
// scripts/migrateFirebaseToLocal.ts
import { collection, getDocs } from 'firebase/firestore';
import axios from 'axios';

async function migrate() {
  const collections = ['users', 'courses', 'enrollments', ...];

  for (const coll of collections) {
    const docs = await getDocs(collection(db, coll));
    for (const doc of docs.docs) {
      await axios.post(`http://localhost:5000/api/${coll}`, doc.data());
    }
  }
}
```

## 🔌 API Endpoints

### Autenticação
```
POST   /api/auth/register      - Registrar novo usuário
POST   /api/auth/login         - Login
GET    /api/auth/me            - Usuário atual
```

### Cursos
```
GET    /api/courses            - Listar cursos
GET    /api/courses/:id        - Detalhes + módulos + aulas
POST   /api/courses            - Criar curso (instructor)
PUT    /api/courses/:id        - Atualizar curso
DELETE /api/courses/:id        - Desativar curso
```

### Inscrições
```
GET    /api/enrollments/user/:uid              - Inscrições do aluno
POST   /api/enrollments                        - Inscrever em curso
GET    /api/enrollments/instructor/:uid/students - Alunos do instrutor
```

### Certificados
```
GET    /api/certificates/instructor/:uid      - Certificados pendentes
POST   /api/certificates                      - Solicitar certificado
PUT    /api/certificates/:id                  - Aprovar/rejeitar
```

### Usuários
```
GET    /api/users/:uid         - Perfil do usuário
```

## 📱 Modo Offline

### Como funciona:
1. **Quando online:** Todas as operações vão direto para SQLite
2. **Quando offline:** Service Worker caches respostas + fila de sync
3. **Quando volta online:** Sync automático da fila

### Service Worker
```typescript
// public/sw.ts
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-data') {
    event.waitUntil(syncOfflineQueue());
  }
});

async function syncOfflineQueue() {
  const queue = await db.all(
    "SELECT * FROM sync_queue WHERE status='pending'"
  );

  for (const item of queue) {
    try {
      await axios.post(`/api/sync`, item);
      await db.run(
        "UPDATE sync_queue SET status='synced' WHERE id=?",
        [item.id]
      );
    } catch (err) {
      console.error('Sync failed:', err);
    }
  }
}
```

## 🧪 Testes

### Verificar banco de dados
```bash
# Inspecionar SQLite
sqlite3 data/cemoque.db ".tables"
sqlite3 data/cemoque.db "SELECT COUNT(*) FROM users;"
```

### Testar API
```bash
# Health check
curl http://localhost:5000/health

# Listar cursos
curl http://localhost:5000/api/courses

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

### Seedar dados de teste
```bash
npm run db:seed
```

## 🔐 Segurança

### Em Desenvolvimento
- Sem autenticação JWT (header `x-user-id` simples)
- CORS permite localhost

### Em Produção
1. Implementar JWT real
2. Adicionar rate limiting
3. Validar inputs
4. Usar HTTPS
5. Hash de senhas (bcrypt)

```typescript
// Exemplo com JWT
import jwt from 'jsonwebtoken';

const token = jwt.sign(
  { uid: user.uid, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Middleware
app.use((req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(auth.replace('Bearer ', ''), process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});
```

## 📋 Próximos Passos

1. **Completar rotas** (submissions, questions, etc.)
2. **Implementar WebSockets** para real-time (socket.io)
3. **Adicionar file upload** (multer)
4. **Implementar notificações** (real-time alerts)
5. **Testes automatizados** (jest + supertest)
6. **Deploy** (Docker + Railway/Render)

## 🆘 Troubleshooting

### Erro: "database is locked"
```bash
# Fechar todas as conexões
rm data/cemoque.db
npm run db:migrate
```

### Erro: "EADDRINUSE 5000"
```bash
# Porta 5000 já em uso
lsof -i :5000
kill -9 <PID>
```

### Frontend não consegue conectar ao backend
```bash
# Verificar CORS em .env.local
CORS_ORIGIN=http://localhost:5173

# Verificar backend rodando
curl http://localhost:5000/health
```

## 📞 Suporte

Todas as collections do Firebase foram mapeadas para tabelas SQL.
Para adicionar novos dados:

1. Criar migração em `server/db/migrate.ts`
2. Criar rota em `server/routes/`
3. Testar com curl
4. Atualizar cliente React
