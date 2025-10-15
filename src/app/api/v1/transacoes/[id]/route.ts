import { NextRequest } from 'next/server';
import { transacaoController } from '@/controllers/transacao.controller';
import { validateApiKey } from '@/middlewares/auth.middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  const { id } = await params;
  return transacaoController.buscarPorId(Number(id));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  const { id } = await params;
  return transacaoController.atualizar(Number(id), request);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  const { id } = await params;
  return transacaoController.deletar(Number(id));
}
