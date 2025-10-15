# 💰 API Financeiro

Sistema de gerenciamento financeiro REST API desenvolvido para microempreendedoras, com foco em simplicidade e praticidade.

## 🚀 Tecnologias

- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Prisma** - ORM para banco de dados
- **MySQL** - Banco de dados (Digital Ocean)
- **Zod** - Validação de schemas
- **Swagger UI** - Documentação interativa da API

## 📋 Funcionalidades

### ✅ Implementado

- **Categorias**: Gerenciamento de categorias de receitas e despesas
- **Usuários**: Cadastro e gerenciamento de usuários
- **Transações**: Registro de receitas e despesas com filtros avançados
- **Autenticação**: API Key para segurança
- **Soft Delete**: Em todas as entidades
- **Documentação Swagger**: Documentação interativa da API

### 🔜 Próximas Features

- **Relatórios**: Geração de relatórios com gráficos
- **Export**: Exportar relatórios em PDF/PNG
- **Dashboard**: Visualização de métricas financeiras

## 🗄️ Modelo de Dados

### Usuarios
```typescript
{
  id: number
  chat_id: number (unique)
  agent_id: number (unique)
  nome?: string
  status: 'active' | 'inactive' | 'deleted'
  criado_em: DateTime
  deletado_em?: DateTime
}
```

### Categorias
```typescript
{
  id: number
  nome: string
  tipo: 'receita' | 'despesa'
  ativo: boolean
  criado_em: DateTime
  deletado_em?: DateTime
}
```

#### Categorias Pré-cadastradas
**Receitas**: Vendas, Serviços, Outras Receitas
**Despesas**: Matéria Prima, Aluguel, Transporte, Alimentação, Saúde, Cartão de Crédito, Lazer/Informação, Outras Despesas

### Transações
```typescript
{
  id: number
  usuario_id: number
  tipo: 'receita' | 'despesa'
  valor: Decimal(10,2)
  categoria_id: number
  descricao?: string
  data_transacao: Date
  criado_em: DateTime
  atualizado_em: DateTime
  deletado_em?: DateTime
}
```

## 🛠️ Instalação

### 1. Clone o repositório
```bash
git clone <repo-url>
cd financeiro
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais:
```env
# Database
DB_HOST=seu-host
DB_NAME=financeiro
DB_USER=seu-usuario
DB_PASSWORD=sua-senha
DB_PORT=25060

DATABASE_URL="mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslaccept=accept_invalid_certs"

# Security
SECRET_PRIVATE_KEY=sua-chave-secreta-aqui

# Digital Ocean Spaces (opcional - para relatórios futuros)
SPACES_KEY=sua-key
SPACES_SECRET=seu-secret
SPACES_ENDPOINT=nyc3.digitaloceanspaces.com
SPACES_BUCKET=seu-bucket
SPACES_REGION=nyc3
```

### 4. Execute as migrations do banco
```bash
npm run db:migrate
```

Quando solicitado, digite o nome da migration (ex: `init`)

### 5. Rode o seed (categorias padrão)
```bash
npm run db:seed
```

### 6. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

Acesse:
- **Home**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api-docs

## 📡 Endpoints da API

### Base URL
```
/api/v1
```

### Autenticação
Todas as requisições precisam do header:
```
x-api-key: sua-chave-aqui
```

### Categorias

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/categorias` | Listar todas categorias |
| POST | `/categorias` | Criar nova categoria |
| GET | `/categorias/:id` | Buscar categoria por ID |
| PUT | `/categorias/:id` | Atualizar categoria |
| DELETE | `/categorias/:id` | Deletar categoria (soft delete) |

**Exemplo - Criar Categoria:**
```bash
curl -X POST http://localhost:3000/api/v1/categorias \
  -H "x-api-key: sua-chave" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Marketing Digital",
    "tipo": "despesa",
    "ativo": true
  }'
```

### Usuários

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/usuarios` | Listar todos usuários |
| POST | `/usuarios` | Criar novo usuário |
| GET | `/usuarios/:id` | Buscar usuário por ID |
| PUT | `/usuarios/:id` | Atualizar usuário |
| DELETE | `/usuarios/:id` | Deletar usuário (soft delete) |

**Exemplo - Criar Usuário:**
```bash
curl -X POST http://localhost:3000/api/v1/usuarios \
  -H "x-api-key: sua-chave" \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": 123456,
    "agent_id": 789,
    "nome": "Maria Silva",
    "status": "active"
  }'
