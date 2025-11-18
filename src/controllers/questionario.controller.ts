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

  async exportarDados(): Promise<NextResponse> {
    try {
      const dados = await questionarioService.exportarDados();

      const csvLines: string[] = [];

      csvLines.push('ID,Usuário,Chat ID,Agent ID,Telefone,Grupo,Comparação renda/gastos,Estresse financeiro,Redução padrão de vida,Aperto financeiro,Controle de gastos,Capacidade de poupar,Cumprimento de metas,Anota receitas/despesas,Frequência de registro,Estabelece metas,Acompanhamento de metas,Separa dinheiro pessoal do negócio,Nível de confiança,Criado Em');

      dados.forEach((q: any) => {
        const dataCriacao = new Date(q.criado_em);
        const dataFormatada = `${dataCriacao.getDate().toString().padStart(2, '0')}/${(dataCriacao.getMonth() + 1).toString().padStart(2, '0')}/${dataCriacao.getFullYear()} ${dataCriacao.getHours().toString().padStart(2, '0')}:${dataCriacao.getMinutes().toString().padStart(2, '0')}`;

        const escaparCampo = (valor: any) => {
          if (valor === null || valor === undefined) return '""';
          const valorStr = String(valor).replace(/"/g, '""');
          return `"${valorStr}"`;
        };

        const linha = [
          q.id,
          escaparCampo(q.usuario.nome || ''),
          q.usuario.chat_id || '',
          q.usuario.agent_id || '',
          escaparCampo(q.usuario.telefone || ''),
          escaparCampo(q.usuario.grupo?.nome || 'Sem Grupo'),
          escaparCampo(q.resposta_1 || ''),
          escaparCampo(q.resposta_2 || ''),
          escaparCampo(q.resposta_3 || ''),
          escaparCampo(q.resposta_4 || ''),
          escaparCampo(q.resposta_5 || ''),
          escaparCampo(q.resposta_6 || ''),
          escaparCampo(q.resposta_7 || ''),
          escaparCampo(q.resposta_8 || ''),
          escaparCampo(q.resposta_9 || ''),
          escaparCampo(q.resposta_10 || ''),
          escaparCampo((q.resposta_11 || '').replace(/\n/g, ' ')),
          escaparCampo(q.resposta_12 || ''),
          escaparCampo(q.resposta_13 || ''),
          escaparCampo(dataFormatada),
        ];
        csvLines.push(linha.join(','));
      });

      const csv = csvLines.join('\n');
      const bom = '\uFEFF';
      const csvWithBom = bom + csv;

      return new NextResponse(csvWithBom, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="questionarios-export-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } catch (error) {
      console.error('Erro ao exportar questionários:', error);
      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao exportar questionários',
        },
        { status: 500 }
      );
    }
  }
}

export const questionarioController = new QuestionarioController();
