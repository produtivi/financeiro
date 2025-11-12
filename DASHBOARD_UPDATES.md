# Atualizações da Dashboard - Impact Hub

## Resumo das Implementações

### 1. Dashboard Refatorada

A dashboard principal foi completamente refatorada com novas funcionalidades e visualizações.

#### Novas Funcionalidades:

**Filtros Avançados:**
- Filtro de período: Última Semana (padrão, começando no domingo), Último Mês, Último Ano, Personalizado
- Filtro por Grupo Experimental
- Filtro por Usuário (dependente do grupo selecionado)
- Date pickers para início e fim personalizados

**Visualizações Adicionadas:**
- Gráfico de Pizza: Distribuição de usuários por grupos experimentais
- Gráfico de Barras: Transações por tipo de entrada (texto, áudio, foto, vídeo, nota_fiscal)
- Cards de Saldo Segregado: Caixa Pessoal vs Caixa Negócio
- Percentual de registros classificados como "negócio" vs "pessoal"

**Métricas Financeiras por Tipo de Caixa:**
- Caixa Pessoal:
  - Receitas
  - Despesas
  - Saldo
  - Quantidade de transações
  - Percentual do total

- Caixa Negócio:
  - Receitas
  - Despesas
  - Saldo
  - Quantidade de transações
  - Percentual do total

### 2. Controle de Acesso

**Implementação de controle por agentes:**
- Usuários com role `master`: Visualizam todos os dados do sistema
- Usuários com role `admin` ou `user`: Visualizam apenas dados dos agentes vinculados através da tabela `AdminAgente`

### 3. Backend - Novos Endpoints

**Dashboard:**
- `GET /api/v1/dashboard/metricas` - Obtém métricas agregadas
  - Query params: `startDate`, `endDate`, `grupoId?`, `usuarioId?`
  - Retorna: métricas de usuários, transações (com segregação pessoal/negócio), metas

- `GET /api/v1/dashboard/grupos` - Lista grupos experimentais acessíveis

- `GET /api/v1/dashboard/usuarios` - Lista usuários filtrados
  - Query params: `grupoId?`

**Latência:**
- `POST /api/v1/latencias` - Registra nova latência
  - Body:
    ```json
    {
      "usuario_id": number,
      "agent_id": number,
      "momento_lembrete": "ISO8601 datetime",
      "momento_resposta": "ISO8601 datetime",
      "tipo_lembrete": "string (opcional)",
      "respondeu": boolean (opcional, default: true)
    }
    ```
  - Calcula automaticamente `latencia_segundos`

- `GET /api/v1/latencias` - Lista todas as latências
  - Query params: `usuario_id?`

- `GET /api/v1/latencias/estatisticas` - Estatísticas de latência
  - Query params: `usuario_id?`
  - Retorna:
    - total: número total de registros
    - latencia_media: média em segundos
    - latencia_minima: menor latência em segundos
    - latencia_maxima: maior latência em segundos
    - taxa_resposta: percentual de respostas

### 4. Banco de Dados

**Nova Tabela: `latencias`**
```sql
CREATE TABLE latencias (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  agent_id INT NOT NULL,
  momento_lembrete DATETIME NOT NULL,
  momento_resposta DATETIME NOT NULL,
  latencia_segundos INT NOT NULL,
  tipo_lembrete VARCHAR(100),
  respondeu BOOLEAN DEFAULT TRUE,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_agent_id (agent_id),
  INDEX idx_momento_lembrete (momento_lembrete),
  INDEX idx_criado_em (criado_em)
);
```

### 5. Correções

**Bug de Tipos de Entrada:**
- Corrigido problema onde transações por áudio e foto não apareciam
- O serviço agora conta corretamente todos os tipos de entrada do enum `TipoEntrada`

### 6. Arquitetura

**Services:**
- `dashboard.service.ts` - Lógica de agregação de métricas com filtros
- `latencia.service.ts` - Gerenciamento de latências

**Controllers:**
- `dashboard.controller.ts` - Endpoints de dashboard com validação
- `latencia.controller.ts` - Endpoints de latência com validação Zod

**Frontend:**
- `/dashboard/page.tsx` - Interface completa com filtros e gráficos (Recharts)

## Como Usar

### Registrar Latência (Sistema Externo)

```bash
curl -X POST https://seu-dominio.com/api/v1/latencias \
  -H "Content-Type: application/json" \
  -H "x-api-key: SUA_API_KEY" \
  -d '{
    "usuario_id": 1,
    "agent_id": 123,
    "momento_lembrete": "2025-11-12T10:00:00Z",
    "momento_resposta": "2025-11-12T10:05:30Z",
    "tipo_lembrete": "meta_diaria",
    "respondeu": true
  }'
```

### Consultar Estatísticas

```bash
curl -X GET "https://seu-dominio.com/api/v1/latencias/estatisticas?usuario_id=1" \
  -H "Authorization: Bearer SEU_TOKEN"
```

## Próximos Passos Sugeridos

1. **Dashboard de Latência**: Criar página específica para visualizar métricas de latência
2. **Alertas**: Implementar alertas quando latência ultrapassa threshold
3. **Exportação**: Adicionar funcionalidade de exportar dados para CSV/Excel
4. **Gráficos Temporais**: Adicionar gráficos de linha mostrando evolução temporal das métricas

## Bibliotecas Adicionadas

- **recharts**: `^2.15.0` - Biblioteca de gráficos para React

## Notas Técnicas

- Período padrão da dashboard: Última semana começando no domingo
- Todos os filtros são aplicados em conjunto (AND logic)
- Latência é calculada automaticamente em segundos no backend
- Controle de acesso é feito via session do NextAuth
- Database push foi usado para aplicar mudanças no schema (prisma db push)
