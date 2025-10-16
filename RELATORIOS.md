# 📊 API de Relatórios Financeiros

Documentação completa para geração de relatórios visuais do sistema financeiro.

---

## 🎯 Visão Geral

A API de relatórios permite gerar dashboards visuais em formato de imagem (PNG/JPG) com dados financeiros, incluindo:
- Cards com métricas (Receita, Despesa, Saldo, Resultado)
- Gráficos de pizza por categoria
- Gráficos comparativos
- Layout profissional e responsivo

As imagens são geradas automaticamente e armazenadas no Digital Ocean Spaces.

---

## 🔑 Autenticação

Todas as requisições devem incluir o header:

```
x-api-key: hkjsaDFSkjSDF39847sfkjdWr23
```

---

## 📡 Endpoints

### 1. Gerar Relatório

**POST** `/api/v1/relatorios`

Gera um novo relatório visual com base nos dados financeiros do período especificado.

#### Body Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `usuario_id` | number | Sim | ID do usuário |
| `data_inicio` | string | Sim | Data inicial (YYYY-MM-DD) |
| `data_fim` | string | Sim | Data final (YYYY-MM-DD) |
| `tipo_grafico` | string | Sim | Tipo do relatório/gráfico |
| `categorias_ids` | number[] | Não | IDs das categorias para filtrar |
| `titulo` | string | Não | Título customizado |
| `formato` | string | Não | Formato da imagem (png ou jpg, padrão: png) |

#### Tipos de Gráficos

| Tipo | Descrição |
|------|-----------|
| `geral` | Dashboard completo com cards + 3 gráficos |
| `pizza_receitas` | Gráfico de pizza das receitas por categoria |
| `pizza_despesas` | Gráfico de pizza das despesas por categoria |
| `barras_despesas` | Gráfico de barras das despesas |
| `comparativo` | Gráfico donut comparando receitas vs despesas |
| `categorias_especificas` | Gráfico com categorias filtradas |

#### Exemplo de Requisição (Dashboard Completo)

```bash
curl -X POST http://localhost:3000/api/v1/relatorios \
  -H "Content-Type: application/json" \
  -H "x-api-key: hkjsaDFSkjSDF39847sfkjdWr23" \
  -d '{
    "usuario_id": 1,
    "data_inicio": "2025-10-01",
    "data_fim": "2025-10-31",
    "tipo_grafico": "geral"
  }'
```

#### Exemplo de Requisição (Pizza de Despesas)

```bash
curl -X POST http://localhost:3000/api/v1/relatorios \
  -H "Content-Type: application/json" \
  -H "x-api-key: hkjsaDFSkjSDF39847sfkjdWr23" \
  -d '{
    "usuario_id": 1,
    "data_inicio": "2025-10-01",
    "data_fim": "2025-10-31",
    "tipo_grafico": "pizza_despesas",
    "titulo": "Minhas Despesas de Outubro"
  }'
```

#### Exemplo de Requisição (Categorias Específicas)

```bash
curl -X POST http://localhost:3000/api/v1/relatorios \
  -H "Content-Type: application/json" \
  -H "x-api-key: hkjsaDFSkjSDF39847sfkjdWr23" \
  -d '{
    "usuario_id": 1,
    "data_inicio": "2025-10-01",
    "data_fim": "2025-10-31",
    "tipo_grafico": "categorias_especificas",
    "categorias_ids": [1, 2, 5],
    "titulo": "Análise de Categorias Selecionadas"
  }'
```

#### Response de Sucesso (201)

```json
{
  "success": true,
  "data": {
    "relatorio": {
      "id": 4,
      "url_imagem": "https://produtivi.nyc3.digitaloceanspaces.com/relatorios/relatorio_2_1760561562790.png",
      "tipo_relatorio": "geral",
      "formato": "png",
      "data_inicio": "2025-10-01T00:00:00.000Z",
      "data_fim": "2025-10-31T00:00:00.000Z",
      "criado_em": "2025-10-15T20:52:44.586Z"
    },
    "dados": {
      "receitaTotal": 2416,
      "despesaTotal": 1200,
      "saldo": 1216,
      "receitas": [
        {
          "categoria": "Vendas",
          "valor": 2416
        }
      ],
      "despesas": [
        {
          "categoria": "Cartão de Crédito",
          "valor": 1200
        }
      ],
      "periodo": "01/10/2025 - 31/10/2025"
    }
  },
  "message": "Relatório gerado com sucesso"
}
```

