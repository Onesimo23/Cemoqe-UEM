# Casos de Teste - Sistema de Progresso e Bloqueio de Aulas

## 1. Teste de Carregamento Inicial

### Cenário 1.1: Primeira Visita ao Curso

**Precondições:**

- Aluno está inscrito no curso
- Nenhuma aula foi marcada como concluída

**Passos:**

1. Navegar para `/aluno/courses/{id}`
2. Observar o CoursePlayerPage

**Resultados Esperados:**

- ✅ Primeira aula está selecionada automaticamente
- ✅ Barra de progresso mostra 0%
- ✅ Primeiro módulo está expandido
- ✅ Primeira aula mostra ícone de Play (🎬)
- ✅ Aulas 2+ mostram ícone de Cadeado (🔒)
- ✅ Todas as aulas posteriores têm `opacity-50`

### Cenário 1.2: Retorno Após Conclusão Parcial

**Precondições:**

- Aluno já completou 3 aulas de 10

**Passos:**

1. Recarregar página
2. Verificar estado do progresso

**Resultados Esperados:**

- ✅ Barra mostra 30%
- ✅ 3 aulas mostram ícone de Check (✓)
- ✅ Próxima aula (4ª) está desbloqueada
- ✅ Aulas 5-10 mostram Cadeado

---

## 2. Teste de Navegação Entre Aulas

### Cenário 2.1: Acessar Aula Desbloqueada

**Precondições:**

- Aula está desbloqueada (anterior foi completada)
- Aula não está selecionada

**Passos:**

1. Clicar no item da aula no sidebar
2. Observar mudanças

**Resultados Esperados:**

- ✅ Aula é selecionada (`currentLessonId` muda)
- ✅ Conteúdo da aula aparece no main
- ✅ Ícone muda para Play (🎬)
- ✅ Background fica verde (`border-brand-green bg-green-50/30`)

### Cenário 2.2: Tentar Acessar Aula Bloqueada

**Precondições:**

- Aula anterior não foi completada
- Aula mostra ícone de Cadeado

**Passos:**

1. Clicar no item da aula bloqueada
2. Tentar alternar para outra aula
3. Voltar e tentar clicar novamente

**Resultados Esperados:**

- ✅ Clique é ignorado (nenhuma mudança de `currentLessonId`)
- ✅ Aula não é selecionada
- ✅ Sem erros no console
- ✅ Aula permanece com `opacity-50`

### Cenário 2.3: Navegação com Setas (Anterior/Próxima)

**Precondições:**

- Aluno está em uma aula desbloqueada
- Há aulas antes e depois

**Passos:**

1. Clicar botão "Aula Anterior" (se existe)
2. Clicar botão "Próxima Aula" (se existe)

**Resultados Esperados:**

- ✅ Navegação funciona normalmente
- ✅ Aulas anteriores/próximas são acessadas
- ✅ Sem impacto de bloqueios (navegação via botão ignora lock)

---

## 3. Teste de Conclusão de Aula

### Cenário 3.1: Marcar Aula como Concluída

**Precondições:**

- Aluno está visualizando uma aula
- Aula não foi marcada como concluída
- Button mostra "Marcar como Concluída"

**Passos:**

1. Clicar botão "Marcar como Concluída"
2. Aguardar conclusão
3. Verificar estado

**Resultados Esperados:**

- ✅ Alerta: "Aula concluída com sucesso! Passando para a próxima..."
- ✅ Aluno navegado para próxima aula automaticamente
- ✅ Ícone da aula concluída muda para Check (✓)
- ✅ Botão muda para "✓ Concluída" (cinza, desabilitado)
- ✅ Progresso aumenta (+10% se eram 10 aulas)
- ✅ Próxima aula desbloqueada (se era bloqueada)

### Cenário 3.2: Marcar Última Aula como Concluída

**Precondições:**

- Aluno está na última aula do curso
- Todas as aulas anteriores foram completadas (99%)

**Passos:**

1. Clicar "Marcar como Concluída"
2. Observar reação

**Resultados Esperados:**

- ✅ Alerta: "Parabéns! Você completou todas as aulas do curso!"
- ✅ Barra de progresso mostra 100%
- ✅ Aluno permanece na última aula
- ✅ Botão mostra "✓ Concluída"

### Cenário 3.3: Clicar Botão já Concluído

**Precondições:**

- Aula já foi marcada como concluída
- Aluno retorna para a aula
- Botão mostra "✓ Concluída" em cinza

**Passos:**

1. Tentar clicar no botão "✓ Concluída"
2. Observar comportamento

**Resultados Esperados:**

- ✅ Botão está desabilitado (`disabled={true}`)
- ✅ Cursor mostra `not-allowed`
- ✅ Nenhuma ação executada
- ✅ Sem erros de duplicação no Firebase

---

## 4. Teste de Persistência de Dados

### Cenário 4.1: Recarregar Página Após Conclusão

**Precondições:**

