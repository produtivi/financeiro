# API de Questionários - Documentação

## Autenticação
Todas as rotas requerem o header `x-api-key` com a chave de API válida.

```bash
x-api-key: hkjsaDFSkjSDF39847sfkjdWr23
```

## Base URL
```
http://localhost:3000/api/v1/questionarios
```

---

## Endpoints

### 1. Criar Questionário

Cria um novo questionário com as respostas de um usuário. Aceita **dois formatos** diferentes:

**Endpoint:** `POST /api/v1/questionarios`

**Headers:**
```
Content-Type: application/json
x-api-key: hkjsaDFSkjSDF39847sfkjdWr23
```

#### Formato 1: Array de Respostas (Recomendado para o Agente)

**Body:**
```json
{
  "usuario_id": 1,
  "respostas": [
    "4",                    // Pergunta 1: Comparação renda/gastos
    "2",                    // Pergunta 2: Estresse financeiro
    "1",                    // Pergunta 3: Redução padrão de vida
    "3",                    // Pergunta 4: Aperto financeiro
    "4",                    // Pergunta 5: Controle de gastos
    "3",                    // Pergunta 6: Capacidade de poupar
    "5",                    // Pergunta 7: Cumprimento de metas
    "Sim",                  // Pergunta 8: Anota receitas/despesas
    "Semanalmente",         // Pergunta 9: Frequência de registro
    "Sim",                  // Pergunta 10: Estabelece metas
    "Uso Excel todos os domingos", // Pergunta 11: Acompanhamento (opcional)
    "Boa confiança"         // Pergunta 12: Nível de confiança
  ]
}
```

#### Formato 2: Objeto com Campos Individuais

**Body:**
```json
{
  "usuario_id": 1,
  "resposta_1": "4",
  "resposta_2": "2",
  "resposta_3": "1",
  "resposta_4": "3",
  "resposta_5": "4",
  "resposta_6": "3",
  "resposta_7": "5",
  "resposta_8": "Sim",
  "resposta_9": "Semanalmente",
  "resposta_10": "Sim",
  "resposta_11": "Uso Excel todos os domingos",
  "resposta_12": "Boa confiança"
}
```

**Resposta de Sucesso (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "usuario_id": 1,
    "resposta_1": "4",
    "resposta_2": "2",
    "resposta_3": "1",
    "resposta_4": "3",
    "resposta_5": "4",
    "resposta_6": "3",
    "resposta_7": "5",
    "resposta_8": "Sim",
    "resposta_9": "Semanalmente",
    "resposta_10": "Sim",
    "resposta_11": "Uso Excel todos os domingos",
    "resposta_12": "Boa confiança",
    "criado_em": "2025-10-28T20:30:00.000Z",
    "atualizado_em": "2025-10-28T20:30:00.000Z",
    "usuario": {
      "id": 1,
      "nome": "João Silva",
      "chat_id": 12345
    }
  },
  "message": "Questionário criado com sucesso"
}
```

**Exemplo cURL (Formato Array):**
```bash
curl -X POST http://localhost:3000/api/v1/questionarios \
  -H "Content-Type: application/json" \
  -H "x-api-key: hkjsaDFSkjSDF39847sfkjdWr23" \
  -d '{
    "usuario_id": 1,
    "respostas": [
      "4",
      "2",
      "1",
      "3",
      "4",
      "3",
      "5",
      "Sim",
      "Semanalmente",
      "Sim",
      "Uso Excel todos os domingos",
      "Boa confiança"
    ]
  }'
```

---

### 2. Listar Questionários

Lista todos os questionários ou filtra por usuário.

**Endpoint:** `GET /api/v1/questionarios`

**Headers:**
```
x-api-key: hkjsaDFSkjSDF39847sfkjdWr23
```

**Query Parameters (opcionais):**
- `usuario_id` - Filtrar questionários de um usuário específico

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "usuario_id": 1,
      "resposta_1": "4",
      "resposta_2": "2",
      "resposta_3": "1",
      "resposta_4": "3",
      "resposta_5": "4",
      "resposta_6": "3",
      "resposta_7": "5",
      "resposta_8": "Sim",
      "resposta_9": "Semanalmente",
      "resposta_10": "Sim",
      "resposta_11": "Uso Excel todos os domingos",
      "resposta_12": "Boa confiança",
      "criado_em": "2025-10-28T20:30:00.000Z",
      "atualizado_em": "2025-10-28T20:30:00.000Z",
      "usuario": {
        "id": 1,
        "nome": "João Silva",
        "chat_id": 12345,
        "agent_id": 67890,
        "telefone": "(11) 98765-4321"
      }
    }
  ],
  "message": "Questionários listados com sucesso"
}
```

**Exemplos cURL:**

Listar todos os questionários:
```bash
curl -X GET http://localhost:3000/api/v1/questionarios \
  -H "x-api-key: hkjsaDFSkjSDF39847sfkjdWr23"
```

Listar questionários de um usuário específico:
```bash
curl -X GET "http://localhost:3000/api/v1/questionarios?usuario_id=1" \
  -H "x-api-key: hkjsaDFSkjSDF39847sfkjdWr23"
```

---

### 3. Buscar Questionário por ID

Retorna detalhes de um questionário específico.

