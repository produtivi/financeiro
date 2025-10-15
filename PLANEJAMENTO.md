# 📋 Planejamento de Implementação - Agente Financeiro

## 🎯 Objetivo
Integrar o sistema financeiro com o agente de WhatsApp, permitindo que usuários gerenciem suas transações financeiras via chat.

---

## 📡 Endpoints Necessários

### 1. Categorias

#### `GET /api/v1/categorias`
**Descrição:** Listar todas as categorias disponíveis
**Autenticação:** API Key
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nome": "Vendas",
      "tipo": "receita",
      "ativo": true
    }
  ],
  "message": "Categorias listadas com sucesso"
}
```

**Uso no Agente:**
- Quando usuário pedir para adicionar transação
- Mostrar opções de categorias disponíveis baseado no tipo (receita/despesa)

---

### 2. Usuários

#### `GET /api/v1/usuarios`
**Descrição:** Listar todos os usuários
**Autenticação:** API Key
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "chat_id": 123456,
      "agent_id": 789,
      "nome": "Maria Silva",
      "status": "active"
    }
  ],
  "message": "Usuários listados com sucesso"
}
```

**Uso no Agente:**
- Administração (listar todos os usuários do sistema)

---

#### `GET /api/v1/usuarios/chat/:chat_id` ⭐ **NOVO ENDPOINT**
**Descrição:** Buscar usuário pelo chat_id do WhatsApp
**Autenticação:** API Key
**Params:** `chat_id` (number)
**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "chat_id": 123456,
    "agent_id": 789,
    "nome": "Maria Silva",
    "status": "active",
    "criado_em": "2025-10-15T10:30:00Z"
  },
  "message": "Usuário encontrado"
}
```

**Response (404 - Não encontrado):**
```json
{
  "success": false,
  "message": "Usuário não encontrado"
}
```

**Uso no Agente:**
- **Primeiro passo de toda interação**: Verificar se usuário já existe
- Identificar o usuário que está fazendo a requisição
- Criar contexto da conversa

---

#### `POST /api/v1/usuarios`
**Descrição:** Criar novo usuário
**Autenticação:** API Key
**Body:**
```json
{
  "chat_id": 123456,
  "agent_id": 789,
  "nome": "Maria Silva",
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "chat_id": 123456,
    "agent_id": 789,
    "nome": "Maria Silva",
    "status": "active",
    "criado_em": "2025-10-15T10:30:00Z"
  },
  "message": "Usuário criado com sucesso"
}
```

**Uso no Agente:**
- Quando `GET /usuarios/chat/:chat_id` retornar 404
- Criar novo usuário automaticamente no primeiro contato
- Usar nome do contato se disponível

---

### 3. Transações

#### `GET /api/v1/transacoes`
**Descrição:** Listar transações com filtros
**Autenticação:** API Key
**Query Params (opcionais):**
- `usuario_id` (number)
- `tipo` (receita | despesa)
- `categoria_id` (number)
- `data_inicio` (YYYY-MM-DD)
- `data_fim` (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tipo": "receita",
      "valor": 150.50,
      "descricao": "Venda de produto X",
      "data_transacao": "2025-10-15",
      "usuario": {
        "id": 1,
        "nome": "Maria Silva",
        "chat_id": 123456
      },
      "categoria": {
        "id": 1,
        "nome": "Vendas",
        "tipo": "receita"
      }
    }
  ],
  "message": "Transações listadas com sucesso"
}
```

**Uso no Agente:**
- Listar transações do usuário: `?usuario_id=1`
- Filtrar por período: `?usuario_id=1&data_inicio=2025-10-01&data_fim=2025-10-31`
- Listar só receitas: `?usuario_id=1&tipo=receita`
- Ver transações de uma categoria: `?usuario_id=1&categoria_id=5`

---

