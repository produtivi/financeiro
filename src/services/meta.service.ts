import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const metaService = {
  async criar(dados: {
    usuario_id: number;
    descricao: string;
    tipo_meta: 'reserva_financeira' | 'controle_inventario' | 'meta_vendas' | 'pagamento_contas' | 'outro';
    data_inicio: string;
    data_fim: string;
  }) {
    return await prisma.meta.create({
      data: {
        usuario_id: dados.usuario_id,
        descricao: dados.descricao,
        tipo_meta: dados.tipo_meta,
        data_inicio: new Date(dados.data_inicio),
        data_fim: new Date(dados.data_fim),
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            chat_id: true
          }
        }
      }
    });
  },

  async listar(usuario_id: number, filtros?: {
    data_inicio?: string;
    data_fim?: string;
    tipo_meta?: string;
    cumprida?: boolean;
  }) {
    const where: Prisma.MetaWhereInput = {
      usuario_id,
    };

    if (filtros?.data_inicio) {
      where.data_inicio = { gte: new Date(filtros.data_inicio) };
    }

    if (filtros?.data_fim) {
      where.data_fim = { lte: new Date(filtros.data_fim) };
    }

    if (filtros?.tipo_meta) {
      where.tipo_meta = filtros.tipo_meta;
    }

    if (filtros?.cumprida !== undefined) {
      where.cumprida = filtros.cumprida;
    }

    return await prisma.meta.findMany({
      where,
      orderBy: { data_inicio: 'desc' },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });
  },

  async buscarPorId(id: number, usuario_id: number) {
    const meta = await prisma.meta.findFirst({
      where: { id, usuario_id },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            chat_id: true
          }
        }
      }
    });

    if (!meta) {
      throw new Error('Meta não encontrada');
    }

    return meta;
  },

  async atualizar(id: number, usuario_id: number, dados: {
    descricao?: string;
    tipo_meta?: 'reserva_financeira' | 'controle_inventario' | 'meta_vendas' | 'pagamento_contas' | 'outro';
    data_inicio?: string;
    data_fim?: string;
  }) {
    await this.buscarPorId(id, usuario_id);

    const updateData: Prisma.MetaUpdateInput = {};

    if (dados.descricao) updateData.descricao = dados.descricao;
    if (dados.tipo_meta) updateData.tipo_meta = dados.tipo_meta;
    if (dados.data_inicio) updateData.data_inicio = new Date(dados.data_inicio);
    if (dados.data_fim) updateData.data_fim = new Date(dados.data_fim);

    return await prisma.meta.update({
      where: { id },
      data: updateData,
      include: {
        usuario: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });
  },

  async marcarCumprida(id: number, usuario_id: number, cumprida: boolean) {
    await this.buscarPorId(id, usuario_id);

    return await prisma.meta.update({
      where: { id },
      data: {
        cumprida,
        respondido_em: new Date()
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });
  },

  async deletar(id: number, usuario_id: number) {
    await this.buscarPorId(id, usuario_id);

    return await prisma.meta.delete({
      where: { id }
    });
  },

  async estatisticas(usuario_id: number, periodo?: { data_inicio: string; data_fim: string }) {
    const where: Prisma.MetaWhereInput = { usuario_id };

    if (periodo) {
      where.data_inicio = { gte: new Date(periodo.data_inicio) };
      where.data_fim = { lte: new Date(periodo.data_fim) };
    }

    const total = await prisma.meta.count({ where });

    const cumpridas = await prisma.meta.count({
      where: { ...where, cumprida: true }
    });

    const nao_cumpridas = await prisma.meta.count({
      where: { ...where, cumprida: false }
    });

    const sem_resposta = await prisma.meta.count({
      where: { ...where, cumprida: null }
    });

    const por_tipo = await prisma.meta.groupBy({
      by: ['tipo_meta'],
      where,
      _count: true
    });

    const taxa_cumprimento = total > 0 ? ((cumpridas / total) * 100).toFixed(1) : '0';

    return {
      total,
      cumpridas,
      nao_cumpridas,
      sem_resposta,
      taxa_cumprimento: parseFloat(taxa_cumprimento),
      por_tipo: por_tipo.map(item => ({
        tipo: item.tipo_meta,
        quantidade: item._count
      }))
    };
  }
};
