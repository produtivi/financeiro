import { NextRequest, NextResponse } from 'next/server';
import { transacaoService } from '@/services/transacao.service';
import { criarTransacaoSchema, atualizarTransacaoSchema, filtrosTransacaoSchema } from '@/validators/transacao.validator';
import { ApiResponse } from '@/types/api';

export class TransacaoController {
  async listar(request: NextRequest): Promise<NextResponse<ApiResponse>> {
    try {
      const searchParams = request.nextUrl.searchParams;

      const filtros: Record<string, unknown> = {};

      if (searchParams.get('usuario_id')) {
        filtros.usuario_id = Number(searchParams.get('usuario_id'));
      }
      if (searchParams.get('tipo')) {
        filtros.tipo = searchParams.get('tipo');
      }
      if (searchParams.get('categoria_id')) {
        filtros.categoria_id = Number(searchParams.get('categoria_id'));
      }
      if (searchParams.get('data_inicio')) {
        filtros.data_inicio = searchParams.get('data_inicio');
      }
      if (searchParams.get('data_fim')) {
        filtros.data_fim = searchParams.get('data_fim');
      }

      const validated = Object.keys(filtros).length > 0 ? filtrosTransacaoSchema.parse(filtros) : undefined;
      const transacoes = await transacaoService.listar(validated);

      return NextResponse.json({
        success: true,
        data: transacoes,
        message: 'Transações listadas com sucesso',
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return NextResponse.json(
          {
            success: false,
            message: 'Filtros inválidos',
            errors: error,
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao listar transações',
        },
        { status: 500 }
      );
    }
  }

  async buscarPorId(id: number): Promise<NextResponse<ApiResponse>> {
    try {
      const transacao = await transacaoService.buscarPorId(id);
      if (!transacao) {
        return NextResponse.json(
          {
            success: false,
            message: 'Transação não encontrada',
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: transacao,
        message: 'Transação encontrada',
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao buscar transação',
        },
        { status: 500 }
      );
    }
  }

  async criar(request: NextRequest): Promise<NextResponse<ApiResponse>> {
    try {
      const body = await request.json();
      const validated = criarTransacaoSchema.parse(body);
      const transacao = await transacaoService.criar(validated);

      return NextResponse.json(
        {
          success: true,
          data: transacao,
          message: 'Transação criada com sucesso',
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
          message: error instanceof Error ? error.message : 'Erro ao criar transação',
        },
        { status: 500 }
      );
    }
  }

  async atualizar(id: number, request: NextRequest): Promise<NextResponse<ApiResponse>> {
    try {
      const body = await request.json();
      const validated = atualizarTransacaoSchema.parse(body);
      const transacao = await transacaoService.atualizar(id, validated);

      return NextResponse.json({
        success: true,
        data: transacao,
        message: 'Transação atualizada com sucesso',
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

      if (error instanceof Error && error.message === 'Transação não encontrada') {
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
          message: error instanceof Error ? error.message : 'Erro ao atualizar transação',
        },
        { status: 500 }
      );
    }
  }

  async deletar(id: number): Promise<NextResponse<ApiResponse>> {
    try {
      await transacaoService.deletar(id);
      return NextResponse.json({
        success: true,
        message: 'Transação deletada com sucesso',
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Transação não encontrada') {
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
          message: error instanceof Error ? error.message : 'Erro ao deletar transação',
        },
        { status: 500 }
      );
    }
  }
}

export const transacaoController = new TransacaoController();
