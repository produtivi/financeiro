import { NextRequest } from 'next/server';
import { adminAgenteController } from '@/controllers/admin-agente.controller';
import { requireRole } from '@/middlewares/authorization.middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ admin_id: string }> }
) {
  const authError = await requireRole(['master']);
  if (authError) return authError;

  const { admin_id } = await params;
  const adminId = parseInt(admin_id);
  return adminAgenteController.listarPorAdmin(adminId);
}