```

### Transações

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/transacoes` | Listar transações (com filtros) |
| POST | `/transacoes` | Criar nova transação |
| GET | `/transacoes/:id` | Buscar transação por ID |
| PUT | `/transacoes/:id` | Atualizar transação |
| DELETE | `/transacoes/:id` | Deletar transação (soft delete) |

**Filtros disponíveis (query params):**
- `usuario_id` - Filtrar por usuário
- `tipo` - Filtrar por tipo (receita/despesa)
- `categoria_id` - Filtrar por categoria
- `data_inicio` - Data inicial (YYYY-MM-DD)
- `data_fim` - Data final (YYYY-MM-DD)

**Exemplo - Criar Transação:**
```bash
curl -X POST http://localhost:3000/api/v1/transacoes \
  -H "x-api-key: sua-chave" \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 1,
    "tipo": "receita",
    "valor": 150.50,
    "categoria_id": 1,
    "descricao": "Venda de produto X",
    "data_transacao": "2025-10-15"
  }'
```

**Exemplo - Listar com Filtros:**
```bash
curl "http://localhost:3000/api/v1/transacoes?usuario_id=1&tipo=receita&data_inicio=2025-10-01&data_fim=2025-10-31" \
  -H "x-api-key: sua-chave"
```

## 📦 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de dev

# Build
npm run build            # Build para produção
npm run start            # Inicia servidor de produção

# Database
npm run db:generate      # Gera Prisma Client
npm run db:migrate       # Cria e aplica migrations
npm run db:push          # Push schema (sem criar migration)
npm run db:seed          # Executa seed (categorias padrão)
npm run db:studio        # Abre Prisma Studio (GUI do banco)

# Lint
npm run lint             # Executa ESLint
```

## 🏗️ Estrutura do Projeto

```
src/
├── app/
│   ├── api/v1/              # Endpoints da API
│   │   ├── categorias/
│   │   ├── usuarios/
│   │   └── transacoes/
│   ├── api-docs/            # Página do Swagger
│   └── page.tsx             # Home com lista de endpoints
├── controllers/             # Controllers (recebe req, valida, chama service)
│   ├── categoria.controller.ts
│   ├── usuario.controller.ts
│   └── transacao.controller.ts
├── services/                # Services (lógica de negócio + Prisma)
│   ├── categoria.service.ts
│   ├── usuario.service.ts
│   └── transacao.service.ts
├── validators/              # Schemas Zod para validação
│   ├── categoria.validator.ts
│   ├── usuario.validator.ts
│   └── transacao.validator.ts
├── middlewares/             # Middlewares
│   └── auth.middleware.ts   # Validação de API Key
├── types/                   # TypeScript types
│   └── api.ts
└── lib/                     # Utilidades
    ├── prisma.ts            # Prisma Client singleton
    └── swagger.ts           # Spec do Swagger

prisma/
├── schema.prisma            # Schema do banco
└── seed.ts                  # Seed das categorias
```

## 🔒 Segurança

- **API Key**: Todas as rotas são protegidas por API Key
- **Validação**: Todos os inputs são validados com Zod
- **Soft Delete**: Dados não são removidos fisicamente do banco
- **SSL/TLS**: Conexão criptografada com o banco de dados

## 📝 Formato de Resposta

Todas as respostas seguem o padrão:

**Sucesso:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operação realizada com sucesso"
}
```

**Erro:**
```json
{
  "success": false,
  "message": "Descrição do erro",
  "errors": { ... }
}
```

## 🐛 Troubleshooting

### Erro de conexão SSL com MySQL
Se encontrar erro `P1011` (TLS connection error), use:
```env
DATABASE_URL="...?sslaccept=accept_invalid_certs"
```

### Erro de autenticação no banco
Verifique se o usuário existe no banco MySQL e tem permissões corretas.

### Prisma deprecation warning
O warning sobre `package.json#prisma` é normal. Será resolvido na migração para Prisma 7.

## 📄 Licença

Este projeto é privado e de uso interno.

## 👨‍💻 Desenvolvimento

Desenvolvido com ❤️ usando Next.js, TypeScript e Prisma.
# financeiro
