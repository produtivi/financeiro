import { NextRequest } from 'next/server';
import { adminAgenteController } from '@/controllers/admin-agente.controller';
import { requireRole } from '@/middlewares/authorization.middleware';

export async function POST(request: NextRequest) {
  const authError = await requireRole(['master']);
  if (authError) return authError;

  return adminAgenteController.criar(request);
}
