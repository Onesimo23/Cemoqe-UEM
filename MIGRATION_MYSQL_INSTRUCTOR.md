# Migração do Processo de Criação de Cursos para MySQL

## ✅ Mudanças Realizadas

### 1. **MyCoursesPage.tsx** (Página de Meus Cursos)

- ❌ Removido: Importações do Firebase/Firestore (`addDoc`, `collection`, `doc`, `getDocs`, `limit`, `onSnapshot`, `query`, `serverTimestamp`, `updateDoc`, `where`)
- ✅ Adicionado: Uso exclusivo da API MySQL via `api` client
- **Funções Atualizadas:**
  - `useEffect` para carregamento de cursos: Agora usa `api.get("/courses")` em vez de Firestore queries
  - `toggleCourseStatus()`: Usa `api.put()` para atualizar status do curso
  - `handleDeleteCourse()`: Usa `api.delete()` para excluir curso

### 2. **CourseEditorPage.tsx** (Editor de Cursos)

- ❌ Removido: Importações e lógica do Supabase Storage (`isSupabaseConfigured`, `supabase`)
- ❌ Removido: Fallback para Firebase Storage (`getStorage`, `uploadBytes`, `getDownloadURL`)
- ✅ Adicionado: Preparação de arquivos para upload (será armazenado no servidor)
- **Funções Atualizadas:**
  - `handleLessonFileUpload()`: Agora prepara o caminho do arquivo para upload no servidor
  - `onUploadFile()` callback: Retorna caminho do arquivo para processamento posterior

### 3. **Endpoints da API (server/routes/courses.ts)**

- ✅ Verificado: Todos os endpoints estão usando MySQL
  - `GET /courses` - Lista cursos ativos
  - `GET /courses/{id}` - Retorna curso com módulos e lições
  - `POST /courses` - Cria novo curso
  - `PUT /courses/{id}` - Atualiza curso
  - `DELETE /courses/{id}` - Desativa curso

## 📊 Fluxo de Criação de Curso

### Novo Curso:

1. Usuário clica em "Criar Novo Curso" na página de Meus Cursos
2. Abre página de edição (CourseEditorPage)
3. Preenche informações básicas (título, categoria, descrição, imagem)
4. Clica em "Salvar Curso"
5. API recebe POST em `/courses` com dados do instrutor
6. Servidor gera ID único e insere no MySQL
7. Curso é criado em estado "Rascunho"
8. Usuário é redirecionado para página de Meus Cursos

### Editar Curso Existente:

1. Usuário clica em "Editar" em um curso da lista
2. CourseEditorPage carrega dados via `api.get("/courses/{id}")`
3. Usuário faz alterações
4. Clica em "Salvar Curso"
5. API recebe PUT em `/courses/{id}` com dados atualizados
6. Servidor atualiza registro no MySQL
7. Cache é invalidado
8. UI é atualizada

### Publicar Curso:

1. Usuário clica no ícone de status do curso (Rascunho/Publicado)
2. `toggleCourseStatus()` executa
3. API envia PUT em `/courses/{id}` com `is_active: 1`
4. Servidor atualiza status no MySQL
5. Curso fica visível para alunos

### Deletar Curso:

1. Usuário clica em "Deletar" e confirma
2. `handleDeleteCourse()` executa
3. API envia DELETE em `/courses/{id}`
4. Servidor define `is_active = 0` no MySQL
5. Curso é soft-deleted
6. Cache é invalidado

## 🔄 Cache Management

- Cache TTL de 30 minutos para lista de cursos do instrutor
- Cache é invalidado após criar, atualizar ou deletar curso
- Hook `cacheService` gerencia o cache

## 📋 Testes Necessários

### ✅ Testes a Realizar:

1. **Criar novo curso**
   - [ ] Acesso a `/instrutor/cursos`
   - [ ] Clique em "Criar Novo Curso"
   - [ ] Preenchimento de informações básicas
   - [ ] Salvamento do curso
   - [ ] Curso aparece na lista de Meus Cursos

2. **Editar curso existente**
   - [ ] Clique em "Editar" em um curso
   - [ ] Alteração de informações
   - [ ] Salvamento das alterações
   - [ ] Mudanças refletidas na lista

3. **Publicar/Despublicar curso**
   - [ ] Alteração de status de "Rascunho" para "Publicado"
   - [ ] Alteração de status de "Publicado" para "Rascunho"
   - [ ] Status refletido na UI

4. **Deletar curso**
   - [ ] Clique em "Deletar"
   - [ ] Confirmação de deleção
   - [ ] Curso removido da lista
   - [ ] Mensagem de sucesso exibida

5. **Métricas do curso**
   - [ ] Visualização de conteúdo (número de módulos, aulas)
   - [ ] Visualização de inscrições
   - [ ] Visualização de taxa de conclusão

## ⚠️ Ao Usar Uploads de Arquivo

**IMPORTANTE:** O sistema atualmente apenas **prepara** os caminhos dos arquivos. Para ativar upload real:

1. Implementar endpoint POST `/files/upload` no servidor
2. Armazenar arquivos em local do servidor ou S3
3. Atualizar `handleLessonFileUpload()` para invocar upload real
4. Adicionar validação de tipos de arquivo

## 🔧 Configuração do Banco de Dados

Certifique-se de que as variáveis de ambiente estão configuradas em `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=cemoque
```

## 📝 Próximos Passos

1. [ ] Implementar upload de imagens de curso
2. [ ] Implementar upload de documentos de aula
3. [ ] Adicionar validações de campos obrigatórios no servidor
4. [ ] Implementar versionamento de cursos
5. [ ] Adicionar soft-delete com recuperação
6. [ ] Implementar auditoria de mudanças

## 🐛 Possíveis Problemas

### Erro: "Can't reach database"

- Verificar se MySQL está rodando
- Verificar credenciais de conexão em `.env`
- Verificar se a porta MySQL está correta

### Erro: "Table courses not found"

- Executar `npm run db:migrate` para criar tabelas
- Ou executar `npm run db:create && npm run db:seed`

### Cursos não aparecem na lista

- Verificar se `is_active = 1` no banco de dados
- Verificar se o `instructor_uid` corresponde ao usuário logado
- Limpar cache do navegador

### Upload de arquivo falha

- Upload de arquivo ainda não está implementado no servidor
- Use a interface para preparar caminhos de arquivo
- Implemente endpoint de upload quando necessário

---

**Data da Migração:** 3 de março de 2026
**Status:** ✅ Completo
**Próxima Review:** Após testes iniciais
