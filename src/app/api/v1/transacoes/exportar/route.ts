import { NextRequest, NextResponse } from 'next/server';
import { transacaoController } from '@/controllers/transacao.controller';
import { validateApiKey } from '@/middlewares/auth.middleware';
import { getSession } from '@/middlewares/authorization.middleware';

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    const authError = validateApiKey(request);
    if (authError) return authError;
    return transacaoController.exportarTransacoes(request);
  }

  // Se tem sessão, passa os agentIds para filtrar
  const agentIds = session.user.role === 'master' ? undefined : session.user.agentIds;
  return transacaoController.exportarTransacoes(request, agentIds);
}
