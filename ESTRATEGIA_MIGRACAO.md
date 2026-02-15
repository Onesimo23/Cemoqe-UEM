# 🎯 Estratégia de Migração: Firebase → SQLite Local

## Fases de Migração

```
Fase 1 (Hoje)        Fase 2 (Semana 1)    Fase 3 (Semana 2)    Fase 4 (Semana 3)
├─ Backend criado    ├─ Dados migrados    ├─ UI atualizada      ├─ Cache/Offline
├─ BD local pronto   ├─ Auth funciona     ├─ Real-time OK       ├─ Sync automático
└─ APIs básicas      └─ Cursos funcionam  └─ Todos endpoints    └─ Deploy pronto
```

## ✅ Fase 1: Backend Local (JÁ FEITO)

### Criado:
- ✅ Servidor Express.js
- ✅ SQLite local em `./data/cemoque.db`
- ✅ Schema com todas as tabelas
- ✅ Rotas básicas de API
- ✅ Estrutura escalável

### Próximo passo: Instalar e rodar
```bash
npm install
npm run db:migrate
npm run dev
```

---

## 🔄 Fase 2: Refatorar React para usar API Local

### Passo 1: Criar camada de API abstrata

**Arquivo novo:** `src/services/api.ts` (já existe, vamos expandir)

```typescript
// src/services/api.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar user ID
apiClient.interceptors.request.use((config) => {
  const uid = localStorage.getItem('user_uid');
  if (uid) {
    config.headers['X-User-Id'] = uid;
  }
  return config;
});

export const api = {
  // Courses
  getCourses: () => apiClient.get('/courses'),
  getCourse: (id: string) => apiClient.get(`/courses/${id}`),

  // Enrollments
  getEnrollments: (uid: string) => apiClient.get(`/enrollments/user/${uid}`),
  enroll: (data: any) => apiClient.post('/enrollments', data),

  // Certificates
  getCertificates: (uid: string) => apiClient.get(`/certificates/instructor/${uid}`),
  requestCertificate: (data: any) => apiClient.post('/certificates', data),
  approveCertificate: (id: string, status: string) =>
    apiClient.put(`/certificates/${id}`, { status }),

  // Auth
  login: (email: string, uid?: string) =>
    apiClient.post('/auth/login', { email, uid }),
  register: (data: any) => apiClient.post('/auth/register', data),
  getCurrentUser: () => apiClient.get('/auth/me'),
};
```

### Passo 2: Substituir Firebase calls em cada página

**Exemplo 1: DashboardPage.tsx**

```typescript
// ANTES (Firebase)
import { onSnapshot, query, collection, where } from 'firebase/firestore';
import { db } from '@/services/firebase';

useEffect(() => {
  const q = query(collection(db, 'courses'), where('instructor_uid', '==', user.uid));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    // ...
  });
  return unsubscribe;
}, [user]);

// DEPOIS (API Local)
import { api } from '@/services/api';

useEffect(() => {
  const fetchEnrollments = async () => {
    try {
      const response = await api.getEnrollments(user.uid);
      setEnrollments(response.data);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    }
  };

  const interval = setInterval(fetchEnrollments, 5000); // Poll a cada 5s
  fetchEnrollments();

  return () => clearInterval(interval);
}, [user.uid]);
```

### Passo 3: Real-time com polling (migração suave)

Para manter real-time, vamos usar polling por enquanto (depois WebSockets):

```typescript
// src/hooks/useRealtime.ts
import { useEffect, useState } from 'react';
import { api } from '@/services/api';

export function useRealtime<T>(
  fetchFn: () => Promise<T>,
  interval: number = 5000
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const result = await fetchFn();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetch();
    const intervalId = setInterval(fetch, interval);
    return () => clearInterval(intervalId);
  }, [fetchFn, interval]);

  return { data, loading, error };
}

// Uso:
const { data: courses, loading } = useRealtime(
  () => api.getCourses().then(r => r.data),
  5000
);
```

---

## 📱 Fase 3: Refatorar por feature (ordem sugerida)

### 1️⃣ Courses (sem dependências)
- [ ] `CoursesPage.tsx` → `api.getCourses()`
- [ ] `CourseDetailsPage.tsx` → `api.getCourse(id)`
- [ ] `CategoriesPage.tsx` → refatorar

**Tempo:** ~2 horas

### 2️⃣ Authentication
- [ ] `LoginPage.tsx` → `api.login()`
- [ ] `RegisterPage.tsx` → `api.register()`
- [ ] `AuthContext.tsx` → use api client

**Tempo:** ~1 hora

### 3️⃣ Enrollments (depende de Auth + Courses)
- [ ] `EnrollmentPage.tsx` → `api.enroll()`
- [ ] `MyCoursesPage.tsx` → `api.getEnrollments()`

**Tempo:** ~2 horas

### 4️⃣ Dashboard & Progress
- [ ] `DashboardPage.tsx` → refatorar queries
- [ ] `CoursePlayerPage.tsx` → salvar completions localmente

