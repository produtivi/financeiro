import { NextRequest, NextResponse } from 'next/server';
import { adminAgenteService } from '@/services/admin-agente.service';
import { criarAdminAgenteSchema } from '@/validators/admin-agente.validator';
import { ApiResponse } from '@/types/api';

export class AdminAgenteController {
  async listarPorAdmin(adminId: number): Promise<NextResponse<ApiResponse>> {
    try {
      const vinculos = await adminAgenteService.listarPorAdmin(adminId);
      return NextResponse.json({
        success: true,
        data: vinculos,
        message: 'Vínculos listados com sucesso',
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao listar vínculos',
        },
        { status: 500 }
      );
    }
  }

  async listarPorAgente(agentId: number): Promise<NextResponse<ApiResponse>> {
    try {
      const vinculos = await adminAgenteService.listarPorAgente(agentId);
      return NextResponse.json({
        success: true,
        data: vinculos,
        message: 'Vínculos listados com sucesso',
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao listar vínculos',
        },
        { status: 500 }
      );
    }
  }

  async criar(request: NextRequest): Promise<NextResponse<ApiResponse>> {
    try {
      const body = await request.json();
      const validated = criarAdminAgenteSchema.parse(body);
      const vinculo = await adminAgenteService.criar(validated);

      return NextResponse.json(
        {
          success: true,
          data: vinculo,
          message: 'Vínculo criado com sucesso',
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
          message: error instanceof Error ? error.message : 'Erro ao criar vínculo',
        },
        { status: 500 }
      );
    }
  }

  async deletar(id: number): Promise<NextResponse<ApiResponse>> {
    try {
      await adminAgenteService.deletar(id);
      return NextResponse.json({
        success: true,
        message: 'Vínculo deletado com sucesso',
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Vínculo não encontrado') {
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
          message: error instanceof Error ? error.message : 'Erro ao deletar vínculo',
        },
        { status: 500 }
      );
    }
  }
}

export const adminAgenteController = new AdminAgenteController();
