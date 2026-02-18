# 🚀 Quick Start - Backend Local

## ⚡ Iniciar em 3 passos

### 1. Instalar pacotes
```bash
npm install
```

### 2. Criar banco de dados
```bash
npm run db:migrate
```

### 3. Rodar (Frontend + Backend juntos)
```bash
npm run dev
```

**Abas abertas:**
- 🖥️ http://localhost:5173 (Frontend)
- 🔧 http://localhost:5000 (Backend API)

---

## ✅ Testar que está tudo funcionando

```bash
# Em outro terminal:
curl http://localhost:5000/health
```

Deve retornar:
```json
{"status":"ok","timestamp":"2026-02-15T..."}
```

---

## 📊 Banco de dados

O arquivo SQLite fica em:
```
./data/cemoque.db
```

Inspecionar:
```bash
sqlite3 data/cemoque.db ".tables"
sqlite3 data/cemoque.db "SELECT COUNT(*) FROM users;"
```

---

## 📚 Documentação Completa

- **[SETUP_BANCO_LOCAL.md](./SETUP_BANCO_LOCAL.md)** - Arquitetura, tabelas, endpoints
- **[ESTRATEGIA_MIGRACAO.md](./ESTRATEGIA_MIGRACAO.md)** - Refatorar React gradualmente

---

## 🔄 Estrutura de Pastas

```
server/
├── index.ts           # Servidor Express principal
├── db/
│   ├── connection.ts  # Conexão SQLite
│   └── migrate.ts     # Schema e migrations
└── routes/
    ├── auth.ts        # Autenticação
    ├── courses.ts     # Cursos
    ├── enrollments.ts # Inscrições
    ├── certificates.ts # Certificados
    ├── lessons.ts     # Aulas
    ├── submissions.ts # Exercícios
    ├── questions.ts   # Fórum
    └── users.ts       # Usuários

data/
└── cemoque.db         # Banco SQLite local
```

---

## 🎯 Próximos passos

1. ✅ **Backend pronto** (hoje)
2. 🔄 **Refatorar React** para usar API local (semana 1-2)
3. 📱 **Implementar offline** com Service Worker (semana 3)
4. 🚀 **Deploy** em produção (semana 4)

Ver [ESTRATEGIA_MIGRACAO.md](./ESTRATEGIA_MIGRACAO.md) para guia detalhado.

---

## 💡 Comandos úteis

```bash
# Desenvolvimento
npm run dev              # Frontend + Backend
npm run dev:frontend     # Só frontend
npm run dev:backend      # Só backend

# Banco de dados
npm run db:migrate       # Criar tabelas
npm run db:seed          # Seedar dados de teste
npm run db:reset         # Apagar e recriar tudo

# Legado (ainda funcionam)
npm run seed:test-certificate    # Seed certificado
npm run migrate:instructor-uid    # Migrar instructor_uid
```

---

## ⚠️ Troubleshooting

### Erro: "Port 5000 already in use"
```bash
lsof -i :5000
kill -9 <PID>
```

### Erro: "database is locked"
```bash
rm data/cemoque.db
npm run db:migrate
```

### Frontend não conecta ao backend
```bash
# Verificar se backend está rodando
curl http://localhost:5000/health

# Verificar CORS em .env.local
cat .env.local | grep CORS
```

---

## 📞 Mais ajuda

Abrir [SETUP_BANCO_LOCAL.md](./SETUP_BANCO_LOCAL.md) para:
- Detalhes da arquitetura
- Listagem completa de endpoints
- Como migrar dados do Firebase
- Configuração de produção
