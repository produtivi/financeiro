import { NextRequest, NextResponse } from 'next/server';
import { usuarioService } from '@/services/usuario.service';
import { criarUsuarioSchema, atualizarUsuarioSchema } from '@/validators/usuario.validator';
import { ApiResponse } from '@/types/api';

export class UsuarioController {
  async listar(): Promise<NextResponse<ApiResponse>> {
    try {
      const usuarios = await usuarioService.listar();
      return NextResponse.json({
        success: true,
        data: usuarios,
        message: 'Usuários listados com sucesso',
      });
    } catch (error) {
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
