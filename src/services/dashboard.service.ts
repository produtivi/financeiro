import { prisma } from '@/lib/prisma';

interface DashboardMetricsFilters {
  startDate: Date;
  endDate: Date;
  agentIds?: number[];
  grupoId?: number;
  usuarioId?: number;
}

export class DashboardService {
  async obterMetricas(filters: DashboardMetricsFilters) {
    const { startDate, endDate, agentIds, grupoId, usuarioId } = filters;

    const whereUsuario: any = { deletado_em: null };

    if (agentIds && agentIds.length > 0) {
      whereUsuario.agent_id = { in: agentIds };
    }

    if (grupoId) {
      whereUsuario.grupo_id = grupoId;
    }

    if (usuarioId) {
      whereUsuario.id = usuarioId;
    }

    const usuariosPermitidos = await prisma.usuario.findMany({
      where: whereUsuario,
      select: { id: true },
    });

    const usuarioIds = usuariosPermitidos.map((u) => u.id);

    if (usuarioIds.length === 0) {
      return {
        usuarios: { total: 0, ativos: 0, porGrupo: {} },
        transacoes: {
          total: 0,
          receitas: 0,
          despesas: 0,
          saldo: 0,
          totalReceitas: 0,
          totalDespesas: 0,
          porTipoEntrada: {},
          pessoal: {
            receitas: 0,
            despesas: 0,
            saldo: 0,
            quantidade: 0,
          },
          negocio: {
            receitas: 0,
            despesas: 0,
            saldo: 0,
            quantidade: 0,
          },
          percentualNegocio: 0,
          percentualPessoal: 0,
        },
        metas: {
          total: 0,
          cumpridas: 0,
          naoCumpridas: 0,
          pendentes: 0,
          taxaCumprimento: 0,
          porTipoMeta: {},
        },
        mensagens: { total: 0, porTipo: {} },
        engagementStats: null,
      };
    }

    const [usuarios, transacoes, metas, mensagens, engagementStats] = await Promise.all([
      prisma.usuario.findMany({
        where: {
          id: { in: usuarioIds },
          deletado_em: null,
        },
        include: {
          grupo: {
            select: { nome: true },
          },
        },
      }),
      prisma.transacao.findMany({
        where: {
          usuario_id: { in: usuarioIds },
          deletado_em: null,
          data_transacao: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          id: true,
          tipo: true,
          tipo_caixa: true,
          tipo_entrada: true,
          valor: true,
          data_transacao: true,
          categoria: {
            select: { nome: true },
          },
        },
      }),
      prisma.meta.findMany({
        where: {
          usuario_id: { in: usuarioIds },
          data_inicio: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          id: true,
          tipo_meta: true,
          cumprida: true,
          data_inicio: true,
          data_fim: true,
        },
      }),
      this.obterMetricasMensagens(filters),
      this.obterEngagementStats(filters),
    ]);

    const porGrupo: Record<string, number> = {};
    usuarios.forEach((u) => {
      const grupo = u.grupo?.nome || 'Sem Grupo';
      porGrupo[grupo] = (porGrupo[grupo] || 0) + 1;
    });

    const receitas = transacoes.filter((t) => t.tipo === 'receita');
    const despesas = transacoes.filter((t) => t.tipo === 'despesa');

    const totalReceitas = receitas.reduce((sum, t) => sum + Number(t.valor), 0);
    const totalDespesas = despesas.reduce((sum, t) => sum + Number(t.valor), 0);

    const porTipoEntrada: Record<string, number> = {};
    transacoes.forEach((t) => {
      porTipoEntrada[t.tipo_entrada] = (porTipoEntrada[t.tipo_entrada] || 0) + 1;
    });

    const transacoesPessoal = transacoes.filter((t) => t.tipo_caixa === 'pessoal');
    const transacoesNegocio = transacoes.filter((t) => t.tipo_caixa === 'negocio');

    const receitasPessoal = transacoesPessoal
      .filter((t) => t.tipo === 'receita')
      .reduce((sum, t) => sum + Number(t.valor), 0);
    const despesasPessoal = transacoesPessoal
      .filter((t) => t.tipo === 'despesa')
      .reduce((sum, t) => sum + Number(t.valor), 0);

    const receitasNegocio = transacoesNegocio
      .filter((t) => t.tipo === 'receita')
      .reduce((sum, t) => sum + Number(t.valor), 0);
    const despesasNegocio = transacoesNegocio
      .filter((t) => t.tipo === 'despesa')
      .reduce((sum, t) => sum + Number(t.valor), 0);

    const percentualNegocio =
      transacoes.length > 0 ? (transacoesNegocio.length / transacoes.length) * 100 : 0;
    const percentualPessoal =
      transacoes.length > 0 ? (transacoesPessoal.length / transacoes.length) * 100 : 0;

    const metasCumpridas = metas.filter((m) => m.cumprida === true).length;
    const metasNaoCumpridas = metas.filter((m) => m.cumprida === false).length;
    const metasPendentes = metas.filter((m) => m.cumprida === null).length;
    const taxaCumprimento =
      metasCumpridas + metasNaoCumpridas > 0
        ? (metasCumpridas / (metasCumpridas + metasNaoCumpridas)) * 100
        : 0;

    const porTipoMeta: Record<string, number> = {};
    metas.forEach((m) => {
      porTipoMeta[m.tipo_meta] = (porTipoMeta[m.tipo_meta] || 0) + 1;
    });

    return {
      usuarios: {
        total: usuarios.length,
        ativos: usuarios.filter((u) => u.status === 'active').length,
        porGrupo,
      },
      transacoes: {
        total: transacoes.length,
        receitas: receitas.length,
        despesas: despesas.length,
        saldo: totalReceitas - totalDespesas,
        totalReceitas,
        totalDespesas,
        porTipoEntrada,
        pessoal: {
          receitas: receitasPessoal,
          despesas: despesasPessoal,
          saldo: receitasPessoal - despesasPessoal,
          quantidade: transacoesPessoal.length,
        },
        negocio: {
          receitas: receitasNegocio,
          despesas: despesasNegocio,
          saldo: receitasNegocio - despesasNegocio,
          quantidade: transacoesNegocio.length,
        },
        percentualNegocio,
        percentualPessoal,
      },
      metas: {
        total: metas.length,
        cumpridas: metasCumpridas,
        naoCumpridas: metasNaoCumpridas,
        pendentes: metasPendentes,
        taxaCumprimento,
        porTipoMeta,
      },
      mensagens,
      engagementStats,
    };
  }