#### Response de Erro (400)

```json
{
  "success": false,
  "message": "Dados inválidos",
  "errors": [
    {
      "campo": "usuario_id",
      "mensagem": "usuario_id deve ser um número positivo"
    }
  ]
}
```

---

### 2. Listar Relatórios

**GET** `/api/v1/relatorios?usuario_id={id}`

Lista todos os relatórios gerados por um usuário.

#### Query Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `usuario_id` | number | Sim | ID do usuário |

#### Exemplo de Requisição

```bash
curl -X GET "http://localhost:3000/api/v1/relatorios?usuario_id=1" \
  -H "x-api-key: hkjsaDFSkjSDF39847sfkjdWr23"
```

#### Response de Sucesso (200)

```json
{
  "success": true,
  "data": [
    {
      "id": 4,
      "usuario_id": 1,
      "tipo_relatorio": "geral",
      "data_inicio": "2025-10-01T00:00:00.000Z",
      "data_fim": "2025-10-31T00:00:00.000Z",
      "filtro_tipo": "ambos",
      "filtro_categoria_id": null,
      "url_imagem": "https://produtivi.nyc3.digitaloceanspaces.com/relatorios/relatorio_2_1760561562790.png",
      "formato": "png",
      "criado_em": "2025-10-15T20:52:44.586Z",
      "usuario": {
        "id": 1,
        "nome": "João Silva",
        "chat_id": 123456
      }
    }
  ],
  "message": "Relatórios listados com sucesso"
}
```

---

### 3. Buscar Relatório por ID

**GET** `/api/v1/relatorios/{id}?usuario_id={usuario_id}`

Busca um relatório específico.

#### Path Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | number | ID do relatório |

#### Query Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `usuario_id` | number | Sim | ID do usuário (validação de propriedade) |

#### Exemplo de Requisição

```bash
curl -X GET "http://localhost:3000/api/v1/relatorios/4?usuario_id=1" \
  -H "x-api-key: hkjsaDFSkjSDF39847sfkjdWr23"
```

#### Response de Sucesso (200)

```json
{
  "success": true,
  "data": {
    "id": 4,
    "usuario_id": 1,
    "tipo_relatorio": "geral",
    "data_inicio": "2025-10-01T00:00:00.000Z",
    "data_fim": "2025-10-31T00:00:00.000Z",
    "filtro_tipo": "ambos",
    "filtro_categoria_id": null,
    "url_imagem": "https://produtivi.nyc3.digitaloceanspaces.com/relatorios/relatorio_2_1760561562790.png",
    "formato": "png",
    "criado_em": "2025-10-15T20:52:44.586Z",
    "usuario": {
      "id": 1,
      "nome": "João Silva",
      "chat_id": 123456
    }
  },
  "message": "Relatório encontrado"
}
```

#### Response de Erro (404)

```json
{
  "success": false,
  "message": "Relatório não encontrado"
}
```

---

## 🎨 Dashboard Geral (tipo: "geral")

Quando você usa `tipo_grafico: "geral"`, é gerado um dashboard completo com:

### Cards de Métricas (Topo)
1. **💰 Receita Total** - Valor total de receitas + percentual do total
2. **💸 Despesa Total** - Valor total de despesas + percentual do total
3. **💵 Saldo** - Receitas - Despesas (positivo/negativo)
4. **📈 Resultado** - Margem líquida em percentual

### Gráficos
1. **Receitas por Categoria** - Gráfico de pizza (doughnut) mostrando distribuição das receitas
2. **Despesas por Categoria** - Gráfico de pizza (doughnut) mostrando distribuição das despesas
3. **Comparativo: Receitas vs Despesas** - Gráfico de barras comparando totais

### Design
- Layout responsivo e profissional
- Cores vibrantes com gradientes
- Cards com sombras e bordas arredondadas
- Gráficos interativos (tooltips com valores e percentuais)
- Rodapé com data/hora de geração

---

## 💡 Casos de Uso

### 1. Relatório Mensal Automático
Gerar dashboard completo todo dia 1º do mês:

