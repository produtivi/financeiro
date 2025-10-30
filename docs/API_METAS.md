# API de Metas - Documentação

## Autenticação
Todas as rotas requerem o header `x-api-key` com a chave de API válida.

```bash
x-api-key: hkjsaDFSkjSDF39847sfkjdWr23
```

## Base URL
```
http://localhost:3000/api/v1/metas
```

---

## Endpoints

### 1. Criar Meta

Cria uma nova meta para um usuário.

**Endpoint:** `POST /api/v1/metas`

**Headers:**
```
Content-Type: application/json
x-api-key: hkjsaDFSkjSDF39847sfkjdWr23
```

**Body:**
```json
{
  "usuario_id": 1,
  "descricao": "Economizar R$ 5000 para reserva de emergência",
  "tipo_meta": "reserva_financeira",
  "data_inicio": "2025-01-01",
  "data_fim": "2025-12-31"
}
```

**Tipos de Meta Disponíveis:**
- `reserva_financeira` - Reserva Financeira
- `controle_inventario` - Controle de Inventário
- `meta_vendas` - Meta de Vendas
- `pagamento_contas` - Pagamento de Contas
- `outro` - Outro

**Resposta de Sucesso (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "usuario_id": 1,
    "descricao": "Economizar R$ 5000 para reserva de emergência",
    "tipo_meta": "reserva_financeira",
    "data_inicio": "2025-01-01T00:00:00.000Z",
    "data_fim": "2025-12-31T00:00:00.000Z",
    "cumprida": null,
    "criado_em": "2025-10-28T19:30:00.000Z",
    "respondido_em": null
  },
  "message": "Meta criada com sucesso"
}
```

**Exemplo cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/metas \
  -H "Content-Type: application/json" \
  -H "x-api-key: hkjsaDFSkjSDF39847sfkjdWr23" \
  -d '{
    "usuario_id": 1,
    "descricao": "Economizar R$ 5000 para reserva de emergência",
    "tipo_meta": "reserva_financeira",
    "data_inicio": "2025-01-01",
    "data_fim": "2025-12-31"
  }'
```

---

### 2. Listar Metas

Lista todas as metas com filtros opcionais.

**Endpoint:** `GET /api/v1/metas`

**Headers:**
```
x-api-key: hkjsaDFSkjSDF39847sfkjdWr23
```

**Query Parameters (todos opcionais):**
- `usuario_id` - Filtrar por ID do usuário
- `tipo_meta` - Filtrar por tipo de meta
- `cumprida` - Filtrar por status (true/false)
- `data_inicio` - Filtrar por data de início (YYYY-MM-DD)
- `data_fim` - Filtrar por data de fim (YYYY-MM-DD)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "usuario_id": 1,
      "descricao": "Economizar R$ 5000 para reserva de emergência",
      "tipo_meta": "reserva_financeira",
      "data_inicio": "2025-01-01T00:00:00.000Z",
      "data_fim": "2025-12-31T00:00:00.000Z",
      "cumprida": null,
      "criado_em": "2025-10-28T19:30:00.000Z",
      "respondido_em": null,
      "usuario": {
        "id": 1,
        "nome": "João Silva",
        "chat_id": 12345,
        "agent_id": 67890
      }
    }
  ],
  "message": "Metas listadas com sucesso"
}
```

**Exemplos cURL:**

Listar todas as metas:
```bash
curl -X GET http://localhost:3000/api/v1/metas \
  -H "x-api-key: hkjsaDFSkjSDF39847sfkjdWr23"
```

Listar metas de um usuário específico:
```bash
curl -X GET "http://localhost:3000/api/v1/metas?usuario_id=1" \
  -H "x-api-key: hkjsaDFSkjSDF39847sfkjdWr23"
```

Listar apenas metas cumpridas:
```bash
curl -X GET "http://localhost:3000/api/v1/metas?cumprida=true" \
  -H "x-api-key: hkjsaDFSkjSDF39847sfkjdWr23"
```

Listar metas por tipo:
```bash
curl -X GET "http://localhost:3000/api/v1/metas?tipo_meta=reserva_financeira" \
  -H "x-api-key: hkjsaDFSkjSDF39847sfkjdWr23"
