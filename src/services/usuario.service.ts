import { prisma } from '@/lib/prisma';
import { CriarUsuarioDTO, AtualizarUsuarioDTO, ImportarUsuarioLinhaDTO } from '@/validators/usuario.validator';

interface ResultadoImportacao {
  criados: number;
  atualizados: number;
  erros: Array<{ linha: number; erro: string; dados: any }>;
}

export class UsuarioService {
  async listar(agentIds?: number[]) {
    const where: any = { deletado_em: null };

    if (agentIds && agentIds.length > 0) {
      where.agent_id = { in: agentIds };
    }

    return await prisma.usuario.findMany({
      where,
      include: {
        grupo: {
          select: { id: true, nome: true },
        },
      },
      orderBy: { criado_em: 'desc' },
    });
  }

  async buscarPorId(id: number) {
    return await prisma.usuario.findFirst({
      where: { id, deletado_em: null },
    });
  }

  async buscarPorChatId(chatId: number) {
    return await prisma.usuario.findFirst({
      where: { chat_id: chatId, deletado_em: null },
      include: {
        grupo: {
          select: { id: true, nome: true, descricao: true },
        },
      },
    });
  }

  async buscarPorAgentId(agentId: number) {
    return await prisma.usuario.findFirst({
      where: { agent_id: agentId, deletado_em: null },
    });
  }

  async buscarPorTelefoneEAgent(telefone: string, agentId: number) {
    return await prisma.usuario.findFirst({
      where: { telefone, agent_id: agentId, deletado_em: null },
      include: {
        grupo: {
          select: { id: true, nome: true, descricao: true },
        },
      },
    });
  }

  async atualizarPorTelefoneEAgent(telefone: string, agentId: number, data: AtualizarUsuarioDTO) {
    const usuario = await this.buscarPorTelefoneEAgent(telefone, agentId);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    return await prisma.usuario.update({
      where: { id: usuario.id },
      data,
      include: {
        grupo: {
          select: { id: true, nome: true, descricao: true },
        },
      },
    });
  }

  async criar(data: CriarUsuarioDTO) {
    return await prisma.usuario.create({
      data,
    });
  }

  async atualizar(id: number, data: AtualizarUsuarioDTO) {
    const usuario = await this.buscarPorId(id);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    return await prisma.usuario.update({
      where: { id },
      data,
    });
  }

  async deletar(id: number) {
    const usuario = await this.buscarPorId(id);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    return await prisma.usuario.update({
      where: { id },
      data: { deletado_em: new Date() },
    });
  }

  async importarEmLote(usuarios: ImportarUsuarioLinhaDTO[]): Promise<ResultadoImportacao> {
    const resultado: ResultadoImportacao = {
      criados: 0,
      atualizados: 0,
      erros: [],
    };

    for (let i = 0; i < usuarios.length; i++) {
      const usuario = usuarios[i];
      try {
        const existente = await this.buscarPorTelefoneEAgent(usuario.telefone, usuario.agent_id);

        if (existente) {
          await prisma.usuario.update({
            where: { id: existente.id },
            data: {
              grupo_id: usuario.grupo_id,
            },
          });
          resultado.atualizados++;
        } else {
          await prisma.usuario.create({
            data: {
              nome: usuario.nome,
              telefone: usuario.telefone,
              grupo_id: usuario.grupo_id,
              agent_id: usuario.agent_id,
              status: 'active',
            },
          });
          resultado.criados++;
        }
      } catch (error) {
        resultado.erros.push({
          linha: i + 2,
          erro: error instanceof Error ? error.message : 'Erro desconhecido',
          dados: usuario,
        });
      }
    }

    return resultado;
  }
}

export const usuarioService = new UsuarioService();