```javascript
const response = await fetch('/api/v1/relatorios', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'hkjsaDFSkjSDF39847sfkjdWr23'
  },
  body: JSON.stringify({
    usuario_id: 1,
    data_inicio: '2025-10-01',
    data_fim: '2025-10-31',
    tipo_grafico: 'geral',
    titulo: 'Relatório Mensal - Outubro/2025'
  })
});

const data = await response.json();
console.log('Relatório gerado:', data.data.relatorio.url_imagem);
```

### 2. Análise Semanal de Despesas
Gerar gráfico de pizza das despesas da semana:

```javascript
const response = await fetch('/api/v1/relatorios', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'hkjsaDFSkjSDF39847sfkjdWr23'
  },
  body: JSON.stringify({
    usuario_id: 1,
    data_inicio: '2025-10-14',
    data_fim: '2025-10-20',
    tipo_grafico: 'pizza_despesas',
    titulo: 'Despesas da Semana'
  })
});
```

### 3. Comparativo Trimestral
Gerar gráfico comparativo de 3 meses:

```javascript
const response = await fetch('/api/v1/relatorios', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'hkjsaDFSkjSDF39847sfkjdWr23'
  },
  body: JSON.stringify({
    usuario_id: 1,
    data_inicio: '2025-08-01',
    data_fim: '2025-10-31',
    tipo_grafico: 'comparativo',
    titulo: 'Comparativo Trimestral'
  })
});
```

### 4. Análise de Categorias Específicas
Filtrar apenas categorias importantes:

```javascript
const response = await fetch('/api/v1/relatorios', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'hkjsaDFSkjSDF39847sfkjdWr23'
  },
  body: JSON.stringify({
    usuario_id: 1,
    data_inicio: '2025-10-01',
    data_fim: '2025-10-31',
    tipo_grafico: 'categorias_especificas',
    categorias_ids: [1, 5, 8], // Vendas, Transporte, Alimentação
    titulo: 'Principais Categorias'
  })
});
```

---

## 🔧 Tecnologias Utilizadas

- **Puppeteer** - Renderização de HTML para imagem
- **Chart.js** - Geração de gráficos interativos
- **QuickChart** - API de gráficos para tipos simples
- **Digital Ocean Spaces** - Armazenamento de imagens
- **HTML/CSS** - Template visual profissional

---

## 📝 Notas Importantes

1. **Performance**: A geração de relatórios completos (tipo "geral") pode levar de 2-5 segundos devido à renderização com Puppeteer
2. **Cache**: As imagens são armazenadas permanentemente no Spaces e podem ser reutilizadas
3. **Timezone**: Todas as datas são processadas no fuso horário de São Paulo (America/Sao_Paulo)
4. **Formato de Datas**: Use sempre o formato ISO (YYYY-MM-DD) para `data_inicio` e `data_fim`
5. **Limites**: Não há limite de relatórios por usuário

---

## ❌ Erros Comuns

### Erro 400: Dados inválidos
```json
{
  "success": false,
  "message": "Dados inválidos",
  "errors": [...]
}
```
**Solução**: Verifique se todos os campos obrigatórios estão presentes e com tipos corretos

### Erro 401: Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized: Invalid or missing API key"
}
```
**Solução**: Adicione o header `x-api-key` com a chave correta

### Erro 404: Relatório não encontrado
```json
{
  "success": false,
  "message": "Relatório não encontrado"
}
```
**Solução**: Verifique se o ID do relatório existe e pertence ao usuário informado

### Erro 500: Erro ao gerar relatório
```json
{
  "success": false,
  "message": "Erro ao gerar relatório"
}
```
**Solução**: Verifique os logs do servidor. Possíveis causas:
- Problemas de conexão com o banco de dados
- Falha no upload para Digital Ocean Spaces
- Erro na renderização do Puppeteer

---

## 🚀 Próximos Passos

- [ ] Adicionar mais tipos de gráficos (linha, área)
- [ ] Suportar múltiplos períodos em um único relatório
- [ ] Exportar para PDF além de PNG/JPG
- [ ] Cache inteligente para relatórios frequentes
- [ ] Webhooks para notificar quando relatório estiver pronto

---

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- Swagger UI: `http://localhost:3000/api-docs`
- README principal: `README.md`
- Planejamento: `PLANEJAMENTO.md`