```

---

### 3. Buscar Meta por ID

Retorna detalhes de uma meta específica.

**Endpoint:** `GET /api/v1/metas/:id`

**Headers:**
```
x-api-key: hkjsaDFSkjSDF39847sfkjdWr23
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "usuario_id": 1,
    "descricao": "Economizar R$ 5000 para reserva de emergência",
    "tipo_meta": "reserva_financeira",
    "data_inicio": "2025-01-01T00:00:00.000Z",
    "data_fim": "2025-12-31T00:00:00.000Z",
    "cumprida": null,
    "criado_em": "2025-10-28T19:30:00.000Z",
    "respondido_em": null,
    "usuario": {
      "id": 1,
      "nome": "João Silva",
      "chat_id": 12345,
      "agent_id": 67890
    }
  },
  "message": "Meta encontrada"
}
```

**Exemplo cURL:**
```bash
curl -X GET http://localhost:3000/api/v1/metas/1 \
  -H "x-api-key: hkjsaDFSkjSDF39847sfkjdWr23"
```

---

### 4. Atualizar Meta

Atualiza informações de uma meta existente.

**Endpoint:** `PUT /api/v1/metas/:id`

**Headers:**
```
Content-Type: application/json
x-api-key: hkjsaDFSkjSDF39847sfkjdWr23
```

**Body (todos os campos são opcionais):**
```json
{
  "descricao": "Economizar R$ 10000 para reserva de emergência",
  "tipo_meta": "reserva_financeira",
  "data_inicio": "2025-01-01",
  "data_fim": "2025-12-31"
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "usuario_id": 1,
    "descricao": "Economizar R$ 10000 para reserva de emergência",
    "tipo_meta": "reserva_financeira",
    "data_inicio": "2025-01-01T00:00:00.000Z",
    "data_fim": "2025-12-31T00:00:00.000Z",
    "cumprida": null,
    "criado_em": "2025-10-28T19:30:00.000Z",
    "respondido_em": null
  },
  "message": "Meta atualizada com sucesso"
}
```

**Exemplo cURL:**
```bash
curl -X PUT http://localhost:3000/api/v1/metas/1 \
  -H "Content-Type: application/json" \
  -H "x-api-key: hkjsaDFSkjSDF39847sfkjdWr23" \
  -d '{
    "descricao": "Economizar R$ 10000 para reserva de emergência"
  }'
```

---

### 5. Marcar Meta como Cumprida/Não Cumprida

Atualiza o status de cumprimento de uma meta.

**Endpoint:** `PUT /api/v1/metas/:id/cumprida`

**Headers:**
```
Content-Type: application/json
x-api-key: hkjsaDFSkjSDF39847sfkjdWr23
```

**Body:**
```json
{
  "cumprida": true
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "usuario_id": 1,
    "descricao": "Economizar R$ 5000 para reserva de emergência",
    "tipo_meta": "reserva_financeira",
    "data_inicio": "2025-01-01T00:00:00.000Z",
    "data_fim": "2025-12-31T00:00:00.000Z",
    "cumprida": true,
    "criado_em": "2025-10-28T19:30:00.000Z",
    "respondido_em": "2025-10-28T20:00:00.000Z"
  },
  "message": "Status de cumprimento atualizado"
}
```

**Exemplo cURL:**

Marcar como cumprida:
```bash
curl -X PUT http://localhost:3000/api/v1/metas/1/cumprida \
  -H "Content-Type: application/json" \
  -H "x-api-key: hkjsaDFSkjSDF39847sfkjdWr23" \
  -d '{"cumprida": true}'
```

Marcar como não cumprida:
```bash
curl -X PUT http://localhost:3000/api/v1/metas/1/cumprida \
  -H "Content-Type: application/json" \
  -H "x-api-key: hkjsaDFSkjSDF39847sfkjdWr23" \
  -d '{"cumprida": false}'
```

---

### 6. Deletar Meta

Remove uma meta (soft delete).

**Endpoint:** `DELETE /api/v1/metas/:id`

**Headers:**
```
x-api-key: hkjsaDFSkjSDF39847sfkjdWr23
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Meta deletada com sucesso"
}
```

**Exemplo cURL:**
```bash
curl -X DELETE http://localhost:3000/api/v1/metas/1 \
  -H "x-api-key: hkjsaDFSkjSDF39847sfkjdWr23"
