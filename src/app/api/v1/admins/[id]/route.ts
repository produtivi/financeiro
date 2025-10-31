import { NextRequest } from 'next/server';
import { adminController } from '@/controllers/admin.controller';
import { requireRole } from '@/middlewares/authorization.middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireRole(['master']);
  if (authError) return authError;

  const { id: idString } = await params;
  const id = parseInt(idString);
  return adminController.buscarPorId(id);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireRole(['master']);
  if (authError) return authError;

  const { id: idString } = await params;
  const id = parseInt(idString);
  return adminController.atualizar(id, request);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireRole(['master']);
  if (authError) return authError;

  const { id: idString } = await params;
  const id = parseInt(idString);
  return adminController.deletar(id);
}
