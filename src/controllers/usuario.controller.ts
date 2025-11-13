import { NextRequest, NextResponse } from 'next/server';
import { usuarioService } from '@/services/usuario.service';
import { criarUsuarioSchema, atualizarUsuarioSchema } from '@/validators/usuario.validator';
import { ApiResponse } from '@/types/api';
import { getSession } from '@/middlewares/authorization.middleware';

export class UsuarioController {
  async listar(): Promise<NextResponse<ApiResponse>> {
    try {
      console.log('[UsuarioController] Iniciando listagem de usuários');
      const session = await getSession();
      console.log('[UsuarioController] Session obtida:', session ? 'OK' : 'NULL');
      let agentIds: number[] | undefined;

      if (session?.user?.role !== 'master') {
        agentIds = session?.user?.agentIds || [];
      }
      console.log('[UsuarioController] AgentIds:', agentIds);

      const usuarios = await usuarioService.listar(agentIds);
      console.log('[UsuarioController] Usuários listados:', usuarios.length);
      return NextResponse.json({
        success: true,
        data: usuarios,
        message: 'Usuários listados com sucesso',
      });
    } catch (error) {
      console.error('[UsuarioController] Erro ao listar usuários:', error);
      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao listar usuários',
        },
        { status: 500 }
      );
    }
  }

  async buscarPorId(id: number): Promise<NextResponse<ApiResponse>> {
    try {
      const usuario = await usuarioService.buscarPorId(id);
      if (!usuario) {
        return NextResponse.json(
          {
            success: false,
            message: 'Usuário não encontrado',
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: usuario,
        message: 'Usuário encontrado',
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao buscar usuário',
        },
        { status: 500 }
      );
    }
  }

  async buscarPorChatId(chatId: number): Promise<NextResponse<ApiResponse>> {
    try {
      const usuario = await usuarioService.buscarPorChatId(chatId);
      if (!usuario) {
        return NextResponse.json(
          {
            success: false,
            message: 'Usuário não encontrado',
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: usuario,
        message: 'Usuário encontrado',
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao buscar usuário',
        },
        { status: 500 }
      );
    }
  }

  async buscarPorTelefoneEAgent(telefone: string, agentId: number): Promise<NextResponse<ApiResponse>> {
    try {
      const usuario = await usuarioService.buscarPorTelefoneEAgent(telefone, agentId);
      if (!usuario) {
        return NextResponse.json(
          {
            success: false,
            message: 'Usuário não encontrado',
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: usuario,
        message: 'Usuário encontrado',
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao buscar usuário',
        },
        { status: 500 }
      );
    }
  }

  async atualizarPorTelefoneEAgent(telefone: string, agentId: number, request: NextRequest): Promise<NextResponse<ApiResponse>> {
    try {
      const body = await request.json();
      const validated = atualizarUsuarioSchema.parse(body);
      const usuario = await usuarioService.atualizarPorTelefoneEAgent(telefone, agentId, validated);

      return NextResponse.json({
        success: true,
        data: usuario,
        message: 'Usuário atualizado com sucesso',
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return NextResponse.json(
          {
            success: false,
            message: 'Dados inválidos',
            errors: error,
          },
          { status: 400 }
        );
      }

      if (error instanceof Error && error.message === 'Usuário não encontrado') {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao atualizar usuário',
        },
        { status: 500 }
      );
    }
  }

  async criar(request: NextRequest): Promise<NextResponse<ApiResponse>> {
    try {
      const body = await request.json();
      const validated = criarUsuarioSchema.parse(body);
      const usuario = await usuarioService.criar(validated);

      return NextResponse.json(
        {
          success: true,
          data: usuario,
          message: 'Usuário criado com sucesso',
        },
        { status: 201 }
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return NextResponse.json(
          {
            success: false,
            message: 'Dados inválidos',
            errors: error,
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao criar usuário',
        },
        { status: 500 }
      );
    }
  }

  async atualizar(id: number, request: NextRequest): Promise<NextResponse<ApiResponse>> {
    try {
      const body = await request.json();
      const validated = atualizarUsuarioSchema.parse(body);
      const usuario = await usuarioService.atualizar(id, validated);

      return NextResponse.json({
        success: true,
        data: usuario,
        message: 'Usuário atualizado com sucesso',
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return NextResponse.json(
          {
            success: false,
            message: 'Dados inválidos',
            errors: error,
          },
          { status: 400 }
        );
      }

      if (error instanceof Error && error.message === 'Usuário não encontrado') {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao atualizar usuário',
        },
        { status: 500 }
      );
    }
  }

  async deletar(id: number): Promise<NextResponse<ApiResponse>> {
    try {
      await usuarioService.deletar(id);
      return NextResponse.json({
        success: true,
        message: 'Usuário deletado com sucesso',
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Usuário não encontrado') {
        return NextResponse.json(
          {
            success: false,
            message: error.message,
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao deletar usuário',
        },
        { status: 500 }
      );
    }
  }
}

export const usuarioController = new UsuarioController();
