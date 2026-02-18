/\*\*

- ANÁLISE DO SISTEMA - BANCOS DE DADOS E INTEGRAÇÕES
- ====================================================
  \*/

// ┌─────────────────────────────────────────────────────────────┐
// │ ARQUITETURA DO SISTEMA │
// └─────────────────────────────────────────────────────────────┘

# BANCOS DE DADOS UTILIZADOS:

1️⃣ FIREBASE (Primário)
├─ Auth: Autenticação de utilizadores
├─ Firestore: Base de dados NoSQL (documentos)
│ ├─ profiles/ → Perfis de utilizadores
│ ├─ courses/ → Catálogo de cursos
│ ├─ enrollments/ → Inscrições de estudantes
│ ├─ admin_logs/ → Logs de atividade
│ └─ settings/ → Configurações do sistema
└─ Storage: Armazenamento de arquivos (imagens, vídeos)

2️⃣ SUPABASE (Secundário / Em Standby)
├─ Auth: Suporte alternativo de autenticação
├─ PostgreSQL: Base de dados relacional
│ └─ (Não está sendo usado ativamente)
└─ Functions: Backend serverless
└─ /supabase/functions/profile/ → API para perfis

3️⃣ MOCK DATA / LOCAL
├─ /constants.ts → Dados simulados de cursos
└─ /services/api.ts → API local simulada

// ┌─────────────────────────────────────────────────────────────┐
// │ FLUXO ATUAL DO SISTEMA │
// └─────────────────────────────────────────────────────────────┘

# AUTENTICAÇÃO:

1. Utilizador faz login
2. Firebase Auth valida credenciais
3. AuthContext lê do Firestore: collection(db, 'profiles')
4. Cria perfil se não existir
5. Armazena em localStorage para session persistence

# DADOS DE UTILADORES:

1. Criação: Firebase Auth + Firestore (profiles/)
2. Leitura: Firestore (profiles/)
3. Atualização: Firestore setDoc()
4. Supabase está preparado mas NÃO está sendo sincronizado

# DADOS DE CURSOS:

1. Cursos padrão: /constants.ts (MOCK_COURSES)
2. Cursos dinâmicos: Firestore (courses/)
3. Inscrições: Firestore (enrollments/)
4. Imagens: Firebase Storage

# LOGS & ANALYTICS:

1. Admin Logs: Firestore (admin_logs/)
2. Dashboard: Consulta Firestore

# BRANDING:

ANTES: Firestore (settings/system)
AGORA: /config/branding.config.ts (LOCAL - SEM BANCO DE DADOS)

// ┌─────────────────────────────────────────────────────────────┐
// │ ANÁLISE DETALHADA │
// └─────────────────────────────────────────────────────────────┘

┌─ FIREBASE (Google Cloud)
│ Status: ✅ ATIVO E PRINCIPAL
│ Projeto: edu-prime-ead96
│ Função: Tudo
│ Prós:
│ ✓ Firestore escalável
│ ✓ Auth integrado
│ ✓ Storage para mídia
│ ✓ Realtime updates
│ Contras:
│ ✗ Custo por operação
│ ✗ Lock-in no Google
│
├─ SUPABASE (Open Source Alternative)
│ Status: ⚠️ CONFIGURADO MAS NÃO USADO
│ Função: Backup/Alternativa
│ Observação:
│ • Credenciais configuradas mas não sincronizadas
│ • Profile function existe em /supabase/functions/
│ • PostgreSQL pronto mas vazio
│
└─ LOCAL / MOCK
Status: ✅ ATIVO
Função: Dados simulados para testes
Arquivos:
• /constants.ts → 50+ cursos fake
• /config/branding.config.ts → Configuração

// ┌─────────────────────────────────────────────────────────────┐
// │ RECOMENDAÇÕES │
// └─────────────────────────────────────────────────────────────┘

# OPÇÃO 1: MANTER COMO ESTÁ (Recomendado para agora)

✅ Firebase: Continuar usando
❌ Supabase: Remover configuração não utilizada
✅ Local: Manter para testes

Ação:

- Deixar Firebase como principal
- Limpar código Supabase não utilizado
- Documentar decisão

# OPÇÃO 2: MIGRAR PARA SUPABASE (Futuro)

💡 Supabase é open source e mais barato

- Migrate data: Firebase → Supabase PostgreSQL
- Replace auth: Firebase Auth → Supabase Auth
- Vantagem: Self-hosted possible

Passos:

1. Exportar dados do Firestore
2. Importar em Supabase PostgreSQL
3. Atualizar código: db calls → supabase calls
4. Testar tudo
5. Remover Firebase

# OPÇÃO 3: HÍBRIDO (Backup & Redundância)

🔄 Sincronizar ambas as bases

- Firebase: Principal com tempo real
- Supabase: Backup automático
- Fallback se Firebase cair

Risco: Sincronização é complexa

// ┌─────────────────────────────────────────────────────────────┐
// │ STATUS ATUAL │
// └─────────────────────────────────────────────────────────────┘

Sistema Primário: FIREBASE
├─ Auth: firebase/auth ✅
├─ Firestore: firebase/firestore ✅
├─ Storage: firebase/storage ✅
└─ Real-time: onSnapshot() ✅

Sistema Secundário: SUPABASE
├─ Configurado: ✅
├─ Usando: ❌ (Apenas em SettingsPage.tsx para verificar)
└─ Sincronizado: ❌

Local:
├─ Constants: ✅ (Dados mock)
├─ Branding: ✅ (Sem banco de dados agora)
└─ Mock API: ✅ (Simula latência)

// ┌─────────────────────────────────────────────────────────────┐
// │ MINHA RECOMENDAÇÃO │
// └─────────────────────────────────────────────────────────────┘

# Para agora (MVP):

✅ Manter Firebase como está
✅ Remover código Supabase não utilizado
✅ Documentar a arquitetura
✅ Criar scripts de backup

# Para o futuro (Production):

📋 Avaliar custo Firebase vs Supabase
📋 Considerar auto-hosted Supabase
📋 Implementar sistema de sincronização se quiser híbrido
📋 Setup CI/CD para dados críticos

// ┌─────────────────────────────────────────────────────────────┐
// │ ARQUIVOS AFETADOS │
// └─────────────────────────────────────────────────────────────┘

/services/firebase.ts → Configuração Firebase
/services/supabase.ts → Configuração Supabase (não usado)
/services/api.ts → Mock API local

/contexts/AuthContext.tsx → Usa Firebase Auth + Firestore

/pages/LoginPage.tsx → Firebase Auth
/pages/RegisterPage.tsx → Firebase Auth
/pages/admin/DashboardPage.tsx → Firestore queries
/pages/admin/SettingsPage.tsx → Firebase + Supabase (verificação)

/supabase/functions/ → Backend serverless (não ativo)
/scripts/seedAdmin.ts → Popula Firestore

Quer que eu:

1. Analise o código em detalhe?
2. Remova Supabase não utilizado?
3. Crie um sistema de sincronização?
4. Documente tudo melhor?
