import { NextRequest, NextResponse } from 'next/server';
import { usuarioController } from '@/controllers/usuario.controller';
import { validateApiKey } from '@/middlewares/auth.middleware';

export async function GET(request: NextRequest, { params }: { params: Promise<{ telefone: string }> }) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agent_id');

  if (!agentId) {
    return NextResponse.json(
      {
        success: false,
        message: 'agent_id é obrigatório',
      },
      { status: 400 }
    );
  }

  const { telefone } = await params;
  return usuarioController.buscarPorTelefoneEAgent(telefone, Number(agentId));
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ telefone: string }> }) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agent_id');

  if (!agentId) {
    return NextResponse.json(
      {
        success: false,
        message: 'agent_id é obrigatório',
      },
      { status: 400 }
    );
  }

  const { telefone } = await params;
  return usuarioController.atualizarPorTelefoneEAgent(telefone, Number(agentId), request);
}
