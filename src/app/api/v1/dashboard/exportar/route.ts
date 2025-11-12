import { NextRequest } from 'next/server';
import { dashboardController } from '@/controllers/dashboard.controller';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return Response.json(
      { success: false, message: 'Não autenticado' },
      { status: 401 }
    );
  }

  const agentIds = session.user.role === 'master' ? undefined : session.user.agentIds;

  return dashboardController.exportarDados(request, agentIds);
}
