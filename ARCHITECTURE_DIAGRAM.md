# 🎯 Visão Geral - Arquitetura Backend Local

## Diagrama da Arquitetura

```
╔════════════════════════════════════════════════════════════════╗
║               CEMOQUE EDU - ARQUITETURA LOCAL                   ║
╚════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────┐
│                    NAVEGADOR (Browser)                        │
│              http://localhost:5173 (Vite)                     │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              React Application                          │   │
│  │  ✓ DashboardPage  ✓ CoursesPage   ✓ MyCoursesPage   │   │
│  │  ✓ CoursePlayerPage ✓ CertificatesPage             │   │
│  │  ✓ InstructorPages ✓ AdminPages                    │   │
│  └────────────┬─────────────────────────────────────────┘   │
└──────────────┼────────────────────────────────────────────────┘
               │
               │ HTTP/REST
               │ (axios / fetch)
               ▼
┌──────────────────────────────────────────────────────────────┐
│              Express.js Backend Server                         │
│         http://localhost:5000/api/* (Node.js)                │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Router Layer                                           │  │
│  │                                                          │  │
│  │  ├─ /api/auth/*           → authRoutes.ts             │  │
│  │  ├─ /api/courses/*        → coursesRoutes.ts          │  │
│  │  ├─ /api/enrollments/*    → enrollmentsRoutes.ts      │  │
│  │  ├─ /api/lessons/*        → lessonsRoutes.ts          │  │
│  │  ├─ /api/certificates/*   → certificatesRoutes.ts     │  │
│  │  ├─ /api/submissions/*    → submissionsRoutes.ts      │  │
│  │  ├─ /api/questions/*      → questionsRoutes.ts        │  │
│  │  └─ /api/users/*          → usersRoutes.ts            │  │
│  └─────────┬──────────────────────────────────────────────┘  │
│            │                                                   │
│  ┌─────────▼──────────────────────────────────────────────┐  │
│  │  Database Layer (SQLite3)                             │  │
│  │                                                        │  │
│  │  • Query: SELECT, INSERT, UPDATE, DELETE             │  │
│  │  • Transactions: Garantir integridade                │  │
│  │  • Connection Pool: Múltiplas requisições            │  │
│  └─────────┬──────────────────────────────────────────────┘  │
└────────────┼────────────────────────────────────────────────┘
             │
             │ SQLite3 Driver
             │
             ▼
┌──────────────────────────────────────────────────────────────┐
│                  SQLite Database (Local)                      │
│                  ./data/cemoque.db                            │
│                                                                │
│  12 Tables:                                                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ • users              • lesson_completions              │  │
│  │ • profiles           • submissions                      │  │
│  │ • courses            • questions                        │  │
│  │ • modules            • answers                          │  │
│  │ • lessons            • certificates                     │  │
│  │ • enrollments        • feedback                         │  │
│  │ • sync_queue (offline)                                │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                │
│  15+ Índices para performance                               │
│  Relacionamentos estruturados                               │
│  Backup fácil (arquivo .db)                                │
└──────────────────────────────────────────────────────────────┘
```

---

## Fluxo de Dados (Exemplo: Aluno vendo cursos)

```
1. NAVEGADOR
   └─> React renderiza CoursesPage
       └─> useEffect dispara axios.get('/api/courses')

2. REDE (HTTP)
   └─> GET http://localhost:5000/api/courses
       ├─ Headers: Content-Type: application/json
       ├─ Auth: x-user-id (header)
       └─ CORS: Validado

3. EXPRESS SERVER
   └─> /api/courses rota
       ├─> Middleware: Log, Auth check
       ├─> Handler: async (req, res) => { ... }
       └─> Database call: db.all('SELECT * FROM courses...')

4. SQLITE DATABASE
   └─> Executa: SELECT * FROM courses WHERE is_active = 1
       ├─> Usa índice: idx_courses_instructor
       ├─> Retorna rows: [{ id, title, ... }, ...]
       └─> Executa em ~5ms (muito rápido!)

5. EXPRESS RESPONDE
   └─> res.json(coursesArray)
       ├─> Content-Type: application/json
       ├─> Status: 200 OK
       └─> Body: [{ id, title, instructor_uid, ... }, ...]

6. NAVEGADOR RECEBE
   └─> Axios recebe resposta
       ├─> setCourses(data)
       ├─> React re-renderiza
       └─> User vê cursos na tela ✓
```