#### `GET /api/v1/transacoes/:id`
**Descrição:** Buscar transação específica
**Autenticação:** API Key
**Params:** `id` (number)
**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "tipo": "receita",
    "valor": 150.50,
    "descricao": "Venda de produto X",
    "data_transacao": "2025-10-15",
    "usuario": {
      "id": 1,
      "nome": "Maria Silva"
    },
    "categoria": {
      "id": 1,
      "nome": "Vendas"
    }
  },
  "message": "Transação encontrada"
}
```

**Uso no Agente:**
- Ver detalhes de uma transação específica
- Confirmar antes de deletar

---

#### `POST /api/v1/transacoes`
**Descrição:** Criar nova transação
**Autenticação:** API Key
**Body:**
```json
{
  "usuario_id": 1,
  "tipo": "receita",
  "valor": 150.50,
  "categoria_id": 1,
  "descricao": "Venda de produto X",
  "data_transacao": "2025-10-15"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "tipo": "receita",
    "valor": 150.50,
    "descricao": "Venda de produto X",
    "data_transacao": "2025-10-15",
    "usuario": {
      "id": 1,
      "nome": "Maria Silva"
    },
    "categoria": {
      "id": 1,
      "nome": "Vendas"
    }
  },
  "message": "Transação criada com sucesso"
}
```

**Uso no Agente:**
- Principal funcionalidade: Registrar receitas/despesas
- Data padrão: hoje (se não informado)
- Descrição opcional

---

#### `PUT /api/v1/transacoes/:id`
**Descrição:** Atualizar transação existente
**Autenticação:** API Key
**Params:** `id` (number)
**Body (todos campos opcionais):**
```json
{
  "tipo": "receita",
  "valor": 200.00,
  "categoria_id": 2,
  "descricao": "Venda atualizada",
  "data_transacao": "2025-10-16"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "tipo": "receita",
    "valor": 200.00,
    "descricao": "Venda atualizada",
    "data_transacao": "2025-10-16"
  },
  "message": "Transação atualizada com sucesso"
}
```

**Uso no Agente:**
- Corrigir valor errado
- Alterar categoria
- Atualizar descrição

---

#### `DELETE /api/v1/transacoes/:id`
**Descrição:** Deletar transação (soft delete)
**Autenticação:** API Key
**Params:** `id` (number)
**Response:**
```json
{
  "success": true,
  "message": "Transação deletada com sucesso"
}
```

**Uso no Agente:**
- Remover transação lançada por engano
- Confirmar antes de deletar

---

## 🔧 Implementações Necessárias

### ✅ Já Implementado
- ✅ `GET /api/v1/categorias`
- ✅ `GET /api/v1/usuarios`
- ✅ `GET /api/v1/usuarios/chat/:chat_id` - **NOVO!**
- ✅ `POST /api/v1/usuarios`
- ✅ `GET /api/v1/transacoes` (com filtros)
- ✅ `GET /api/v1/transacoes/:id`
- ✅ `POST /api/v1/transacoes`
- ✅ `PUT /api/v1/transacoes/:id`
- ✅ `DELETE /api/v1/transacoes/:id`

### 🚧 A Implementar
- Nada! Todos os endpoints necessários estão prontos! 🎉

---

## 🤖 Fluxo do Agente

### 1️⃣ Primeira Interação do Usuário
```
1. Recebe mensagem no WhatsApp
2. Extrai chat_id da mensagem
3. Chama GET /api/v1/usuarios/chat/{chat_id}
4. Se 404:
   - Chama POST /api/v1/usuarios com dados do contato
5. Guarda usuario_id para uso na conversa
```

### 2️⃣ Registrar Receita/Despesa
```
Usuário: "Registrar receita de 150 reais de vendas"

1. GET /api/v1/categorias (filtrar tipo=receita)
2. Identificar categoria "Vendas" pelo nome/contexto
3. POST /api/v1/transacoes:
   {
     "usuario_id": <id do usuário>,
     "tipo": "receita",
     "valor": 150.00,
     "categoria_id": 1,
     "data_transacao": "2025-10-15"
   }
4. Confirmar: "✅ Receita de R$ 150,00 em Vendas registrada!"
```

### 3️⃣ Listar Transações
```
Usuário: "Quanto eu gastei este mês?"

1. GET /api/v1/transacoes?usuario_id=1&tipo=despesa&data_inicio=2025-10-01&data_fim=2025-10-31
2. Somar valores
3. Responder: "💸 Você gastou R$ 850,00 em Outubro"
4. Listar principais categorias
```

### 4️⃣ Ver Extrato
```
Usuário: "Ver minhas últimas transações"

1. GET /api/v1/transacoes?usuario_id=1
2. Mostrar últimas 10 transações formatadas
3. Separar por tipo (receitas/despesas)
```

### 5️⃣ Deletar Transação
```
Usuário: "Deletar a última transação"

1. GET /api/v1/transacoes?usuario_id=1 (pegar primeira)
2. Mostrar detalhes e pedir confirmação
3. Se confirmar: DELETE /api/v1/transacoes/{id}
4. Confirmar: "🗑️ Transação removida"
```

---

## 🔑 Autenticação

Todas as requisições devem incluir:
```
Headers:
  x-api-key: hkjsaDFSkjSDF39847sfkjdWr23
```

---

## 📝 Próximos Passos

1. ✅ Implementar `GET /api/v1/usuarios/chat/:chat_id`
2. ✅ Testar todos os endpoints com Postman/Thunder Client
3. ✅ Documentar exemplos de uso no Swagger
4. 🔄 Integrar com o agente de WhatsApp
5. 🔄 Criar prompts para o agente entender intenções do usuário
6. 🔄 Implementar tratamento de erros amigável
7. 🔄 Adicionar logging das interações

---

## 💡 Observações

- **usuario_id** sempre será obtido via chat_id
- **data_transacao** padrão é hoje se não informado
- **descricao** é opcional
- Todas as transações usam **soft delete**
- Valores sempre em formato decimal (150.50)
- Datas no formato ISO (YYYY-MM-DD)
