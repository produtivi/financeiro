import { prisma } from '@/lib/prisma';
import { CriarQuestionarioDTO } from '@/validators/questionario.validator';

export class QuestionarioService {
  async listar() {
    return await prisma.questionario.findMany({
      include: {
        usuario: {
          select: { id: true, nome: true, chat_id: true, agent_id: true, telefone: true },
        },
      },
      orderBy: { criado_em: 'desc' },
    });
  }

  async listarPorUsuario(usuarioId: number) {
    return await prisma.questionario.findMany({
      where: { usuario_id: usuarioId },
      include: {
        usuario: {
          select: { id: true, nome: true, chat_id: true },
        },
      },
      orderBy: { criado_em: 'desc' },
    });
  }

  async buscarPorId(id: number) {
    return await prisma.questionario.findFirst({
      where: { id },
      include: {
        usuario: {
          select: { id: true, nome: true, chat_id: true, agent_id: true },
        },
      },
    });
  }

  async criar(data: CriarQuestionarioDTO) {
    return await prisma.questionario.create({
      data,
      include: {
        usuario: {
          select: { id: true, nome: true, chat_id: true },
        },
      },
    });
  }

  async verificarSeRespondeu(usuarioId: number) {
    const count = await prisma.questionario.count({
      where: { usuario_id: usuarioId },
    });
    return count > 0;
  }

  async obterMetricasGerais() {
    const questionarios = await prisma.questionario.findMany({
      include: {
        usuario: true,
      },
    });

    const total = questionarios.length;

    if (total === 0) {
      return {
        total: 0,
        por_resposta: {},
        distribuicao_por_pergunta: {},
      };
    }

    const contarRespostas = (campo: string) => {
      const contagem: Record<string, number> = {};
      questionarios.forEach((q) => {
        const valor = (q as Record<string, string | null>)[campo];
        if (valor) {
          contagem[valor] = (contagem[valor] || 0) + 1;
        }
      });
      return contagem;
    };

    return {
      total,
      distribuicao_por_pergunta: {
        pergunta_1: contarRespostas('resposta_1'),
        pergunta_2: contarRespostas('resposta_2'),
        pergunta_3: contarRespostas('resposta_3'),
        pergunta_4: contarRespostas('resposta_4'),
        pergunta_5: contarRespostas('resposta_5'),
        pergunta_6: contarRespostas('resposta_6'),
        pergunta_7: contarRespostas('resposta_7'),
        pergunta_8: contarRespostas('resposta_8'),
        pergunta_9: contarRespostas('resposta_9'),
        pergunta_10: contarRespostas('resposta_10'),
        pergunta_12: contarRespostas('resposta_12'),
      },
    };
  }
}

export const questionarioService = new QuestionarioService();
