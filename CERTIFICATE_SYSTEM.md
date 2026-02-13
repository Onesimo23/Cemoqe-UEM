# Sistema de Certificados com Verificação de Pagamento

## Overview

Implementação completa de um sistema de emissão e verificação de certificados com workflow de pagamento integrado. O sistema permite que estudantes requeiram certificados após completar 100% de um curso, submetendo dados de pagamento (M-Pesa, E-Mola, ou Transferência Bancária) que são então verificados e confirmados pelos tutores instrutores.

## Arquitetura

### Fluxo de Dados

```
Estudante Completa Curso (100%)
    ↓
Botão "Emitir Certificado" Ativado
    ↓
CertificatePaymentModal (Modal de Pagamento)
    ├─ Seleciona Método: M-Pesa, E-Mola, Bank
    ├─ Insere ID da Transação
    └─ Submete → Collection 'certificates' (status: 'pending')
    ↓
Tutor Vê Certificado Pendente em /instrutor/certificados
    ├─ CertificatesManagementPage
    ├─ Verifica Método de Pagamento
    ├─ Verifica ID da Transação
    ├─ Confirma ✓ (status: 'confirmed')
    └─ ou Rejeita ✗ (status: 'rejected', com motivo)
    ↓
Estudante Recebe Notificação
    ├─ Confirmado: Pode fazer download do certificado
    └─ Rejeitado: Pode tentar novamente com novos dados
```

## Componentes Implementados

### 1. CertificatePaymentModal

**Arquivo:** `components/CertificatePaymentModal.tsx`

**Responsabilidade:** Componente modal que aparece quando o estudante tem 100% de progresso em um curso.

**Features:**

- Dropdown com opções de pagamento: M-Pesa, E-Mola, Transferência Bancária
- Campo de entrada para ID da transação
- Validação de dados antes de submeter
- Verificação de certificados existentes (pendente/confirmado/rejeitado)
- Exibição de status atual do certificado
- Mensagens de erro e sucesso

**Props:**

```typescript
{
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  onSuccess?: () => void;
}
```

**States Certificado:**

- `none`: Nenhum certificado (mostra formulário)
- `pending`: Aguardando confirmação do tutor
- `confirmed`: Tutor confirmou - pode fazer download
- `rejected`: Tutor rejeitou - pode tentar novamente

### 2. CertificatesManagementPage (Tutor)

**Arquivo:** `pages/instructor/CertificatesManagementPage.tsx`
**Rota:** `/instrutor/certificados`

**Responsabilidade:** Painel do tutor para gerenciar requisições de certificados.

**Features:**

- Lista de certificados pendentes (com stats no topo)
- Filtros por status: Todos, Pendentes, Confirmados, Rejeitados
- Para cada certificado exibe:
  - Nome do estudante
  - Curso
  - Método de pagamento
  - ID da transação
  - Data de submissão
  - Data de confirmação (se confirmado)
  - Motivo da rejeição (se rejeitado)
- Ações para certificados pendentes:
  - ✓ Confirmar Pagamento (atualiza status para 'confirmed', registra timestamp)
  - ✗ Rejeitar (requer inserção de motivo da rejeição)
- Atualizações em tempo real via onSnapshot

**Stats Exibidos:**

- À Espera de Confirmação
- Confirmados
- Total

### 3. StudentsProgressPage (Tutor)

**Arquivo:** `pages/instructor/StudentsProgressPage.tsx`
**Rota:** `/instrutor/progresso`

**Responsabilidade:** Dashboard de progresso dos estudantes em todos os cursos.

**Features:**

- Lista de todos os estudantes inscritos nos cursos do tutor
- Para cada estudante, exibe todas as inscrições com:
  - Nome do curso
  - Data de inscrição
  - Barra de progresso (0-100%)
  - Aulas completadas / Total de aulas
  - Data de conclusão (se 100%)
  - Status do certificado (Nenhum, Aguardando, Confirmado, Rejeitado)