---

## Tabelas & Relacionamentos

```
users (Núcleo)
├── uid (PK)
├── email
├── name
├── role (student|instructor|admin)
└── timestamps

    └─ profiles (1:1)
       ├── user_id (FK → users.uid)
       ├── bio, avatar_url
       ├── specialization
       └── rating

    └─ courses (1:N) [instructor_uid]
       ├── instructor_uid (FK → users.uid)
       ├── title, description
       ├── category, level, price
       └── timestamps

           └─ modules (1:N) [course_id]
              ├── course_id (FK)
              ├── title, order_index
              └── timestamps

                  └─ lessons (1:N) [module_id]
                     ├── module_id (FK)
                     ├── course_id (FK)
                     ├── title, content, video_url
                     └── timestamps

    └─ enrollments (1:N) [user_uid, course_id]
       ├── user_uid (FK)
       ├── course_id (FK)
       ├── instructor_uid (FK) [snapshot]
       ├── status, progress
       └── enrolled_at, completed_at

    └─ lesson_completions (1:N) [user_uid, course_id, lesson_id]
       ├── user_uid (FK)
       ├── course_id (FK)
       ├── lesson_id (FK)
       ├── instructor_uid (FK) [snapshot]
       └── completed_at

    └─ submissions (1:N) [user_uid, course_id, lesson_id]
       ├── user_uid (FK)
       ├── course_id (FK)
       ├── lesson_id (FK)
       ├── file_url, file_name
       └── submitted_at

    └─ certificates (1:N) [user_uid, course_id]
       ├── user_uid (FK)
       ├── course_id (FK)
       ├── instructor_uid (FK)
       ├── status (pending|confirmed|rejected)
       ├── transaction_id, verification_code
       └── approved_at

    └─ questions (1:N) [course_id, author_uid, instructor_uid]
       ├── course_id (FK)
       ├── author_uid (FK)
       ├── instructor_uid (FK)
       ├── title, content
       └── timestamps

           └─ answers (1:N) [question_id, author_uid]
              ├── question_id (FK)
              ├── author_uid (FK)
              ├── content
              └── timestamps

    └─ feedback (1:N) [user_uid, course_id]
       ├── user_uid (FK)
       ├── course_id (FK)
       ├── rating, comment
       └── timestamps

sync_queue (Offline Sync)
├── operation (CREATE|UPDATE|DELETE)
├── table_name, record_id, data
├── status (pending|synced|failed)
└── created_at, synced_at
```

---

## Request/Response Example

### Request: Listar Cursos
```http
GET /api/courses HTTP/1.1
Host: localhost:5000
Content-Type: application/json
X-User-Id: student-001
Connection: keep-alive
```

### Response: Sucesso (200)
```http
HTTP/1.1 200 OK
Content-Type: application/json
Date: Sun, 15 Feb 2026 10:30:45 GMT
Connection: keep-alive

[
  {
    "id": "uuid-123",
    "instructor_uid": "inst-001",
    "title": "Introdução ao TypeScript",
    "description": "Aprenda TypeScript...",
    "category": "Programação",
    "level": "Beginner",
    "price": 49.99,
    "rating": 4.8,
    "students_count": 42,
    "is_active": true,
    "created_at": "2026-01-15T08:00:00Z",
    "updated_at": "2026-02-14T15:30:00Z"
  },
  { ... }
]
```

### Response: Erro (500)
```http
HTTP/1.1 500 Internal Server Error
Content-Type: application/json

{
  "error": "Database connection failed",
  "timestamp": "2026-02-15T10:30:45.123Z"
}
```

---

## Performance Esperada

