import { prisma } from '@/lib/prisma';
import { CriarCategoriaDTO, AtualizarCategoriaDTO } from '@/validators/categoria.validator';

export class CategoriaService {
  async listar() {
    return await prisma.categoria.findMany({
      where: { deletado_em: null },
      orderBy: [{ tipo: 'asc' }, { nome: 'asc' }],
    });
  }

  async buscarPorId(id: number) {
    return await prisma.categoria.findFirst({
      where: { id, deletado_em: null },
    });
  }

  async criar(data: CriarCategoriaDTO) {
    return await prisma.categoria.create({
      data,
    });
  }

  async atualizar(id: number, data: AtualizarCategoriaDTO) {
    const categoria = await this.buscarPorId(id);
    if (!categoria) {
      throw new Error('Categoria não encontrada');
    }

    return await prisma.categoria.update({
      where: { id },
      data,
    });
  }

  async deletar(id: number) {
    const categoria = await this.buscarPorId(id);
    if (!categoria) {
      throw new Error('Categoria não encontrada');
    }

    return await prisma.categoria.update({
      where: { id },
      data: { deletado_em: new Date() },
    });
  }
}

export const categoriaService = new CategoriaService();
