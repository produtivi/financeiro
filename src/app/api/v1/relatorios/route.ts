import { NextRequest } from 'next/server';
import { relatorioController } from '@/controllers/relatorio.controller';
import { validateApiKey } from '@/middlewares/auth.middleware';

export async function POST(req: NextRequest) {
  const authResult = validateApiKey(req);
  if (authResult) return authResult;

  return relatorioController.gerar(req);
}

export async function GET(req: NextRequest) {
  const authResult = validateApiKey(req);
  if (authResult) return authResult;

  return relatorioController.listar(req);
}
