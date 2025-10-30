# Painel Administrativo - Impact Hub

Sistema SaaS para gestão financeira de mulheres empreendedoras.

## 🚀 Como Começar

### 1. Criar o primeiro admin

```bash
npm run admin:create
```

O script vai pedir:
- Nome completo
- Email
- Senha (mínimo 6 caracteres)

### 2. Fazer login

Acesse: `http://localhost:3000`

Você será redirecionado para `/login`

Use o email e senha que você criou.

## 📋 Funcionalidades

### Dashboard Principal
- **Métricas Gerais**: Total de usuários, receitas, despesas e saldo
- **Grupos Experimentais**: Visualização da distribuição dos usuários (controle, padrão, acolhedor)
- **Metas**: Taxa de cumprimento e estatísticas de metas semanais

### Páginas Disponíveis

1. **Dashboard** (`/dashboard`)
   - Visão geral com cards de estatísticas
   - Gráficos de metas e grupos experimentais

2. **Usuários** (`/dashboard/usuarios`)
   - Listar todos os usuários do sistema
   - Filtrar por grupo experimental
   - Ver status (ativo/inativo)

3. **Transações** (`/dashboard/transacoes`)
   - Visualizar todas as transações
   - Filtrar por tipo (receita/despesa)
   - Filtrar por tipo de caixa (pessoal/negócio)
   - Filtrar por categoria

4. **Metas** (`/dashboard/metas`)
   - Ver metas de todos os usuários
   - Filtrar por usuário
   - Ver taxa de cumprimento
   - Estatísticas por tipo de meta

5. **Categorias** (`/dashboard/categorias`)
   - Gerenciar categorias de receitas e despesas
   - Ativar/desativar categorias

## 🎨 Design

Layout SaaS moderno com:
- Sidebar lateral com navegação
- Dark mode
- Cards de métricas
- Gráficos e estatísticas
- Responsivo (mobile-friendly)

## 🔐 Autenticação

Sistema de autenticação com:
- Login via email/senha
- NextAuth.js
- Senha criptografada com bcrypt
- Sessão JWT

### Criar mais admins

Para criar admins adicionais, rode novamente:

```bash
npm run admin:create
```

Ou use a rota de API diretamente:

```bash
POST /api/auth/register
{
  "nome": "Nome do Admin",
  "email": "admin@email.com",
  "senha": "senha123"
}
```

## 📊 API

Todas as rotas da API continuam funcionando normalmente com autenticação via `x-api-key`:

```bash
GET /api/v1/usuarios
GET /api/v1/transacoes
GET /api/v1/metas
GET /api/v1/categorias
```

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Autenticação**: NextAuth.js
- **Database**: MySQL (Prisma ORM)
- **Icons**: Lucide React
- **Senha**: bcryptjs

## 🔄 Fluxo de Uso

1. Admin acessa `/login`
2. Faz login com email/senha
3. É redirecionado para `/dashboard`
4. Navega pelas páginas usando a sidebar
5. Visualiza métricas e gerencia o sistema
6. Faz logout quando quiser

## 📝 Notas

- O primeiro acesso sempre vai para a página de login
- Usuários não autenticados são redirecionados para `/login`
- A sessão é mantida via JWT
- As páginas antigas (`/usuarios`, `/transacoes`, etc.) ainda existem mas não são usadas no novo painel
