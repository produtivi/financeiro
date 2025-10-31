import { NextRequest } from 'next/server';
import { metaController } from '@/controllers/meta.controller';
import { validateApiKey } from '@/middlewares/auth.middleware';
import { getSession } from '@/middlewares/authorization.middleware';

export async function POST(req: NextRequest) {
  const authResult = validateApiKey(req);
  if (authResult) return authResult;

  return metaController.criar(req);
}

export async function GET(req: NextRequest) {
  const session = await getSession();

  if (!session) {
    const authResult = validateApiKey(req);
    if (authResult) return authResult;
  }

  return metaController.listar(req);
}