- Filtros:
  - Todos os estudantes
  - Apenas com cursos completados
  - Apenas com cursos em andamento
- Expandir/colapsar detalha por estudante
- Exportar para CSV com dados de progresso

**Stats:**

- Total de Estudantes
- Total de Cursos Completados
- Progresso Médio (%)

### 4. Integração CoursePlayerPage

**Arquivo:** `pages/student/CoursePlayerPage.tsx`

**Alterações:**

- Import do `CertificatePaymentModal`
- Novo estado: `showCertificateModal`
- Botão "Certificado" no header agora:
  - Desabilitado (cinza) quando progresso < 100%
  - Ativado (azul) quando progresso = 100%
  - Abre modal ao clicar
  - Exibe "Emitir Certificado" quando ativado
- Modal renderizado no fim do componente com props:
  - `courseId`: ID do curso
  - `courseTitle`: Título do curso
  - `onSuccess`: Callback para mostrar toast de sucesso

## Firestore Collections

### Collection: `certificates`

**Schema:**

```typescript
{
  student_uid: string;           // UID do estudante
  student_name: string;          // Nome completo do estudante
  course_id: string;             // ID do curso
  course_title: string;          // Título do curso
  status: 'pending' | 'confirmed' | 'rejected';
  payment_method: 'm-pesa' | 'e-mola' | 'bank';
  transaction_id: string;        // ID/Referência da transação
  submitted_at: Timestamp;       // Quando foi submetido
  confirmed_at?: Timestamp;      // Quando foi confirmado (null se não confirmado)
  rejection_reason?: string;     // Motivo da rejeição (null se confirmado)
  instructor_uid?: string;       // UID do tutor (para futuro)
}
```

**Índices Recomendados:**

- Índice em `student_uid` + `course_id` (para buscar certificado específico)
- Índice em `course_id` + `status` (para listar certificados pendentes de um curso)
- Índice em `student_uid` + `status` (para histórico do estudante)

## Fluxo de Uso

### Para Estudantes:

1. **Completa o Curso (100%)**
   - Assiste todas as aulas
   - Completa todos os módulos
   - Progresso chega a 100%

2. **Botão Ativa**
   - Header de CoursePlayerPage mostra "Emitir Certificado" em destaque

3. **Abre Modal de Pagamento**
   - Clica no botão
   - Modal abre com formulário

4. **Submete Dados de Pagamento**
   - Seleciona método (M-Pesa, E-Mola, ou Bank)
   - Insere ID da transação
   - Clica "Enviar Dados de Pagamento"

5. **Aguarda Confirmação**
   - Vê status "À Espera de Confirmação"
   - Recebe notificação quando tutor confirmar

6. **Download (após confirmação)**
   - Pode ver "Certificado Confirmado"
   - Acessa CertificateViewPage para fazer download

### Para Tutores:

1. **Acessa /instrutor/certificados**
   - Vê dashboard com stats
   - Vê lista de certificados agrupados por status

2. **Revisa Certificados Pendentes**
   - Vê nome do estudante
   - Vê curso
   - Verifica método de pagamento
   - Verifica ID da transação

3. **Confirma ou Rejeita**
   - Clica "Confirmar Pagamento" (marca como confirmado)
   - Ou clica "Rejeitar" + insere motivo

4. **Acompanha Progresso**
   - Acessa /instrutor/progresso
   - Vê todos os estudantes e progresso deles
   - Filtra por completados/em andamento
   - Exporta dados como CSV

## API Endpoints Utilizados

### Firestore Operations:

**CertificatePaymentModal:**

- `collection(db, 'certificates')` → addDoc() : Criar novo certificado
- `query(certificatesRef, where('student_uid', '==', user.uid), where('course_id', '==', courseId))` → getDocs() : Verificar certificado existente

**CertificatesManagementPage:**