### Queries Rápidas
```
SELECT * FROM courses WHERE is_active = 1
├─ Sem índice: ~50ms (table scan)
└─ Com índice: ~1ms ✓ (index lookup)

SELECT * FROM enrollments WHERE user_uid = ?
├─ Sem índice: ~100ms
└─ Com índice: ~2ms ✓

SELECT * FROM certificates WHERE status = 'pending'
├─ Sem índice: ~200ms
└─ Com índice: ~3ms ✓
```

### Volumes de Dados
```
Users:                 1,000 ~ 10,000
Courses:               50 ~ 500
Enrollments:           5,000 ~ 100,000
Submissions:           10,000 ~ 500,000
Lesson Completions:    50,000 ~ 1,000,000
Certificates:          1,000 ~ 50,000

Total DB Size:         ~50-200 MB (SQLite)
→ Cabe em qualquer máquina ✓
→ Backup rápido ✓
```

---

## Segurança (Implementação Básica)

```
┌─────────────────────────────────────┐
│         Segurança Atual              │
├─────────────────────────────────────┤
│ ✓ CORS configurado                  │
│ ✓ Header X-User-Id (básico)         │
│ ✓ Input validation (planeado)       │
│ ✓ SQL injection protection (safe)   │
│ ✓ Error hiding (não expõe DB)       │
├─────────────────────────────────────┤
│    Próxima Fase (Produção)          │
├─────────────────────────────────────┤
│ ☐ JWT authentication (real)         │
│ ☐ Rate limiting                     │
│ ☐ HTTPS / TLS                       │
│ ☐ Password hashing (bcrypt)         │
│ ☐ Database encryption               │
│ ☐ Audit logging                     │
│ ☐ 2FA (two-factor auth)             │
└─────────────────────────────────────┘
```

---

## Escalabilidade Roadmap

```
Hoje (MVP Local)
├─ SQLite local
├─ Single process
├─ Polling (5-10s)
└─ Síncronização manual

Fase 1 (WebSockets)
├─ SQLite local
├─ Single process
├─ Real-time listeners
└─ Socket.io

Fase 2 (Production)
├─ PostgreSQL (cloud)
├─ Multiple processes
├─ Redis cache
└─ Load balancer

Fase 3 (Enterprise)
├─ PostgreSQL + replication
├─ Kubernetes cluster
├─ CDN para assets
└─ Monitoring 24/7
```

---

## File Structure Complete

```
.
├── server/                          Backend
│   ├── index.ts                     Main server
│   ├── db/
│   │   ├── connection.ts            SQLite connection pool
│   │   ├── migrate.ts               Schema creation
│   │   ├── seed.ts                  Test data
│   │   └── reset.ts                 Database reset
│   └── routes/                      API endpoints
│       ├── auth.ts                  /api/auth/*
│       ├── courses.ts               /api/courses/*
│       ├── enrollments.ts           /api/enrollments/*
│       ├── certificates.ts          /api/certificates/*
│       ├── lessons.ts               /api/lessons/*
│       ├── submissions.ts           /api/submissions/*
│       ├── questions.ts             /api/questions/*
│       └── users.ts                 /api/users/*
│
├── src/                             Frontend (React)
│   ├── components/
│   ├── pages/
│   ├── services/
│   │   ├── api.ts                   TODO: Refactor to use backend
│   │   ├── firebase.ts              (Legacy, to be removed)
│   │   └── cache.ts                 (Offline support)
│   └── ...
│
├── data/                            Database
│   └── cemoque.db                   SQLite file
│
├── .env.local                       Environment variables
├── package.json                     Dependencies + scripts
├── tsconfig.json                    TypeScript config
├── vite.config.ts                   Vite config
│
└── Documentação/
    ├── BACKEND_QUICKSTART.md         Quick start (3 steps)
    ├── SETUP_BANCO_LOCAL.md          Complete setup guide
    ├── ESTRATEGIA_MIGRACAO.md        React refactoring plan
    └── IMPLEMENTATION_SUMMARY.md     What was built
```

---

## Próximo Passo: Começar!

```bash
npm install                    # 1. Instalar pacotes
npm run db:migrate            # 2. Criar banco
npm run dev                   # 3. Rodar tudo

curl http://localhost:5000/health  # 4. Testar
```

**Sucesso! Backend pronto para usar! 🎉**
