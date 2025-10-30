import { NextRequest } from 'next/server';
import { questionarioController } from '@/controllers/questionario.controller';
import { validateApiKey } from '@/middlewares/auth.middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ usuario_id: string }> }
) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  const { usuario_id } = await params;
  return questionarioController.verificarSeRespondeu(Number(usuario_id));
}