  async listarGrupos(agentIds?: number[]) {
    const whereUsuario: any = { deletado_em: null };

    if (agentIds && agentIds.length > 0) {
      whereUsuario.agent_id = { in: agentIds };
    }

    const usuarios = await prisma.usuario.findMany({
      where: whereUsuario,
      select: { grupo_id: true },
      distinct: ['grupo_id'],
    });

    const grupoIds = usuarios
      .map((u) => u.grupo_id)
      .filter((id) => id !== null) as number[];

    return await prisma.grupo.findMany({
      where: {
        id: { in: grupoIds },
        deletado_em: null,
      },
      orderBy: { nome: 'asc' },
    });
  }

  async listarUsuarios(agentIds?: number[], grupoId?: number) {
    const where: any = { deletado_em: null };

    if (agentIds && agentIds.length > 0) {
      where.agent_id = { in: agentIds };
    }

    if (grupoId) {
      where.grupo_id = grupoId;
    }

    return await prisma.usuario.findMany({
      where,
      select: {
        id: true,
        nome: true,
        agent_id: true,
      },
      orderBy: { nome: 'asc' },
    });
  }

  async obterEngagementStats(filters: DashboardMetricsFilters) {
    const AGENT_API_URL = process.env.AGENT_API_URL;
    if (!AGENT_API_URL) {
      return null;
    }

    try {
      const agentId = 437;
      const url = `${AGENT_API_URL}/public/agents/${agentId}/engagement-stats`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return null;
      }
      return null;
    }
  }

  async obterMetricasMensagens(filters: DashboardMetricsFilters) {
    const { startDate, endDate, agentIds, grupoId, usuarioId } = filters;

    const whereUsuario: any = { deletado_em: null };

    if (agentIds && agentIds.length > 0) {
      whereUsuario.agent_id = { in: agentIds };
    }

    if (grupoId) {
      whereUsuario.grupo_id = grupoId;
    }

    if (usuarioId) {
      whereUsuario.id = usuarioId;
    }

    const usuarios = await prisma.usuario.findMany({
      where: whereUsuario,
      select: { chat_id: true, agent_id: true },
    });

    if (usuarios.length === 0) {
      return {
        total: 0,
        porTipo: {},
      };
    }

    const AGENT_API_URL = process.env.AGENT_API_URL;
    if (!AGENT_API_URL) {
      return { total: 0, porTipo: {} };
    }

    const params = new URLSearchParams({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });

    // Usar endpoint batch para evitar sobrecarga de conexões
    const chatIds = usuarios.map((u) => u.chat_id).filter((id) => id !== null);

    let metricasValidas: any[] = [];

    if (chatIds.length > 0) {
      try {
        // Dividir em batches de 100 (limite do endpoint)
        const BATCH_SIZE = 100;
        const batches = [];

        for (let i = 0; i < chatIds.length; i += BATCH_SIZE) {
          batches.push(chatIds.slice(i, i + BATCH_SIZE));
        }

        const batchPromises = batches.map(async (batch) => {
          try {
            const response = await fetch(
              `${AGENT_API_URL}/public/agent-metrics/users/batch-summary?${params}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatIds: batch }),
              }
            );
            if (!response.ok) return [];
            const data = await response.json();
            return data.success ? data.data : [];
          } catch (error) {
            return [];
          }
        });

        const batchResults = await Promise.all(batchPromises);
        metricasValidas = batchResults.flat();
      } catch (error) {
        console.error('Erro ao buscar métricas batch:', error);
        metricasValidas = [];
      }
    }

    const porTipo: Record<string, number> = {};
    let total = 0;

    metricasValidas.forEach((metrica) => {
      if (metrica.inbound_by_type) {
        Object.entries(metrica.inbound_by_type).forEach(([tipo, quantidade]) => {
          porTipo[tipo] = (porTipo[tipo] || 0) + (quantidade as number);
          total += quantidade as number;
        });
      }
    });

    return {
      total,
      porTipo,
    };
  }

  async exportarDados(filters: DashboardMetricsFilters) {
    const { startDate, endDate, agentIds, grupoId, usuarioId } = filters;

    const whereUsuario: any = { deletado_em: null };

    if (agentIds && agentIds.length > 0) {
      whereUsuario.agent_id = { in: agentIds };
    }

    if (grupoId) {
      whereUsuario.grupo_id = grupoId;
    }

    if (usuarioId) {
      whereUsuario.id = usuarioId;
    }

    const usuariosPermitidos = await prisma.usuario.findMany({
      where: whereUsuario,
      select: { id: true },
    });

    const usuarioIds = usuariosPermitidos.map((u) => u.id);

    if (usuarioIds.length === 0) {
      return {
        usuarios: [],
        transacoes: [],
        metas: [],
        mensagens: [],
      };
    }

    const [usuarios, transacoes, metas] = await Promise.all([
      prisma.usuario.findMany({
        where: {
          id: { in: usuarioIds },
          deletado_em: null,
        },
        include: {
          grupo: {
            select: { id: true, nome: true },
          },
        },
      }),
      prisma.transacao.findMany({
        where: {
          usuario_id: { in: usuarioIds },
          deletado_em: null,
          data_transacao: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          categoria: {
            select: { id: true, nome: true },
          },
        },
        orderBy: { data_transacao: 'desc' },
      }),
      prisma.meta.findMany({
        where: {
          usuario_id: { in: usuarioIds },
          data_inicio: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { data_inicio: 'desc' },
      }),
    ]);

    // Mapear usuários por ID para acesso rápido
    const usuariosMap = new Map(usuarios.map((u) => [u.id, u]));

    // Adicionar dados do usuário às transações
    const transacoesComUsuario = transacoes.map((t) => ({
      ...t,
      usuario: usuariosMap.get(t.usuario_id) || {
        id: t.usuario_id,
        nome: 'Usuário não encontrado',
        chat_id: null,
        agent_id: 0,
        grupo: null,
      },
    }));

    // Adicionar dados do usuário às metas
    const metasComUsuario = metas.map((m) => ({
      ...m,
      usuario: usuariosMap.get(m.usuario_id) || {
        id: m.usuario_id,
        nome: 'Usuário não encontrado',
        chat_id: null,
        agent_id: 0,
        grupo: null,
      },
    }));

    const AGENT_API_URL = process.env.AGENT_API_URL;
    const mensagens: any[] = [];

    if (AGENT_API_URL) {
      const params = new URLSearchParams({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      });

      // Usar endpoint batch
      const chatIds = usuarios.map((u) => u.chat_id).filter((id) => id !== null);

      if (chatIds.length > 0) {
        try {
          // Dividir em batches de 100
          const BATCH_SIZE = 100;
          const batches = [];

          for (let i = 0; i < chatIds.length; i += BATCH_SIZE) {
            batches.push(chatIds.slice(i, i + BATCH_SIZE));
          }

          for (const batch of batches) {
            try {
              const response = await fetch(
                `${AGENT_API_URL}/public/agent-metrics/users/batch-summary?${params}`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ chatIds: batch }),
                }
              );

              if (response.ok) {
                const data = await response.json();
                if (data.success && Array.isArray(data.data)) {
                  data.data.forEach((metrica: any) => {
                    const usuario = usuarios.find((u) => u.chat_id === metrica.chat_id);
                    if (usuario && metrica.inbound_by_type) {
                      Object.entries(metrica.inbound_by_type).forEach(([tipo, quantidade]) => {
                        mensagens.push({
                          usuario_id: usuario.id,
                          usuario_nome: usuario.nome,
                          chat_id: usuario.chat_id,
                          agent_id: usuario.agent_id,
                          grupo: usuario.grupo?.nome || 'Sem Grupo',
                          tipo_mensagem: tipo,
                          quantidade: quantidade,
                        });
                      });
                    }
                  });
                }
              }
            } catch (error) {
              console.error('Erro ao buscar batch de mensagens:', error);
            }
          }
        } catch (error) {
          console.error('Erro ao processar batches de mensagens:', error);
        }
      }
    }

    return {
      usuarios,
      transacoes: transacoesComUsuario,
      metas: metasComUsuario,
      mensagens,
    };
  }
}

export const dashboardService = new DashboardService();