- `onSnapshot(certificatesRef)` : Escutar certificados em tempo real
- `updateDoc(certRef, {status, confirmed_at})` : Confirmar certificado
- `updateDoc(certRef, {status, rejection_reason})` : Rejeitar certificado
- `query(coursesRef, where('instructor_uid', '==', user.uid))` → getDocs() : Obter cursos do tutor

**StudentsProgressPage:**

- `onSnapshot(enrollmentsRef)` : Escutar inscrições em tempo real
- `query(certificatesRef, where('student_uid'), where('course_id'))` → getDocs() : Status do certificado

## Segurança

### Firestore Security Rules (Recomendado):

```firestore
match /databases/{database}/documents {
  match /certificates/{certId} {
    allow read: if request.auth.uid == resource.data.student_uid
             || request.auth.uid == resource.data.instructor_uid;
    allow create: if request.auth.uid == request.resource.data.student_uid;
    allow update: if request.auth.uid == resource.data.instructor_uid;
    allow delete: if false; // Nunca deletar certificados
  }
}
```

### Validações no Cliente:

- ✓ ID da transação não pode estar vazio
- ✓ Estudante só pode submeter se progresso = 100%
- ✓ Tutor só vê/confirma certificados dos seus cursos
- ✓ Rejeição requer motivo obrigatório
- ✓ Certificado confirmado não pode ser alterado novamente

## Performance

### Otimizações Implementadas:

1. **Real-time Listeners Eficientes**
   - Utiliza `onSnapshot()` em vez de `getDocs()` quando possível
   - Cleanup de listeners ao desmontar componentes

2. **Filtros no Firestore**
   - Filtra certificados por curso do tutor no Firestore
   - Filtra inscrições por curso do tutor antes de processar

3. **Estados Gerenciados Localmente**
   - Modal states, filters, expanded students
   - Evita re-renderizações desnecessárias

4. **Índices Recomendados**
   - `certificates`: `course_id` + `status`
   - `certificates`: `student_uid` + `course_id`
   - `enrollments`: `student_uid` + `course_id`

## Integração com Sistema Existente

### Dependências:

- ✓ useAuth() context hook
- ✓ InstructorLayout component
- ✓ Firebase Firestore (db)
- ✓ lucide-react icons
- ✓ React Router (useParams)
- ✓ Tailwind CSS

### Compatibilidade:

- ✓ Funciona com CertificatesPage existente (estudante)
- ✓ Funciona com CertificateViewPage existente (download/print)
- ✓ Não quebra rotas existentes
- ✓ Adiciona novas rotas sem conflitos

## Próximas Melhorias (Opcional)

1. **Payment Gateway Integration**
   - Integrar com M-Pesa API
   - Integrar com E-Mola API
   - Verificação automática de transações

2. **Notificações**
   - Email ao estudante quando certificado confirmado/rejeitado
   - Notificação push no app

3. **Audit Trail**
   - Log de quem confirmou/rejeitou
   - Timestamp de cada ação
   - Possibilidade de desconfirmar (role-based)

4. **Analytics**
   - Taxa de emissão de certificados
   - Tempo médio de confirmação
   - Métodos de pagamento mais utilizados

5. **Templating**
   - Motivos de rejeição pré-definidos
   - Templates de mensagem para estudante
   - Customização de mensagens por tutor

## Testing Checklist

- [ ] Estudante com 0% progresso: botão desabilitado
- [ ] Estudante com 50% progresso: botão desabilitado
- [ ] Estudante com 100% progresso: botão ativado
- [ ] Modal se abre ao clicar no botão
- [ ] Validação: ID da transação obrigatório
- [ ] Certificado criado em 'certificates' collection
- [ ] Tutor vê certificado pendente em /instrutor/certificados
- [ ] Tutor consegue confirmar certificado
- [ ] Tutor consegue rejeitar com motivo
- [ ] Estudante vê status "Confirmado" após tutor confirmar
- [ ] StudentsProgressPage mostra todos os estudantes
- [ ] Filtros funcionam (pendentes/completados)
- [ ] Exportação CSV funciona
- [ ] Real-time updates funcionam