**Endpoint:** `GET /api/v1/questionarios/:id`

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
    "resposta_1": "4",
    "resposta_2": "2",
    "resposta_3": "1",
    "resposta_4": "3",
    "resposta_5": "4",
    "resposta_6": "3",
    "resposta_7": "5",
    "resposta_8": "Sim",
    "resposta_9": "Semanalmente",
    "resposta_10": "Sim",
    "resposta_11": "Uso Excel todos os domingos",
    "resposta_12": "Boa confiança",
    "criado_em": "2025-10-28T20:30:00.000Z",
    "atualizado_em": "2025-10-28T20:30:00.000Z",
    "usuario": {
      "id": 1,
      "nome": "João Silva",
      "chat_id": 12345,
      "agent_id": 67890
    }
  },
  "message": "Questionário encontrado"
}
```

**Exemplo cURL:**
```bash
curl -X GET http://localhost:3000/api/v1/questionarios/1 \
  -H "x-api-key: hkjsaDFSkjSDF39847sfkjdWr23"
```

---

### 4. Obter Métricas Gerais

Retorna estatísticas agregadas de todos os questionários.

**Endpoint:** `GET /api/v1/questionarios/metricas`

**Headers:**
```
x-api-key: hkjsaDFSkjSDF39847sfkjdWr23
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "distribuicao_por_pergunta": {
      "pergunta_1": {
        "1": 10,
        "2": 25,
        "3": 40,
        "4": 50,
        "5": 25
      },
      "pergunta_2": {
        "Nada": 20,
        "Pouco": 45,
        "Moderado": 60,
        "Muito": 25
      },
      "pergunta_8": {
        "Sim": 120,
        "Não": 30
      },
      "pergunta_9": {
        "Diariamente": 50,
        "Semanalmente": 60,
        "Mensalmente": 30,
        "Raramente": 10
      },
      "pergunta_12": {
        "Nenhuma confiança": 5,
        "Pouca confiança": 20,
        "Média confiança": 45,
        "Boa confiança": 60,
        "Total confiança": 20
      }
    }
  },
  "message": "Métricas calculadas com sucesso"
}
```

**Exemplo cURL:**
```bash
curl -X GET http://localhost:3000/api/v1/questionarios/metricas \
  -H "x-api-key: hkjsaDFSkjSDF39847sfkjdWr23"
```

---

## Descrição das Perguntas

| Posição | Pergunta | Tipo de Resposta |
|---------|----------|------------------|
| 1 | Comparação renda/gastos | Escala numérica ou texto |
| 2 | Estresse financeiro | Escala ou descritivo |
| 3 | Redução padrão de vida | Escala ou descritivo |
| 4 | Aperto financeiro | Escala ou descritivo |
| 5 | Controle de gastos | Escala ou descritivo |
| 6 | Capacidade de poupar | Escala ou descritivo |
| 7 | Cumprimento de metas | Escala ou descritivo |
| 8 | Anota receitas/despesas | Sim/Não |
| 9 | Frequência de registro | Diariamente/Semanalmente/etc |
| 10 | Estabelece metas | Sim/Não |
| 11 | Acompanhamento de metas | **Resposta aberta (opcional)** |
| 12 | Nível de confiança | Escala ou descritivo |

---

## Códigos de Erro

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Dados inválidos",
  "errors": {
    "respostas": "Deve conter exatamente 12 respostas"
  }
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Questionário não encontrado"
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

### 1. Usuário responde questionário no agente
```bash
# O agente coleta as 12 respostas e envia para a API
curl -X POST http://localhost:3000/api/v1/questionarios \
  -H "Content-Type: application/json" \
  -H "x-api-key: hkjsaDFSkjSDF39847sfkjdWr23" \
  -d '{
    "usuario_id": 1,
    "respostas": [
      "Os gastos foram um pouco menores que a renda",
      "Pouco",
      "Nada",
      "Mais ou menos",
      "Muito",
      "Mais ou menos",
      "Totalmente",
      "Sim",
      "Semanalmente",
      "Sim",
      "Eu uso uma planilha no Excel e reviso todo domingo",
      "Boa confiança"
    ]
  }'
```

### 2. Ver todos os questionários de um usuário
```bash
curl -X GET "http://localhost:3000/api/v1/questionarios?usuario_id=1" \
  -H "x-api-key: hkjsaDFSkjSDF39847sfkjdWr23"
```

### 3. Ver métricas gerais
```bash
curl -X GET http://localhost:3000/api/v1/questionarios/metricas \
  -H "x-api-key: hkjsaDFSkjSDF39847sfkjdWr23"
```

---

## Notas Importantes

1. **Formato Flexível**: A API aceita tanto array de respostas quanto objeto com campos individuais
2. **Resposta 11 Opcional**: A pergunta 11 é uma resposta aberta e pode ser vazia/null
3. **Usuário Obrigatório**: Sempre informe o `usuario_id` válido
4. **12 Respostas**: Quando usar o formato array, deve conter exatamente 12 elementos
5. **Timestamps Automáticos**: `criado_em` e `atualizado_em` são gerenciados automaticamente
6. **Sem Atualização**: Questionários não podem ser editados após criação (apenas criação e leitura)
7. **Métricas em Tempo Real**: As métricas são calculadas dinamicamente a cada requisição

---

## Dashboard Web

Acesse as seguintes páginas no painel administrativo:

- **Visualização Geral**: `/dashboard/questionarios`
  - Aba "Por Usuário": Lista todos os questionários com filtros
  - Aba "Métricas Gerais": Gráficos e estatísticas consolidadas
  - Distribuição de respostas por pergunta
  - Percentuais e visualizações
