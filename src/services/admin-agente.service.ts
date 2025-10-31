import { prisma } from '@/lib/prisma';
import { CriarAdminAgenteDTO } from '@/validators/admin-agente.validator';

export class AdminAgenteService {
  async listarPorAdmin(adminId: number) {
    return await prisma.adminAgente.findMany({
      where: { admin_id: adminId },
      orderBy: { criado_em: 'desc' },
    });
  }

  async listarPorAgente(agentId: number) {
    return await prisma.adminAgente.findMany({
      where: { agent_id: agentId },
      include: {
        admin: {
          select: { id: true, nome: true, email: true, role: true },
        },
      },
      orderBy: { criado_em: 'desc' },
    });
  }

  async criar(data: CriarAdminAgenteDTO) {
    const vinculoExistente = await prisma.adminAgente.findUnique({
      where: {
        admin_id_agent_id: {
          admin_id: data.admin_id,
          agent_id: data.agent_id,
        },
      },
    });

    if (vinculoExistente) {
      throw new Error('Vínculo já existe');
    }

    return await prisma.adminAgente.create({
      data,
    });
  }

  async deletar(id: number) {
    const vinculo = await prisma.adminAgente.findUnique({
      where: { id },
    });

    if (!vinculo) {
      throw new Error('Vínculo não encontrado');
    }

    return await prisma.adminAgente.delete({
      where: { id },
    });
  }

  async deletarPorAdminEAgente(adminId: number, agentId: number) {
    const vinculo = await prisma.adminAgente.findUnique({
      where: {
        admin_id_agent_id: {
          admin_id: adminId,
          agent_id: agentId,
        },
      },
    });

    if (!vinculo) {
      throw new Error('Vínculo não encontrado');
    }

    return await prisma.adminAgente.delete({
      where: { id: vinculo.id },
    });
  }
}

export const adminAgenteService = new AdminAgenteService();
