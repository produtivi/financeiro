import { NextRequest, NextResponse } from 'next/server';
import { dashboardService } from '@/services/dashboard.service';
import { ApiResponse } from '@/types/api';

export class DashboardController {
  async obterMetricas(request: NextRequest, agentIds?: number[]): Promise<NextResponse<ApiResponse>> {
    try {
      const { searchParams } = new URL(request.url);
      const startDateStr = searchParams.get('startDate');
      const endDateStr = searchParams.get('endDate');
      const grupoId = searchParams.get('grupoId');
      const usuarioId = searchParams.get('usuarioId');

      if (!startDateStr || !endDateStr) {
        return NextResponse.json(
          {
            success: false,
            message: 'Parâmetros startDate e endDate são obrigatórios',
          },
          { status: 400 }
        );
      }

      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return NextResponse.json(
          {
            success: false,
            message: 'Datas inválidas',
          },
          { status: 400 }
        );
      }

      const metricas = await dashboardService.obterMetricas({
        startDate,
        endDate,
        agentIds,
        grupoId: grupoId ? Number(grupoId) : undefined,
        usuarioId: usuarioId ? Number(usuarioId) : undefined,
      });

      return NextResponse.json({
        success: true,
        data: metricas,
        message: 'Métricas da dashboard obtidas com sucesso',
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao obter métricas da dashboard',
        },
        { status: 500 }
      );
    }
  }

  async listarGrupos(agentIds?: number[]): Promise<NextResponse<ApiResponse>> {
    try {
      const grupos = await dashboardService.listarGrupos(agentIds);
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

  async listarUsuarios(request: NextRequest, agentIds?: number[]): Promise<NextResponse<ApiResponse>> {
    try {
      const { searchParams } = new URL(request.url);
      const grupoId = searchParams.get('grupoId');

      const usuarios = await dashboardService.listarUsuarios(
        agentIds,
        grupoId ? Number(grupoId) : undefined
      );

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
}

export const dashboardController = new DashboardController();
