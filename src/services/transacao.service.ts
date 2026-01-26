import { prisma } from '@/lib/prisma';
import { CriarTransacaoDTO, AtualizarTransacaoDTO, FiltrosTransacaoDTO } from '@/validators/transacao.validator';

export class TransacaoService {
  async listar(filtros?: FiltrosTransacaoDTO, agentIds?: number[]) {
    const where: Record<string, unknown> = { deletado_em: null };

    if (filtros?.usuario_id) {
      where.usuario_id = filtros.usuario_id;
    }

    if (filtros?.tipo) {
      where.tipo = filtros.tipo;
    }

    if (filtros?.tipo_caixa) {
      where.tipo_caixa = filtros.tipo_caixa;
    }

    if (filtros?.categoria_id) {
      where.categoria_id = filtros.categoria_id;
    }

    if (filtros?.data_inicio && filtros?.data_fim) {
      where.data_transacao = {
        gte: new Date(filtros.data_inicio),
        lte: new Date(filtros.data_fim),
      };
    } else if (filtros?.data_inicio) {
      where.data_transacao = {
        gte: new Date(filtros.data_inicio),
      };
    } else if (filtros?.data_fim) {
      where.data_transacao = {
        lte: new Date(filtros.data_fim),
      };
    }

    // Filtrar por agentIds se fornecido
    if (agentIds && agentIds.length > 0) {
      where.usuario = {
        agent_id: { in: agentIds },
        deletado_em: null,
      };
    }

    return await prisma.transacao.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            chat_id: true,
            agent_id: true,
            grupo: {
              select: {
                nome: true,
              },
            },
          },
        },
        categoria: {
          select: {
            id: true,
            nome: true,
            tipo: true,
          },
        },
      },
      orderBy: { data_transacao: 'desc' },
    });
  }

  async buscarPorId(id: number) {
    return await prisma.transacao.findFirst({
      where: { id, deletado_em: null },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            chat_id: true,
          },
        },
        categoria: {
          select: {
            id: true,
            nome: true,
            tipo: true,
          },
        },
      },
    });
  }

  async criar(data: CriarTransacaoDTO) {
    return await prisma.transacao.create({
      data: {
        ...data,
        data_transacao: new Date(data.data_transacao),
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            chat_id: true,
          },
        },
        categoria: {
          select: {
            id: true,
            nome: true,
            tipo: true,
          },
        },
      },
    });
  }

  async atualizar(id: number, data: AtualizarTransacaoDTO) {
    const transacao = await this.buscarPorId(id);
    if (!transacao) {
      throw new Error('Transação não encontrada');
    }

    const updateData: Record<string, unknown> = { ...data };
    if (data.data_transacao) {
      updateData.data_transacao = new Date(data.data_transacao);
    }

    return await prisma.transacao.update({
      where: { id },
      data: updateData,
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            chat_id: true,
          },
        },
        categoria: {
          select: {
            id: true,
            nome: true,
            tipo: true,
          },
        },
      },
    });
  }

  async deletar(id: number) {
    const transacao = await this.buscarPorId(id);
    if (!transacao) {
      throw new Error('Transação não encontrada');
    }

    return await prisma.transacao.update({
      where: { id },
      data: { deletado_em: new Date() },
    });
  }
}

export const transacaoService = new TransacaoService();
