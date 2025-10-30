import { NextRequest } from 'next/server';
import { grupoController } from '@/controllers/grupo.controller';
import { validateApiKey } from '@/middlewares/auth.middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  const { id } = await params;
  return grupoController.buscarPorId(Number(id));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  const { id } = await params;
  return grupoController.atualizar(Number(id), request);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  const { id } = await params;
  return grupoController.deletar(Number(id));
}
