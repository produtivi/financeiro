import { NextRequest, NextResponse } from 'next/server';
import { grupoService } from '@/services/grupo.service';
import { criarGrupoSchema, atualizarGrupoSchema } from '@/validators/grupo.validator';
import { ApiResponse } from '@/types/api';

export class GrupoController {
  async listar(): Promise<NextResponse<ApiResponse>> {
    try {
      const grupos = await grupoService.listar();
      return NextResponse.json({
        success: true,
        data: grupos,
        message: 'Grupos listados com sucesso',
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao listar grupos',
        },
        { status: 500 }
      );
    }
  }

  async buscarPorId(id: number): Promise<NextResponse<ApiResponse>> {
    try {
      const grupo = await grupoService.buscarPorId(id);
      if (!grupo) {
        return NextResponse.json(
          {
            success: false,
            message: 'Grupo não encontrado',
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: grupo,
        message: 'Grupo encontrado',
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao buscar grupo',
        },
        { status: 500 }
      );
    }
  }

  async criar(request: NextRequest): Promise<NextResponse<ApiResponse>> {
    try {
      const body = await request.json();
      const validated = criarGrupoSchema.parse(body);
      const grupo = await grupoService.criar(validated);

      return NextResponse.json(
        {
          success: true,
          data: grupo,
          message: 'Grupo criado com sucesso',
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
          message: error instanceof Error ? error.message : 'Erro ao criar grupo',
        },
        { status: 500 }
      );
    }
  }

  async atualizar(id: number, request: NextRequest): Promise<NextResponse<ApiResponse>> {
    try {
      const body = await request.json();
      const validated = atualizarGrupoSchema.parse(body);
      const grupo = await grupoService.atualizar(id, validated);

      return NextResponse.json({
        success: true,
        data: grupo,
        message: 'Grupo atualizado com sucesso',
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

      if (error instanceof Error && error.message === 'Grupo não encontrado') {
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
          message: error instanceof Error ? error.message : 'Erro ao atualizar grupo',
        },
        { status: 500 }
      );
    }
  }

  async deletar(id: number): Promise<NextResponse<ApiResponse>> {
    try {
      await grupoService.deletar(id);
      return NextResponse.json({
        success: true,
        message: 'Grupo deletado com sucesso',
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Grupo não encontrado') {
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
          message: error instanceof Error ? error.message : 'Erro ao deletar grupo',
        },
        { status: 500 }
      );
    }
  }
}

export const grupoController = new GrupoController();
