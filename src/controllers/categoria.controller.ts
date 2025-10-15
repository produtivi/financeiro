import { NextRequest, NextResponse } from 'next/server';
import { categoriaService } from '@/services/categoria.service';
import { criarCategoriaSchema, atualizarCategoriaSchema } from '@/validators/categoria.validator';
import { ApiResponse } from '@/types/api';

export class CategoriaController {
  async listar(): Promise<NextResponse<ApiResponse>> {
    try {
      const categorias = await categoriaService.listar();
      return NextResponse.json({
        success: true,
        data: categorias,
        message: 'Categorias listadas com sucesso',
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao listar categorias',
        },
        { status: 500 }
      );
    }
  }

  async buscarPorId(id: number): Promise<NextResponse<ApiResponse>> {
    try {
      const categoria = await categoriaService.buscarPorId(id);
      if (!categoria) {
        return NextResponse.json(
          {
            success: false,
            message: 'Categoria não encontrada',
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: categoria,
        message: 'Categoria encontrada',
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao buscar categoria',
        },
        { status: 500 }
      );
    }
  }

  async criar(request: NextRequest): Promise<NextResponse<ApiResponse>> {
    try {
      const body = await request.json();
      const validated = criarCategoriaSchema.parse(body);
      const categoria = await categoriaService.criar(validated);

      return NextResponse.json(
        {
          success: true,
          data: categoria,
          message: 'Categoria criada com sucesso',
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
          message: error instanceof Error ? error.message : 'Erro ao criar categoria',
        },
        { status: 500 }
      );
    }
  }

  async atualizar(id: number, request: NextRequest): Promise<NextResponse<ApiResponse>> {
    try {
      const body = await request.json();
      const validated = atualizarCategoriaSchema.parse(body);
      const categoria = await categoriaService.atualizar(id, validated);

      return NextResponse.json({
        success: true,
        data: categoria,
        message: 'Categoria atualizada com sucesso',
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

      if (error instanceof Error && error.message === 'Categoria não encontrada') {
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
          message: error instanceof Error ? error.message : 'Erro ao atualizar categoria',
        },
        { status: 500 }
      );
    }
  }

  async deletar(id: number): Promise<NextResponse<ApiResponse>> {
    try {
      await categoriaService.deletar(id);
      return NextResponse.json({
        success: true,
        message: 'Categoria deletada com sucesso',
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Categoria não encontrada') {
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
          message: error instanceof Error ? error.message : 'Erro ao deletar categoria',
        },
        { status: 500 }
      );
    }
  }
}

export const categoriaController = new CategoriaController();
