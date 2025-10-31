import { prisma } from '@/lib/prisma';
import { CriarAdminDTO, AtualizarAdminDTO } from '@/validators/admin.validator';
import bcrypt from 'bcryptjs';

export class AdminService {
  async listar() {
    return await prisma.admin.findMany({
      where: { deletado_em: null },
      include: {
        agentes: {
          select: { id: true, agent_id: true },
        },
      },
      orderBy: { criado_em: 'desc' },
    });
  }

  async buscarPorId(id: number) {
    return await prisma.admin.findFirst({
      where: { id, deletado_em: null },
      include: {
        agentes: {
          select: { id: true, agent_id: true },
        },
      },
    });
  }

  async buscarPorEmail(email: string) {
    return await prisma.admin.findFirst({
      where: { email, deletado_em: null },
    });
  }

  async criar(data: CriarAdminDTO) {
    const adminExistente = await prisma.admin.findUnique({
      where: { email: data.email },
    });

    if (adminExistente && !adminExistente.deletado_em) {
      throw new Error('Email já cadastrado');
    }

    const senhaHash = await bcrypt.hash(data.senha, 10);

    return await prisma.admin.create({
      data: {
        nome: data.nome,
        email: data.email,
        senha_hash: senhaHash,
        role: data.role,
      },
    });
  }

  async atualizar(id: number, data: AtualizarAdminDTO) {
    const admin = await this.buscarPorId(id);
    if (!admin) {
      throw new Error('Admin não encontrado');
    }

    const updateData: any = {
      nome: data.nome,
      email: data.email,
      role: data.role,
      ativo: data.ativo,
    };

    if (data.senha) {
      updateData.senha_hash = await bcrypt.hash(data.senha, 10);
    }

    return await prisma.admin.update({
      where: { id },
      data: updateData,
    });
  }

  async deletar(id: number) {
    const admin = await this.buscarPorId(id);
    if (!admin) {
      throw new Error('Admin não encontrado');
    }

    return await prisma.admin.update({
      where: { id },
      data: { deletado_em: new Date() },
    });
  }
}

export const adminService = new AdminService();
