import { NextRequest } from 'next/server';
import { metaController } from '@/controllers/meta.controller';
import { validateApiKey } from '@/middlewares/auth.middleware';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = validateApiKey(req);
  if (authResult) return authResult;

  const { id } = await params;
  return metaController.buscarPorId(req, Number(id));
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = validateApiKey(req);
  if (authResult) return authResult;

  const { id } = await params;
  return metaController.atualizar(req, Number(id));
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = validateApiKey(req);
  if (authResult) return authResult;

  const { id } = await params;
  return metaController.deletar(req, Number(id));
}
