import { NextRequest, NextResponse } from 'next/server';
import { latenciaService } from '@/services/latencia.service';
import { ApiResponse } from '@/types/api';
import { z } from 'zod';

const registrarLatenciaSchema = z.object({
  usuario_id: z.number().int().positive(),
  agent_id: z.number().int().positive(),
  momento_lembrete: z.string().datetime(),
  momento_resposta: z.string().datetime(),
  tipo_lembrete: z.string().optional(),
  respondeu: z.boolean().optional(),
});

export class LatenciaController {
  async registrar(request: NextRequest): Promise<NextResponse<ApiResponse>> {
    try {
      const body = await request.json();
      const dadosValidados = registrarLatenciaSchema.parse(body);

      const latencia = await latenciaService.registrar({
        usuario_id: dadosValidados.usuario_id,
        agent_id: dadosValidados.agent_id,
        momento_lembrete: new Date(dadosValidados.momento_lembrete),
        momento_resposta: new Date(dadosValidados.momento_resposta),
        tipo_lembrete: dadosValidados.tipo_lembrete,
        respondeu: dadosValidados.respondeu,
      });

      return NextResponse.json(
        {
          success: true,
          data: latencia,
          message: 'Latência registrada com sucesso',
        },
        { status: 201 }
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            message: 'Dados inválidos',
            errors: error.issues,
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao registrar latência',
        },
        { status: 500 }
      );
    }
  }

  async listar(request: NextRequest, agentIds?: number[]): Promise<NextResponse<ApiResponse>> {
    try {
      const { searchParams } = new URL(request.url);
      const usuarioId = searchParams.get('usuario_id');

      const latencias = await latenciaService.listar(
        agentIds,
        usuarioId ? Number(usuarioId) : undefined
      );

      return NextResponse.json({
        success: true,
        data: latencias,
        message: 'Latências listadas com sucesso',
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao listar latências',
        },
        { status: 500 }
      );
    }
  }

  async obterEstatisticas(request: NextRequest, agentIds?: number[]): Promise<NextResponse<ApiResponse>> {
    try {
      const { searchParams } = new URL(request.url);
      const usuarioId = searchParams.get('usuario_id');

      const estatisticas = await latenciaService.obterEstatisticas(
        agentIds,
        usuarioId ? Number(usuarioId) : undefined
      );

      return NextResponse.json({
        success: true,
        data: estatisticas,
        message: 'Estatísticas obtidas com sucesso',
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao obter estatísticas',
        },
        { status: 500 }
      );
    }
  }
}

export const latenciaController = new LatenciaController();
