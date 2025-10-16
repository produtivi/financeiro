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
      Relatorio: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          usuario_id: { type: 'integer' },
          tipo_relatorio: { type: 'string', enum: ['geral', 'receitas', 'despesas', 'por_categoria'] },
          data_inicio: { type: 'string', format: 'date' },
          data_fim: { type: 'string', format: 'date' },
          filtro_tipo: { type: 'string', enum: ['receita', 'despesa', 'ambos'] },
          filtro_categoria_id: { type: 'integer', nullable: true },
          url_imagem: { type: 'string' },
          formato: { type: 'string', enum: ['pdf', 'png', 'jpg'] },
          criado_em: { type: 'string', format: 'date-time' },
        },
      },
      GerarRelatorio: {
        type: 'object',
        required: ['usuario_id', 'data_inicio', 'data_fim', 'tipo_grafico'],
        properties: {
          usuario_id: { type: 'integer' },
          data_inicio: { type: 'string', format: 'date', example: '2025-10-01' },
          data_fim: { type: 'string', format: 'date', example: '2025-10-31' },
          tipo_grafico: {
            type: 'string',
            enum: ['geral', 'pizza_receitas', 'pizza_despesas', 'barras_despesas', 'comparativo', 'categorias_especificas'],
            description: 'Tipo de gráfico a ser gerado'
          },
          categorias_ids: {
            type: 'array',
            items: { type: 'integer' },
            description: 'IDs das categorias (opcional, para filtros específicos)'
          },
          titulo: {
            type: 'string',
            maxLength: 255,
            description: 'Título customizado do relatório'
          },
          formato: {
            type: 'string',
            enum: ['png', 'jpg'],
            default: 'png'
          },
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
    '/usuarios/chat/{chat_id}': {
      get: {
        tags: ['Usuários'],
        summary: 'Buscar usuário por chat_id do WhatsApp',
        description: 'Endpoint usado para identificar usuário pela conversa do WhatsApp',
        parameters: [
          {
            name: 'chat_id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID do chat do WhatsApp',
          },
        ],
        responses: {
          '200': {
            description: 'Usuário encontrado',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      properties: {
                        data: { $ref: '#/components/schemas/Usuario' },
                      },
                    },
                  ],
                },
              },
            },
          },
          '404': { description: 'Usuário não encontrado' },
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
    '/relatorios': {
      post: {
        tags: ['Relatórios'],
        summary: 'Gerar relatório com imagem',
        description: 'Gera um relatório financeiro visual, salva a imagem no Digital Ocean Spaces e retorna a URL + dados estruturados',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/GerarRelatorio' },
              examples: {
                dashboard_geral: {
                  summary: 'Dashboard Geral',
                  value: {
                    usuario_id: 1,
                    data_inicio: '2025-10-01',
                    data_fim: '2025-10-31',
                    tipo_grafico: 'geral',
                    titulo: 'Dashboard Mensal - Outubro',
                    formato: 'png'
                  }
                },
                pizza_despesas: {
                  summary: 'Pizza de Despesas',
                  value: {
                    usuario_id: 1,
                    data_inicio: '2025-10-01',
                    data_fim: '2025-10-31',
                    tipo_grafico: 'pizza_despesas',
                    formato: 'png'
                  }
                },
                categorias_filtradas: {
                  summary: 'Categorias Específicas',
                  value: {
                    usuario_id: 1,
                    data_inicio: '2025-10-15',
                    data_fim: '2025-10-20',
                    tipo_grafico: 'categorias_especificas',
                    categorias_ids: [1, 2, 5],
                    titulo: 'Análise de Categorias Selecionadas'
                  }
                }
              }
            },
          },
        },
        responses: {
          '201': {
            description: 'Relatório gerado com sucesso',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            relatorio: { $ref: '#/components/schemas/Relatorio' },
                            dados: {
                              type: 'object',
                              properties: {
                                receitaTotal: { type: 'number' },
                                despesaTotal: { type: 'number' },
                                saldo: { type: 'number' },
                                receitas: {
                                  type: 'array',
                                  items: {
                                    type: 'object',
                                    properties: {
                                      categoria: { type: 'string' },
                                      valor: { type: 'number' }
                                    }
                                  }
                                },
                                despesas: {
                                  type: 'array',
                                  items: {
                                    type: 'object',
                                    properties: {
                                      categoria: { type: 'string' },
                                      valor: { type: 'number' }
                                    }
                                  }
                                },
                                periodo: { type: 'string' }
                              }
                            }
                          }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          '400': { description: 'Dados inválidos' },
          '500': { description: 'Erro ao gerar relatório' }
        },
      },
      get: {
        tags: ['Relatórios'],
        summary: 'Listar relatórios do usuário',
        description: 'Lista todos os relatórios gerados por um usuário',
        parameters: [
          {
            name: 'usuario_id',
            in: 'query',
            required: true,
            schema: { type: 'integer' },
            description: 'ID do usuário'
          }
        ],
        responses: {
          '200': {
            description: 'Lista de relatórios',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      properties: {
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Relatorio' }
                        }
                      }
                    }
                  ]
                }
              }
            }
          },
          '400': { description: 'usuario_id é obrigatório' }
        }
      }
    },
    '/relatorios/{id}': {
      get: {
        tags: ['Relatórios'],
        summary: 'Buscar relatório específico',
        description: 'Retorna um relatório específico do usuário',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID do relatório'
          },
          {
            name: 'usuario_id',
            in: 'query',
            required: true,
            schema: { type: 'integer' },
            description: 'ID do usuário'
          }
        ],
        responses: {
          '200': {
            description: 'Relatório encontrado',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      properties: {
                        data: { $ref: '#/components/schemas/Relatorio' }
                      }
                    }
                  ]
                }
              }
            }
          },
          '404': { description: 'Relatório não encontrado' },
          '400': { description: 'usuario_id é obrigatório' }
        }
      }
    }
  },
};
