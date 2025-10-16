import { NextRequest } from 'next/server';
import { relatorioController } from '@/controllers/relatorio.controller';
import { validateApiKey } from '@/middlewares/auth.middleware';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = validateApiKey(req);
  if (authResult) return authResult;

  const { id } = await params;
  return relatorioController.buscarPorId(req, Number(id));
}
