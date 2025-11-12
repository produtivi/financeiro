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
        },
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
        include: {
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
      }),
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

    const mensagens = await this.obterMetricasMensagens(filters);

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
      },
      mensagens,
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

    const metricasPromises = usuarios.map(async (usuario) => {
      try {
        const response = await fetch(
          `${AGENT_API_URL}/public/agent-metrics/user/${usuario.chat_id}/summary?${params}`
        );
        if (!response.ok) return null;
        const data = await response.json();
        return data.success ? data.data : null;
      } catch (error) {
        return null;
      }
    });

    const resultados = await Promise.all(metricasPromises);
    const metricasValidas = resultados.filter((m) => m !== null);

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
          usuario: {
            select: { id: true, nome: true, chat_id: true, agent_id: true },
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
        include: {
          usuario: {
            select: { id: true, nome: true, chat_id: true, agent_id: true },
          },
        },
        orderBy: { data_inicio: 'desc' },
      }),
    ]);

    const AGENT_API_URL = process.env.AGENT_API_URL;
    const mensagens: any[] = [];

    if (AGENT_API_URL) {
      const params = new URLSearchParams({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      });

      for (const usuario of usuarios) {
        try {
          const response = await fetch(
            `${AGENT_API_URL}/public/agent-metrics/user/${usuario.chat_id}/summary?${params}`
          );
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data.inbound_by_type) {
              Object.entries(data.data.inbound_by_type).forEach(([tipo, quantidade]) => {
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
          }
        } catch (error) {
          console.error(`Erro ao buscar mensagens do usuário ${usuario.id}:`, error);
        }
      }
    }

    return {
      usuarios,
      transacoes,
      metas,
      mensagens,
    };
  }
}

export const dashboardService = new DashboardService();
