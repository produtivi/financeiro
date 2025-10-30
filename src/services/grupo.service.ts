import { prisma } from '@/lib/prisma';
import { CriarGrupoDTO, AtualizarGrupoDTO } from '@/validators/grupo.validator';

export class GrupoService {
  async listar() {
    return await prisma.grupo.findMany({
      where: { deletado_em: null },
      include: {
        usuarios: {
          where: { deletado_em: null },
          select: { id: true, nome: true, telefone: true },
        },
      },
      orderBy: { nome: 'asc' },
    });
  }

  async buscarPorId(id: number) {
    return await prisma.grupo.findFirst({
      where: { id, deletado_em: null },
      include: {
        usuarios: {
          where: { deletado_em: null },
          select: { id: true, nome: true, telefone: true, chat_id: true, agent_id: true },
        },
      },
    });
  }

  async criar(data: CriarGrupoDTO) {
    return await prisma.grupo.create({
      data,
    });
  }

  async atualizar(id: number, data: AtualizarGrupoDTO) {
    const grupo = await this.buscarPorId(id);
    if (!grupo) {
      throw new Error('Grupo não encontrado');
    }

    return await prisma.grupo.update({
      where: { id },
      data,
    });
  }

  async deletar(id: number) {
    const grupo = await this.buscarPorId(id);
    if (!grupo) {
      throw new Error('Grupo não encontrado');
    }

    return await prisma.grupo.update({
      where: { id },
      data: { deletado_em: new Date() },
    });
  }
}

export const grupoService = new GrupoService();
