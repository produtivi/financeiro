import { NextRequest, NextResponse } from 'next/server';
import { metaService } from '@/services/meta.service';
import { criarMetaSchema, atualizarMetaSchema, marcarCumpridaSchema } from '@/validators/meta.validator';
import { ApiResponse } from '@/types/api';
import { ZodIssue } from 'zod';

export const metaController = {
  async criar(req: NextRequest): Promise<NextResponse<ApiResponse>> {
    try {
      const body = await req.json();

      const validacao = criarMetaSchema.safeParse(body);
      if (!validacao.success) {
        return NextResponse.json(
          {
            success: false,
            message: 'Dados inválidos',
            errors: validacao.error.issues.map((err: ZodIssue) => ({
              campo: err.path.join('.'),
              mensagem: err.message
            }))
          },
          { status: 400 }
        );
      }

      const meta = await metaService.criar(validacao.data);

      return NextResponse.json(
        {
          success: true,
          data: meta,
          message: 'Meta criada com sucesso'
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('Erro ao criar meta:', error);
      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao criar meta'
        },
        { status: 500 }
      );
    }
  },

  async listar(req: NextRequest): Promise<NextResponse<ApiResponse>> {
    try {
      const { searchParams } = new URL(req.url);
      const usuario_id = searchParams.get('usuario_id');
      const data_inicio = searchParams.get('data_inicio');
      const data_fim = searchParams.get('data_fim');
      const tipo_meta = searchParams.get('tipo_meta');
      const cumprida = searchParams.get('cumprida');

      if (!usuario_id) {
        return NextResponse.json(
          {
            success: false,
            message: 'usuario_id é obrigatório'
          },
          { status: 400 }
        );
      }

      const filtros: Record<string, string> = {};
      if (data_inicio) filtros.data_inicio = data_inicio;
      if (data_fim) filtros.data_fim = data_fim;
      if (tipo_meta) filtros.tipo_meta = tipo_meta;
      if (cumprida) filtros.cumprida = cumprida === 'true';

      const metas = await metaService.listar(Number(usuario_id), filtros);

      return NextResponse.json({
        success: true,
        data: metas,
        message: 'Metas listadas com sucesso'
      });
    } catch (error) {
      console.error('Erro ao listar metas:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Erro ao listar metas'
        },
        { status: 500 }
      );
    }
  },

  async buscarPorId(req: NextRequest, id: number): Promise<NextResponse<ApiResponse>> {
    try {
      const { searchParams } = new URL(req.url);
      const usuario_id = searchParams.get('usuario_id');

      if (!usuario_id) {
        return NextResponse.json(
          {
            success: false,
            message: 'usuario_id é obrigatório'
          },
          { status: 400 }
        );
      }

      const meta = await metaService.buscarPorId(id, Number(usuario_id));

      return NextResponse.json({
        success: true,
        data: meta,
        message: 'Meta encontrada'
      });
    } catch (error) {
      console.error('Erro ao buscar meta:', error);

      if (error instanceof Error && error.message === 'Meta não encontrada') {
        return NextResponse.json(
          {
            success: false,
            message: 'Meta não encontrada'
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: 'Erro ao buscar meta'
        },
        { status: 500 }
      );
    }
  },

  async atualizar(req: NextRequest, id: number): Promise<NextResponse<ApiResponse>> {
    try {
      const { searchParams } = new URL(req.url);
      const usuario_id = searchParams.get('usuario_id');

      if (!usuario_id) {
        return NextResponse.json(
          {
            success: false,
            message: 'usuario_id é obrigatório'
          },
          { status: 400 }
        );
      }

      const body = await req.json();

      const validacao = atualizarMetaSchema.safeParse(body);
      if (!validacao.success) {
        return NextResponse.json(
          {
            success: false,
            message: 'Dados inválidos',
            errors: validacao.error.issues.map((err: ZodIssue) => ({
              campo: err.path.join('.'),
              mensagem: err.message
            }))
          },
          { status: 400 }
        );
      }

      const meta = await metaService.atualizar(id, Number(usuario_id), validacao.data);

      return NextResponse.json({
        success: true,
        data: meta,
        message: 'Meta atualizada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);

      if (error instanceof Error && error.message === 'Meta não encontrada') {
        return NextResponse.json(
          {
            success: false,
            message: 'Meta não encontrada'
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: 'Erro ao atualizar meta'
        },
        { status: 500 }
      );
    }
  },

  async marcarCumprida(req: NextRequest, id: number): Promise<NextResponse<ApiResponse>> {
    try {
      const { searchParams } = new URL(req.url);
      const usuario_id = searchParams.get('usuario_id');

      if (!usuario_id) {
        return NextResponse.json(
          {
            success: false,
            message: 'usuario_id é obrigatório'
          },
          { status: 400 }
        );
      }

      const body = await req.json();

      const validacao = marcarCumpridaSchema.safeParse(body);
      if (!validacao.success) {
        return NextResponse.json(
          {
            success: false,
            message: 'Dados inválidos',
            errors: validacao.error.issues.map((err: ZodIssue) => ({
              campo: err.path.join('.'),
              mensagem: err.message
            }))
          },
          { status: 400 }
        );
      }

      const meta = await metaService.marcarCumprida(id, Number(usuario_id), validacao.data.cumprida);

      return NextResponse.json({
        success: true,
        data: meta,
        message: meta.cumprida ? 'Meta marcada como cumprida! 🎉' : 'Meta marcada como não cumprida'
      });
    } catch (error) {
      console.error('Erro ao marcar meta:', error);

      if (error instanceof Error && error.message === 'Meta não encontrada') {
        return NextResponse.json(
          {
            success: false,
            message: 'Meta não encontrada'
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: 'Erro ao marcar meta'
        },
        { status: 500 }
      );
    }
  },

  async deletar(req: NextRequest, id: number): Promise<NextResponse<ApiResponse>> {
    try {
      const { searchParams } = new URL(req.url);
      const usuario_id = searchParams.get('usuario_id');

      if (!usuario_id) {
        return NextResponse.json(
          {
            success: false,
            message: 'usuario_id é obrigatório'
          },
          { status: 400 }
        );
      }

      await metaService.deletar(id, Number(usuario_id));

      return NextResponse.json({
        success: true,
        message: 'Meta deletada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar meta:', error);

      if (error instanceof Error && error.message === 'Meta não encontrada') {
        return NextResponse.json(
          {
            success: false,
            message: 'Meta não encontrada'
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: 'Erro ao deletar meta'
        },
        { status: 500 }
      );
    }
  },

  async estatisticas(req: NextRequest): Promise<NextResponse<ApiResponse>> {
    try {
      const { searchParams } = new URL(req.url);
      const usuario_id = searchParams.get('usuario_id');
      const data_inicio = searchParams.get('data_inicio');
      const data_fim = searchParams.get('data_fim');

      if (!usuario_id) {
        return NextResponse.json(
          {
            success: false,
            message: 'usuario_id é obrigatório'
          },
          { status: 400 }
        );
      }

      const periodo = (data_inicio && data_fim) ? { data_inicio, data_fim } : undefined;

      const stats = await metaService.estatisticas(Number(usuario_id), periodo);

      return NextResponse.json({
        success: true,
        data: stats,
        message: 'Estatísticas calculadas com sucesso'
      });
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Erro ao calcular estatísticas'
        },
        { status: 500 }
      );
    }
  }
};
