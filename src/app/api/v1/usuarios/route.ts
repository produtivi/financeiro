import { NextRequest } from 'next/server';
import { usuarioController } from '@/controllers/usuario.controller';
import { validateApiKey } from '@/middlewares/auth.middleware';

export async function GET(request: NextRequest) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  return usuarioController.listar();
}

export async function POST(request: NextRequest) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  return usuarioController.criar(request);
}