- Aluno marcou aula como concluída
- Dados foram salvos no Firebase

**Passos:**

1. Marcar aula como concluída
2. Recarregar página (F5)
3. Verificar estado

**Resultados Esperados:**

- ✅ Aula continua marcada como concluída
- ✅ Ícone permanece como Check (✓)
- ✅ Botão permanece "✓ Concluída"
- ✅ Progresso mantém-se (ex: 30%)
- ✅ Próximas aulas continuam desbloqueadas

### Cenário 4.2: Trocar Abas do Navegador

**Precondições:**

- App aberto em Tab A
- Aluno marca aula como concluída
- Tab B tem a mesma página aberta

**Passos:**

1. Em Tab A: marcar aula como concluída
2. Ir para Tab B
3. Observar atualizações

**Resultados Esperados:**

- ✅ Tab B atualiza automaticamente (via onSnapshot)
- ✅ Ícones e progresso refletem mudanças
- ✅ Sem necessidade de recarregar Tab B
- ⚠️ Nota: Pode levar alguns segundos (sync Firebase)

### Cenário 4.3: Logout e Login Novamente

**Precondições:**

- Aluno completou algumas aulas
- Fez logout da aplicação

**Passos:**

1. Fazer logout
2. Fazer login novamente
3. Navegar para o curso

**Resultados Esperados:**

- ✅ Todas as aulas concluídas anteriormente são restauradas
- ✅ Progresso exato mantém-se
- ✅ Bloqueios de aulas respeitados
- ✅ Nenhuma perda de dados

---

## 5. Teste de Progresso Dinâmico

### Cenário 5.1: Barra de Progresso Incrementa

**Precondições:**

- Curso com 10 aulas
- Aluno completou 0 aulas (0%)

**Passos:**

1. Completar aula 1 (clique "Marcar como Concluída")
2. Completar aula 2
3. Completar aula 3
4. Observar barra

**Resultados Esperados:**

- ✅ Após aula 1: 10% com animação suave
- ✅ Após aula 2: 20%
- ✅ Após aula 3: 30%
- ✅ Largura da barra aumenta proporcionalmente
- ✅ Número no header muda: "10%" → "20%" → "30%"

### Cenário 5.2: Cálculo com Diferentes Totais

**Precondições:**

- Curso A tem 5 aulas
- Curso B tem 15 aulas

**Passos:**

1. Completar 1 aula do Curso A (deveria ser 20%)
2. Completar 1 aula do Curso B (deveria ser 6,67% ≈ 7%)

**Resultados Esperados:**

- ✅ Curso A mostra 20% (1/5 \* 100)
- ✅ Curso B mostra 7% (1/15 \* 100, arredondado)
- ✅ Cálculos independentes por curso (course_id)

### Cenário 5.3: Mínimo de 5% para Visualização

**Precondições:**

- Curso com muitas aulas (100+)
- Aluno completou apenas 1 aula

**Passos:**

1. Completar primeira aula
2. Observar barra de progresso

**Resultados Esperados:**

- ✅ Progresso real mostra 1% (arredondado)
- ✅ Barra mostra mínimo 5% (para visibilidade)
- ✅ Número no header mostra 1%
- ✅ Barra é visível mesmo com pequenos valores

---

## 6. Teste de Ícones no Sidebar

### Cenário 6.1: Estados de Ícone por Aula

**Precondições:**

- Aluno começou o curso e completou algumas aulas

**Passos:**

1. Expandir primeiro módulo
2. Observar ícones de cada aula
3. Expandir segundo módulo
4. Observar ícones

**Resultados Esperados:**

- ✅ Aula 1 (selecionada): ícone Play (🎬)
- ✅ Aula 2-3 (completadas): ícone Check (✓) verde
- ✅ Aula 4 (próxima): ícone Círculo (○) cinza
- ✅ Aula 5+ (bloqueadas): ícone Cadeado (🔒) cinza
- ✅ Aulas bloqueadas têm `opacity-50`

### Cenário 6.2: Mudança de Ícone ao Completar

**Precondições:**

- Aula atual tem ícone Play

**Passos:**

1. Clicar "Marcar como Concluída"
2. Sistema muda para próxima aula
3. Voltar para aula anterior
4. Observar ícone

**Resultados Esperados:**

- ✅ Aula anterior agora mostra ícone Check (✓)
- ✅ Mudança é imediata (sem lag)
- ✅ Próxima aula agora tem ícone Círculo (○) ou Play
- ✅ Ícone de cadeado foi removido

---

## 7. Teste de Validações e Erros

### Cenário 7.1: Erro ao Salvar (Sem Conexão)

**Precondições:**

- Aluno tenta marcar como concluída
- Conexão internet desconectada

**Passos:**

1. Desabilitar wifi/internet
2. Clicar "Marcar como Concluída"
3. Aguardar resposta

**Resultados Esperados:**

