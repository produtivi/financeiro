import { NextRequest } from 'next/server';
import { metaController } from '@/controllers/meta.controller';
import { validateApiKey } from '@/middlewares/auth.middleware';

export async function POST(req: NextRequest) {
  const authResult = validateApiKey(req);
  if (authResult) return authResult;

  return metaController.criar(req);
}

export async function GET(req: NextRequest) {
  const authResult = validateApiKey(req);
  if (authResult) return authResult;

  return metaController.listar(req);
}
