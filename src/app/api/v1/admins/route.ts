import { NextRequest } from 'next/server';
import { adminController } from '@/controllers/admin.controller';
import { requireRole } from '@/middlewares/authorization.middleware';

export async function GET() {
  const authError = await requireRole(['master']);
  if (authError) return authError;

  return adminController.listar();
}

export async function POST(request: NextRequest) {
  const authError = await requireRole(['master']);
  if (authError) return authError;

  return adminController.criar(request);
}
