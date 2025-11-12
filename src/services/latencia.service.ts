import { prisma } from '@/lib/prisma';

interface CriarLatenciaDTO {
  usuario_id: number;
  agent_id: number;
  momento_lembrete: Date;
  momento_resposta: Date;
  tipo_lembrete?: string;
  respondeu?: boolean;
}

export class LatenciaService {
  async registrar(data: CriarLatenciaDTO) {
    const latenciaSegundos = Math.floor(
      (data.momento_resposta.getTime() - data.momento_lembrete.getTime()) / 1000
    );

    return await prisma.latencia.create({
      data: {
        usuario_id: data.usuario_id,
        agent_id: data.agent_id,
        momento_lembrete: data.momento_lembrete,
        momento_resposta: data.momento_resposta,
        latencia_segundos: latenciaSegundos,
        tipo_lembrete: data.tipo_lembrete,
        respondeu: data.respondeu !== undefined ? data.respondeu : true,
      },
    });
  }

  async listar(agentIds?: number[], usuarioId?: number) {
    const where: any = {};

    if (agentIds && agentIds.length > 0) {
      where.agent_id = { in: agentIds };
    }

    if (usuarioId) {
      where.usuario_id = usuarioId;
    }

    return await prisma.latencia.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            agent_id: true,
          },
        },
      },
      orderBy: { criado_em: 'desc' },
    });
  }

  async obterEstatisticas(agentIds?: number[], usuarioId?: number) {
    const where: any = {};

    if (agentIds && agentIds.length > 0) {
      where.agent_id = { in: agentIds };
    }

    if (usuarioId) {
      where.usuario_id = usuarioId;
    }

    const latencias = await prisma.latencia.findMany({
      where,
      select: {
        latencia_segundos: true,
        respondeu: true,
      },
    });

    if (latencias.length === 0) {
      return {
        total: 0,
        latencia_media: 0,
        latencia_minima: 0,
        latencia_maxima: 0,
        taxa_resposta: 0,
      };
    }

    const latenciaSegundos = latencias.map((l) => l.latencia_segundos);
    const soma = latenciaSegundos.reduce((acc, val) => acc + val, 0);
    const respondidas = latencias.filter((l) => l.respondeu).length;

    return {
      total: latencias.length,
      latencia_media: Math.round(soma / latencias.length),
      latencia_minima: Math.min(...latenciaSegundos),
      latencia_maxima: Math.max(...latenciaSegundos),
      taxa_resposta: (respondidas / latencias.length) * 100,
    };
  }
}

export const latenciaService = new LatenciaService();
