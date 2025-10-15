import { NextRequest } from 'next/server';
import { usuarioController } from '@/controllers/usuario.controller';
import { validateApiKey } from '@/middlewares/auth.middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chat_id: string }> }
) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  const { chat_id } = await params;
  return usuarioController.buscarPorChatId(Number(chat_id));
}
