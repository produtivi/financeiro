import { NextRequest } from 'next/server';
import { categoriaController } from '@/controllers/categoria.controller';
import { validateApiKey } from '@/middlewares/auth.middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  const { id } = await params;
  return categoriaController.buscarPorId(Number(id));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  const { id } = await params;
  return categoriaController.atualizar(Number(id), request);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  const { id } = await params;
  return categoriaController.deletar(Number(id));
}