- ✅ Alerta: "Não foi possível marcar a aula como concluída."
- ✅ Aula NÃO é marcada como concluída
- ✅ Aluno permanece na aula atual
- ✅ Sem travamento da UI
- ✅ Possível tentar novamente após reconnectar

### Cenário 7.2: User Não Autenticado

**Precondições:**

- Sessão expirou ou user.uid é null

**Passos:**

1. Forçar logoff (deletar token)
2. Tentar clicar "Marcar como Concluída"

**Resultados Esperados:**

- ✅ Alerta: "Erro ao marcar aula como concluída."
- ✅ Usuário é redirecionado para login (se houver proteção)
- ✅ Sem erro de TypeError sobre user.uid

---

## 8. Teste de Segurança

### Cenário 8.1: Manipular completedLessons via Console

**Precondições:**

- App aberto e rodando
- Developer Console aberto (F12)

**Passos:**

1. Abrir Console
2. Tentar modificar `completedLessons` diretamente
3. Refresh de página

**Resultados Esperados:**

- ✅ Modificações locais são revertidas após refresh
- ✅ Firebase é fonte de verdade (onSnapshot restaura estado)
- ✅ Não há bypass de segurança

### Cenário 8.2: Firestore Rules

**Precondições:**

- Firestore Rules implementadas conforme documentação

**Passos:**

1. Logar como Aluno A
2. Tentar editar documento de Aluno B via Console
3. Tentar deletar documento

**Resultados Esperados:**

- ✅ Operação negada pela Firestore
- ✅ Erro: "PERMISSION_DENIED"
- ✅ Apenas dados do próprio usuário são acessíveis

---

## 9. Teste de Performance

### Cenário 9.1: Curso com Muitas Aulas (100+)

**Precondições:**

- Curso com 150 aulas em 10 módulos

**Passos:**

1. Carregar página
2. Expandir todos os módulos
3. Marcar várias aulas como concluídas
4. Observar performance

**Resultados Esperados:**

- ✅ Página carrega em < 3 segundos
- ✅ Sem travamento ao expandir módulos
- ✅ Ícones e progresso atualizam fluidamente
- ✅ Set<string> para completedLessons garante performance

### Cenário 9.2: Atualização em Tempo Real

**Precondições:**

- onSnapshot escutando atualizações

**Passos:**

1. Completar aula em Tab A
2. Observar atualização em Tab B
3. Medir latência

**Resultados Esperados:**

- ✅ Atualização em < 2 segundos (depende do Firebase)
- ✅ Sem lag ou congelamento
- ✅ Múltiplos abas sincronizam suavemente

---

## 10. Casos de Uso Complexos

### Cenário 10.1: Volta na Aula Anterior

**Precondições:**

- Aluno completou aulas 1-3
- Atualmente em aula 4

**Passos:**

1. Clicar na aula 3 (anterior)
2. Tentar clicar em aula 2
3. Tentar clicar em aula 5 (bloqueada)

**Resultados Esperados:**

- ✅ Aula 3 é acessada (anterior, desbloqueada)
- ✅ Aula 2 é acessada (completada, desbloqueada)
- ✅ Aula 5 NÃO é acessada (bloqueada)
- ✅ Sem restrição para aulas concluídas (mesmo que antigas)

### Cenário 10.2: Inscrição em Novo Curso

**Precondições:**

- Aluno faz inscrição em novo curso
- Já tem progresso em outro curso

**Passos:**

1. Inscrever-se em Curso Novo
2. Entrar no Curso Novo
3. Verificar progresso
4. Voltar para Curso Antigo
5. Verificar progresso de Novo

**Resultados Esperados:**

- ✅ Curso Novo começa em 0%
- ✅ Primeira aula do Novo desbloqueada
- ✅ Progresso de Antigo não afeta Novo
- ✅ Cada curso tem progresso independente

### Cenário 10.3: Múltiplos Usuários no Mesmo Curso

**Precondições:**

- Aluno A no Curso
- Aluno B no mesmo Curso
- Ambos começaram

**Passos:**

1. Aluno A marca aula 1 como concluída
2. Aluno B tenta acessar Aula 2 (ainda bloqueada para B)
3. Aluno B marca aula 1 como concluída
4. Ambos marcam aula 2

**Resultados Esperados:**

- ✅ Progresso de A não afeta B (separados por user_uid)
- ✅ Cada um tem seu próprio estado de conclusão
- ✅ Sem conflitos ou compartilhamento indevido de dados
- ✅ Firestore rules garantem isolamento

---

## Checklist Final

- [ ] Todos os 10 grupos de testes passaram
- [ ] Nenhum erro no console
- [ ] Progresso é dinâmico e realista
- [ ] Aulas bloqueadas não podem ser acessadas
- [ ] Dados persistem entre recarregamentos
- [ ] Sincronização em tempo real funciona
- [ ] Ícones exibem status correto
- [ ] Botão funciona e navega automaticamente
- [ ] Sem bugs de XSS ou injeção
- [ ] Performance adequada mesmo com muitos dados
