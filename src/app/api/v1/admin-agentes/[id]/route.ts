import { NextRequest } from 'next/server';
import { adminAgenteController } from '@/controllers/admin-agente.controller';
import { requireRole } from '@/middlewares/authorization.middleware';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireRole(['master']);
  if (authError) return authError;

  const { id: idString } = await params;
  const id = parseInt(idString);
  return adminAgenteController.deletar(id);
}