**Tempo:** ~3 horas

### 5️⃣ Certificates
- [ ] `CertificatesPage.tsx` → `api.requestCertificate()`
- [ ] `CertificatesManagementPage.tsx` → `api.getCertificates()`
- [ ] `CertificatePaymentModal.tsx` → atualizar

**Tempo:** ~2 horas

### 6️⃣ Instructor features
- [ ] `MyStudentsPage.tsx` → student list
- [ ] `MyCoursesPage.tsx` (instructor) → course management
- [ ] `StudentsProgressPage.tsx` → progress tracking

**Tempo:** ~4 horas

### 7️⃣ Forums & Questions
- [ ] `QuestionsPage.tsx` → Q&A
- [ ] `ForumPage.tsx` → comments

**Tempo:** ~2 horas

---

## 🔧 Passo a Passo: Exemplo Completo (CoursesPage)

### Antes (Firebase):
```typescript
export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'courses'),
      where('isActive', '==', true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCourses(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <div>
      {loading ? <Spinner /> : (
        <div className="grid">
          {courses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Depois (API Local):
```typescript
export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await api.getCourses();
        setCourses(response.data);
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
    // Poll a cada 10 segundos
    const interval = setInterval(fetchCourses, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {loading ? <Spinner /> : (
        <div className="grid">
          {courses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
```

**Mudanças:**
- ❌ Remover imports do Firebase
- ✅ Usar `api.getCourses()`
- ✅ Usar `useState` em vez de listeners
- ✅ Polling com `setInterval` em vez de real-time

---

## 🔐 Fase 4: Cache & Offline Support

### Implementar IndexedDB + Service Worker

```typescript
// src/services/cache.ts
import { openDB } from 'idb';

const db = await openDB('cemoque-cache', 1, {
  upgrade(db) {
    db.createObjectStore('courses');
    db.createObjectStore('enrollments');
    db.createObjectStore('sync-queue');
  }
});

export const cache = {
  async getCourses() {
    return await db.get('courses', 'all');
  },

  async setCourses(data) {
    return await db.put('courses', data, 'all');
  },

  async queueSync(operation, data) {
    return await db.add('sync-queue', { operation, data, synced: false });
  }
};
```

### Service Worker para offline:

```typescript
// public/sw.ts
self.addEventListener('fetch', (event) => {
  if (event.request.method === 'GET') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache bem-sucedidas
          caches.open('v1').then(cache => cache.put(event.request, response.clone()));
          return response;
        })
        .catch(() => {
          // Offline: retornar cache
          return caches.match(event.request);
        })
    );
  }
});
```

---

## 📊 Checklist de Migração

- [ ] **Setup inicial**
  - [ ] `npm install` dependências
  - [ ] `npm run db:migrate` criar BD
  - [ ] `npm run dev` rodar frontend + backend
  - [ ] Testar health check: `curl http://localhost:5000/health`

- [ ] **Refatoração - Courses**
  - [ ] Criar `src/services/api.ts` completo
  - [ ] Refatorar `CoursesPage.tsx`
  - [ ] Refatorar `CourseDetailsPage.tsx`
  - [ ] Testar fluxo

- [ ] **Refatoração - Auth**
  - [ ] Refatorar `LoginPage.tsx`
  - [ ] Refatorar `AuthContext.tsx`
  - [ ] Testar login/logout

- [ ] **Refatoração - Enrollment**
  - [ ] Refatorar `EnrollmentPage.tsx`
  - [ ] Refatorar `MyCoursesPage.tsx`
  - [ ] Testar inscrição

- [ ] **Real-time**
  - [ ] Implementar `useRealtime` hook
  - [ ] Testar polling
  - [ ] Considerar WebSockets (socket.io)

- [ ] **Offline**
  - [ ] Implementar cache com IndexedDB
  - [ ] Criar Service Worker
  - [ ] Testar modo offline
  - [ ] Implementar sync automático

- [ ] **Deploy**
  - [ ] Preparar build
  - [ ] Configurar produção
  - [ ] Deploy backend (Docker/Railway)
  - [ ] Deploy frontend (Vercel)

---

## 🚀 Próximo Commit

```bash
git add .
git commit -m "feat: setup backend local com SQLite

- Criar servidor Express.js
- Implementar schema de banco de dados
- Criar rotas básicas de API
- Adicionar documentação de migração
- Refatorar estrutura para suportar offline

TODO: Refatorar React para usar API local em vez de Firebase"
```

## 📞 Dúvidas Comuns

**P: Preciso remover Firebase completamente?**
R: Não imediatamente. Pode manter Firebase como fallback durante transição.

**P: E os dados existentes no Firebase?**
R: Criar script de migração para exportar e importar.

**P: Real-time vai funcionar igual?**
R: Polling é OK por enquanto. WebSockets depois para melhor performance.

**P: E offline?**
R: Service Worker + IndexedDB. Sincroniza quando volta online.

**P: Quanto tempo leva?**
R: ~2 semanas para refatoração completa + testes.
