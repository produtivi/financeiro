import { NextRequest, NextResponse } from 'next/server';
import { adminService } from '@/services/admin.service';
import { criarAdminSchema, atualizarAdminSchema } from '@/validators/admin.validator';
import { ApiResponse } from '@/types/api';

export class AdminController {
  async listar(): Promise<NextResponse<ApiResponse>> {
    try {
      const admins = await adminService.listar();
      return NextResponse.json({
        success: true,
        data: admins,
        message: 'Admins listados com sucesso',
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao listar admins',
        },
        { status: 500 }
      );
    }
  }

  async buscarPorId(id: number): Promise<NextResponse<ApiResponse>> {
    try {
      const admin = await adminService.buscarPorId(id);
      if (!admin) {
        return NextResponse.json(
          {
            success: false,
            message: 'Admin não encontrado',
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: admin,
        message: 'Admin encontrado',
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao buscar admin',
        },
        { status: 500 }
      );
    }
  }

  async criar(request: NextRequest): Promise<NextResponse<ApiResponse>> {
    try {
      const body = await request.json();
      const validated = criarAdminSchema.parse(body);
      const admin = await adminService.criar(validated);

      return NextResponse.json(
        {
          success: true,
          data: admin,
          message: 'Admin criado com sucesso',
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
          message: error instanceof Error ? error.message : 'Erro ao criar admin',
        },
        { status: 500 }
      );
    }
  }

  async atualizar(id: number, request: NextRequest): Promise<NextResponse<ApiResponse>> {
    try {
      const body = await request.json();
      const validated = atualizarAdminSchema.parse(body);
      const admin = await adminService.atualizar(id, validated);

      return NextResponse.json({
        success: true,
        data: admin,
        message: 'Admin atualizado com sucesso',
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

      if (error instanceof Error && error.message === 'Admin não encontrado') {
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
          message: error instanceof Error ? error.message : 'Erro ao atualizar admin',
        },
        { status: 500 }
      );
    }
  }

  async deletar(id: number): Promise<NextResponse<ApiResponse>> {
    try {
      await adminService.deletar(id);
      return NextResponse.json({
        success: true,
        message: 'Admin deletado com sucesso',
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Admin não encontrado') {
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
          message: error instanceof Error ? error.message : 'Erro ao deletar admin',
        },
        { status: 500 }
      );
    }
  }
}

export const adminController = new AdminController();