```

---

### 7. Estatísticas de Metas

Retorna estatísticas agregadas de metas de um usuário.

**Endpoint:** `GET /api/v1/metas/estatisticas`

**Headers:**
```
x-api-key: hkjsaDFSkjSDF39847sfkjdWr23
```

**Query Parameters:**
- `usuario_id` (obrigatório) - ID do usuário

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "total": 10,
    "cumpridas": 7,
    "nao_cumpridas": 2,
    "pendentes": 1,
    "taxa_cumprimento": 77.78,
    "por_tipo": {
      "reserva_financeira": 3,
      "meta_vendas": 4,
      "pagamento_contas": 2,
      "outro": 1
    }
  },
  "message": "Estatísticas calculadas com sucesso"
}
```

**Exemplo cURL:**
```bash
curl -X GET "http://localhost:3000/api/v1/metas/estatisticas?usuario_id=1" \
  -H "x-api-key: hkjsaDFSkjSDF39847sfkjdWr23"
```

---

## Buscar Usuário por Chat ID (com Grupo)

**Endpoint:** `GET /api/v1/usuarios/chat/:chat_id`

**Headers:**
```
x-api-key: hkjsaDFSkjSDF39847sfkjdWr23
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "chat_id": 12345,
    "agent_id": 67890,
    "nome": "João Silva",
    "telefone": "(11) 98765-4321",
    "grupo_id": 2,
    "status": "active",
    "grupo_experimental": "padrao",
    "criado_em": "2025-10-28T19:30:00.000Z",
    "deletado_em": null,
    "grupo": {
      "id": 2,
      "nome": "Grupo Premium",
      "descricao": "Usuários premium com acesso completo"
    }
  },
  "message": "Usuário encontrado"
}
```

**Exemplo cURL:**
```bash
curl -X GET http://localhost:3000/api/v1/usuarios/chat/12345 \
  -H "x-api-key: hkjsaDFSkjSDF39847sfkjdWr23"
```

---

## Códigos de Erro

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Dados inválidos",
  "errors": {
    "descricao": "Descrição deve ter no mínimo 3 caracteres"
  }
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Meta não encontrada"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "API key inválida ou ausente"
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Erro interno do servidor"
}
```

---

## Fluxo de Uso Completo

### 1. Criar uma meta para um usuário
```bash
curl -X POST http://localhost:3000/api/v1/metas \
  -H "Content-Type: application/json" \
  -H "x-api-key: hkjsaDFSkjSDF39847sfkjdWr23" \
  -d '{
    "usuario_id": 1,
    "descricao": "Vender R$ 50.000 em produtos este mês",
    "tipo_meta": "meta_vendas",
    "data_inicio": "2025-11-01",
    "data_fim": "2025-11-30"
  }'
```

### 2. Listar metas do usuário
```bash
curl -X GET "http://localhost:3000/api/v1/metas?usuario_id=1" \
  -H "x-api-key: hkjsaDFSkjSDF39847sfkjdWr23"
```

### 3. Marcar meta como cumprida
```bash
curl -X PUT http://localhost:3000/api/v1/metas/1/cumprida \
  -H "Content-Type: application/json" \
  -H "x-api-key: hkjsaDFSkjSDF39847sfkjdWr23" \
  -d '{"cumprida": true}'
```

### 4. Ver estatísticas
```bash
curl -X GET "http://localhost:3000/api/v1/metas/estatisticas?usuario_id=1" \
  -H "x-api-key: hkjsaDFSkjSDF39847sfkjdWr23"
```

### 5. Buscar usuário com informações do grupo
```bash
curl -X GET http://localhost:3000/api/v1/usuarios/chat/12345 \
  -H "x-api-key: hkjsaDFSkjSDF39847sfkjdWr23"
```

---

## Notas Importantes

1. **Datas**: Sempre use o formato `YYYY-MM-DD` para datas
2. **Status cumprida**:
   - `null` = Pendente (ainda não respondida)
   - `true` = Cumprida
   - `false` = Não cumprida
3. **Soft Delete**: Metas deletadas não são removidas do banco, apenas marcadas como deletadas
4. **Grupos**: A busca por chat_id agora retorna informações do grupo ao qual o usuário pertence
5. **Filtros**: Múltiplos filtros podem ser combinados nas queries
