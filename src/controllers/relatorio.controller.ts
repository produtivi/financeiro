import { NextRequest, NextResponse } from 'next/server';
import { relatorioService } from '@/services/relatorio.service';
import { gerarRelatorioSchema } from '@/validators/relatorio.validator';
import { ApiResponse } from '@/types/api';

export const relatorioController = {
  async gerar(req: NextRequest): Promise<NextResponse<ApiResponse>> {
    try {
      const body = await req.json();

      const validacao = gerarRelatorioSchema.safeParse(body);
      if (!validacao.success) {
        return NextResponse.json(
          {
            success: false,
            message: 'Dados inválidos',
            errors: validacao.error.issues.map((err: any) => ({
              campo: err.path.join('.'),
              mensagem: err.message
            }))
          },
          { status: 400 }
        );
      }

      const resultado = await relatorioService.gerarRelatorio(validacao.data);

      return NextResponse.json(
        {
          success: true,
          data: {
            relatorio: {
              id: resultado.relatorio.id,
              url_imagem: resultado.relatorio.url_imagem,
              tipo_relatorio: resultado.relatorio.tipo_relatorio,
              formato: resultado.relatorio.formato,
              data_inicio: resultado.relatorio.data_inicio,
              data_fim: resultado.relatorio.data_fim,
              criado_em: resultado.relatorio.criado_em
            },
            dados: resultado.dados
          },
          message: 'Relatório gerado com sucesso'
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao gerar relatório'
        },
        { status: 500 }
      );
    }
  },

  async listar(req: NextRequest): Promise<NextResponse<ApiResponse>> {
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

      const relatorios = await relatorioService.listarRelatorios(Number(usuario_id));

      return NextResponse.json({
        success: true,
        data: relatorios,
        message: 'Relatórios listados com sucesso'
      });
    } catch (error) {
      console.error('Erro ao listar relatórios:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Erro ao listar relatórios'
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

      const relatorio = await relatorioService.buscarPorId(id, Number(usuario_id));

      return NextResponse.json({
        success: true,
        data: relatorio,
        message: 'Relatório encontrado'
      });
    } catch (error) {
      console.error('Erro ao buscar relatório:', error);

      if (error instanceof Error && error.message === 'Relatório não encontrado') {
        return NextResponse.json(
          {
            success: false,
            message: 'Relatório não encontrado'
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: 'Erro ao buscar relatório'
        },
        { status: 500 }
      );
    }
  }
};
