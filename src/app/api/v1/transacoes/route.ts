import { NextRequest } from 'next/server';
import { transacaoController } from '@/controllers/transacao.controller';
import { validateApiKey } from '@/middlewares/auth.middleware';
import { getSession } from '@/middlewares/authorization.middleware';

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    const authError = validateApiKey(request);
    if (authError) return authError;
  }

  return transacaoController.listar(request);
}

export async function POST(request: NextRequest) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  return transacaoController.criar(request);
}
