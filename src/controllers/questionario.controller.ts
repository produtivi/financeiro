import { NextRequest, NextResponse } from 'next/server';
import { questionarioService } from '@/services/questionario.service';
import { criarQuestionarioSchema, criarQuestionarioAgenteSchema, converterRespostasParaObjeto } from '@/validators/questionario.validator';
import { ApiResponse } from '@/types/api';

export class QuestionarioController {
  async listar(request: NextRequest): Promise<NextResponse<ApiResponse>> {
    try {
      const { searchParams } = new URL(request.url);
      const usuarioId = searchParams.get('usuario_id');

      if (usuarioId) {
        const questionarios = await questionarioService.listarPorUsuario(Number(usuarioId));
        return NextResponse.json({
          success: true,
          data: questionarios,
          message: 'Questionários do usuário listados com sucesso',
        });
      }

      const questionarios = await questionarioService.listar();
      return NextResponse.json({
        success: true,
        data: questionarios,
        message: 'Questionários listados com sucesso',
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao listar questionários',
        },
        { status: 500 }
      );
    }
  }

  async buscarPorId(id: number): Promise<NextResponse<ApiResponse>> {
    try {
      const questionario = await questionarioService.buscarPorId(id);
      if (!questionario) {
        return NextResponse.json(
          {
            success: false,
            message: 'Questionário não encontrado',
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: questionario,
        message: 'Questionário encontrado',
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao buscar questionário',
        },
        { status: 500 }
      );
    }
  }

  async criar(request: NextRequest): Promise<NextResponse<ApiResponse>> {
    try {
      const body = await request.json();

      let dadosValidados;

      // Verificar se o body tem o formato do agente (com array de respostas)
      if (body.respostas && Array.isArray(body.respostas)) {
        const validatedAgente = criarQuestionarioAgenteSchema.parse(body);
        dadosValidados = converterRespostasParaObjeto(validatedAgente);
      } else {
        // Formato direto com campos individuais
        dadosValidados = criarQuestionarioSchema.parse(body);
      }

      const questionario = await questionarioService.criar(dadosValidados);

      return NextResponse.json(
        {
          success: true,
          data: questionario,
          message: 'Questionário criado com sucesso',
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
          message: error instanceof Error ? error.message : 'Erro ao criar questionário',
        },
        { status: 500 }
      );
    }
  }

  async obterMetricas(): Promise<NextResponse<ApiResponse>> {
    try {
      const metricas = await questionarioService.obterMetricasGerais();
      return NextResponse.json({
        success: true,
        data: metricas,
        message: 'Métricas calculadas com sucesso',
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao calcular métricas',
        },
        { status: 500 }
      );
    }
  }

  async verificarSeRespondeu(usuarioId: number): Promise<NextResponse<ApiResponse>> {
    try {
      const respondeu = await questionarioService.verificarSeRespondeu(usuarioId);
      return NextResponse.json({
        success: true,
        data: { respondeu },
        message: respondeu ? 'Usuário já respondeu o questionário' : 'Usuário ainda não respondeu o questionário',
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao verificar questionário',
        },
        { status: 500 }
      );
    }
  }
}

export const questionarioController = new QuestionarioController();
