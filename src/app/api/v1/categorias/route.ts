import { NextRequest } from 'next/server';
import { categoriaController } from '@/controllers/categoria.controller';
import { validateApiKey } from '@/middlewares/auth.middleware';

export async function GET(request: NextRequest) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  return categoriaController.listar();
}

export async function POST(request: NextRequest) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  return categoriaController.criar(request);
}
