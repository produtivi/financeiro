import { NextRequest } from 'next/server';
import { usuarioController } from '@/controllers/usuario.controller';
import { validateApiKey } from '@/middlewares/auth.middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  const { id } = await params;
  return usuarioController.buscarPorId(Number(id));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  const { id } = await params;
  return usuarioController.atualizar(Number(id), request);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  const { id } = await params;
  return usuarioController.deletar(Number(id));
}
