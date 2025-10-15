export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'API Financeiro',
    version: '1.0.0',
    description: 'API REST para gerenciamento financeiro de microempreendedoras',
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API v1',
    },
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
      },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'object' },
          message: { type: 'string' },
        },
      },
      Categoria: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          nome: { type: 'string' },
          tipo: { type: 'string', enum: ['receita', 'despesa'] },
          ativo: { type: 'boolean' },
          criado_em: { type: 'string', format: 'date-time' },
        },
      },
      CriarCategoria: {
        type: 'object',
        required: ['nome', 'tipo'],
        properties: {
          nome: { type: 'string', maxLength: 50 },
          tipo: { type: 'string', enum: ['receita', 'despesa'] },
          ativo: { type: 'boolean', default: true },
        },
      },
      Usuario: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          chat_id: { type: 'integer' },
          agent_id: { type: 'integer' },
          nome: { type: 'string' },
          status: { type: 'string', enum: ['active', 'inactive', 'deleted'] },
          criado_em: { type: 'string', format: 'date-time' },
        },
      },
      CriarUsuario: {
        type: 'object',
        required: ['chat_id', 'agent_id'],
        properties: {
          chat_id: { type: 'integer' },
          agent_id: { type: 'integer' },
          nome: { type: 'string', maxLength: 100 },
          status: { type: 'string', enum: ['active', 'inactive', 'deleted'], default: 'active' },
        },
      },
      Transacao: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          usuario_id: { type: 'integer' },
          tipo: { type: 'string', enum: ['receita', 'despesa'] },
          valor: { type: 'number', format: 'decimal' },
          categoria_id: { type: 'integer' },
          descricao: { type: 'string' },
          data_transacao: { type: 'string', format: 'date' },
          criado_em: { type: 'string', format: 'date-time' },
          atualizado_em: { type: 'string', format: 'date-time' },
          usuario: { $ref: '#/components/schemas/Usuario' },
          categoria: { $ref: '#/components/schemas/Categoria' },
        },
      },
      CriarTransacao: {
        type: 'object',
        required: ['usuario_id', 'tipo', 'valor', 'categoria_id', 'data_transacao'],
        properties: {
          usuario_id: { type: 'integer' },
          tipo: { type: 'string', enum: ['receita', 'despesa'] },
          valor: { type: 'number', format: 'decimal' },
          categoria_id: { type: 'integer' },
          descricao: { type: 'string' },
          data_transacao: { type: 'string', format: 'date' },
        },
      },
    },
  },
  security: [{ ApiKeyAuth: [] }],
  paths: {
    '/categorias': {
      get: {
        tags: ['Categorias'],
        summary: 'Listar todas as categorias',
        responses: {
          '200': {
            description: 'Lista de categorias',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      properties: {
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Categoria' },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Categorias'],
        summary: 'Criar nova categoria',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CriarCategoria' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Categoria criada',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      properties: {
                        data: { $ref: '#/components/schemas/Categoria' },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    '/categorias/{id}': {
      get: {
        tags: ['Categorias'],
        summary: 'Buscar categoria por ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': { description: 'Categoria encontrada' },
          '404': { description: 'Categoria não encontrada' },
        },
      },
      put: {
        tags: ['Categorias'],
        summary: 'Atualizar categoria',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CriarCategoria' },
            },
          },
        },
        responses: {
          '200': { description: 'Categoria atualizada' },
          '404': { description: 'Categoria não encontrada' },
        },
      },
      delete: {
        tags: ['Categorias'],
        summary: 'Deletar categoria (soft delete)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': { description: 'Categoria deletada' },
          '404': { description: 'Categoria não encontrada' },
        },
      },
    },
    '/usuarios': {
      get: {
        tags: ['Usuários'],
        summary: 'Listar todos os usuários',
        responses: {
          '200': { description: 'Lista de usuários' },
        },
      },
      post: {
        tags: ['Usuários'],
        summary: 'Criar novo usuário',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CriarUsuario' },
            },
          },
        },
        responses: {
          '201': { description: 'Usuário criado' },
        },
      },
    },
    '/usuarios/{id}': {
      get: {
        tags: ['Usuários'],
        summary: 'Buscar usuário por ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': { description: 'Usuário encontrado' },
          '404': { description: 'Usuário não encontrado' },
        },
      },
      put: {
        tags: ['Usuários'],
        summary: 'Atualizar usuário',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': { description: 'Usuário atualizado' },
          '404': { description: 'Usuário não encontrado' },
        },
      },
      delete: {
        tags: ['Usuários'],
        summary: 'Deletar usuário (soft delete)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': { description: 'Usuário deletado' },
          '404': { description: 'Usuário não encontrado' },
        },
      },
    },
    '/transacoes': {
      get: {
        tags: ['Transações'],
        summary: 'Listar transações com filtros opcionais',
        parameters: [
          {
            name: 'usuario_id',
            in: 'query',
            schema: { type: 'integer' },
          },
          {
            name: 'tipo',
            in: 'query',
            schema: { type: 'string', enum: ['receita', 'despesa'] },
          },
          {
            name: 'categoria_id',
            in: 'query',
            schema: { type: 'integer' },
          },
          {
            name: 'data_inicio',
            in: 'query',
            schema: { type: 'string', format: 'date' },
          },
          {
            name: 'data_fim',
            in: 'query',
            schema: { type: 'string', format: 'date' },
          },
        ],
        responses: {
          '200': { description: 'Lista de transações' },
        },
      },
      post: {
        tags: ['Transações'],
        summary: 'Criar nova transação',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CriarTransacao' },
            },
          },
        },
        responses: {
          '201': { description: 'Transação criada' },
        },
      },
    },
    '/transacoes/{id}': {
      get: {
        tags: ['Transações'],
        summary: 'Buscar transação por ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': { description: 'Transação encontrada' },
          '404': { description: 'Transação não encontrada' },
        },
      },
      put: {
        tags: ['Transações'],
        summary: 'Atualizar transação',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CriarTransacao' },
            },
          },
        },
        responses: {
          '200': { description: 'Transação atualizada' },
          '404': { description: 'Transação não encontrada' },
        },
      },
      delete: {
        tags: ['Transações'],
        summary: 'Deletar transação (soft delete)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': { description: 'Transação deletada' },
          '404': { description: 'Transação não encontrada' },
        },
      },
    },
  },
};
