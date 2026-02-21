# 🔍 DEBUG: Fluxo de Progresso de Curso

## O Problema Original

- Taxa de conclusão mostrava 0% mesmo com pessoas que completaram 100% das aulas
- Progresso desaparecia ao recarregar a página

## A Solução Implementada

### 1. **CoursePlayerPage.tsx** - Marcar Aula como Completa

```typescript
// Quando o aluno clica "Concluir Aula"
markLessonAsComplete() → {
  1. Salva em lesson-completions (registro de aula feita)
  2. Atualiza estado local: setCompletedLessons(Set)
  3. Se for última aula, chama updateEnrollment(progress=100)
}
```

#### Novo Hook useEffect (após marcar aula):

```typescript
useEffect(() => {
  // Atualiza enrollment a cada 10% de progresso
  const newProgress = (completedLessons.size / allLessons.length) * 100;

  if (newProgress > 0 && newProgress % 10 === 0) {
    // Atualiza documento enrollments com:
    // - progress: 25, 50, 75, 100
    // - completed: true (quando 100%)
    // - completedAt: timestamp
    updateDoc(enrollmentRef, { progress, completed, completedAt });
  }
}, [completedLessons]);
```

### 2. **Estrutura de Dados no Firestore**

#### Collection: `lesson-completions` (Imutável)

```json
{
  "id": "auto-generated",
  "course_id": "abc123",
  "lesson_id": "lesson-1",
  "user_uid": "user@gmail.com",
  "user_name": "João Silva",
  "course_title": "React Avançado",
  "lesson_title": "Aula 1 - Introdução",
  "instructor_uid": "john@edu.com",
  "completedAt": "2026-02-21T15:30:00Z"
}
```

↓
Usada apenas para audit trail / histórico completo

#### Collection: `enrollments` (Atualizado em tempo real)

```json
{
  "id": "auto-generated",
  "course_id": "abc123",
  "user_uid": "user@gmail.com",
  "enrolledAt": "2026-02-15T10:00:00Z",
  "progress": 100, // ← NOVO: atualizado durante o curso
  "completed": true, // ← NOVO: true quando progress === 100
  "completedAt": "2026-02-21T15:30:00Z", // ← NOVO: quando foi completado
  "certificatePaid": false,
  "certificatePrice": 200,
  "status": "active"
}
```

### 3. **Analytics: Como Recuperar Dados de Conclusão**

```typescript
// ✅ CORRETO: Buscar o campo 'progress' do enrollment
const completedEnrollments = allEnrollmentsSnap.docs.filter(
  (doc) => (doc.data().progress || 0) >= 100 || doc.data().completed === true,
).length;

// ❌ ERRADO (anterior): Contar completions (cada aula é um documento)
const completed = lessonsSnap.size; // Isso tá errado!
```

### 4. **Fluxo Temporal**

```
ANTES (Problema):
─────────────────
Aluno faz aula → lesson-completion criada → Stats calculam errado
                                            (não vê o progress no enrollment)

DEPOIS (Solução):
────────────────
Aluno faz aula → lesson-completion criada
                ↓
              updateDoc(enrollments, { progress: 25% })
                ↓
              Próxima aula → lesson-completion criada
                ↓
              updateDoc(enrollments, { progress: 50% })
                ↓
              ... continua ...
                ↓
              Última aula → lesson-completion criada
                ↓
              updateDoc(enrollments, { progress: 100%, completed: true })
                ↓
              Analytics vê: "progress === 100" ✅
```

## Como Verificar que Está Funcionando

### 1. **Abrir DevTools do Browser**

```
F12 → Console
```

### 2. **Marcar Aula como Completa**

Você verá logs como:

```
✅ Aula concluída com sucesso! Passando para a próxima...
Enrollment atualizado com progress: 25%
```

### 3. **Ir para /admin/analytics**

```
✅ Cursos Completos: 3 de 15 = 20%
```

### 4. **Verificar no Firestore Console**

```
Firestore → enrollments → seu documento
  - progress: 100
  - completed: true
  - completedAt: <timestamp>
```

## Campos Novos Adicionados

| Campo         | Tipo           | Descrição                | Quando é setado                        |
| ------------- | -------------- | ------------------------ | -------------------------------------- |
| `progress`    | number (0-100) | % de conclusão           | A cada 10% (e.g., 10%, 20%, ..., 100%) |
| `completed`   | boolean        | Curso finalizado?        | Quando progress = 100                  |
| `completedAt` | timestamp      | Data/hora de conclusão   | Junto com completed = true             |
| `lastUpdated` | timestamp      | Última vez que progrediu | A cada atualização de progress         |

## Troubleshooting

### Problema: Ainda mostra 0% de conclusão

**Solução:**

1. Abra DevTools → Console
2. Marque uma aula como completa
3. Procure por erros de permissão Firestore
4. Verifique se o enrollmentDoc.ref tem permissão de write

### Problema: Progresso salta de 0% para 100%

**Esperado!** O hook só atualiza a cada 10%, e quando salta para 100%.

### Problema: Certificado desaparece após reload

**Solução:** Agora está corrigido porque o `completed=true` fica salvo no enrollment.

## Próximos Passos

1. ✅ **[FEITO]** Atualizar CoursePlayerPage para salvar progress no enrollment
2. ✅ **[FEITO]** Corrigir cálculo de conclusão no Analytics
3. 🔄 **[OPCIONAL]** Adicionar tabela pivot de inscrições x alunos
4. 🔄 **[OPCIONAL]** Relatório detalhado por aluno/instrutor

---

**Última atualização:** 21 de fevereiro de 2026
