import { NextRequest } from 'next/server';
import { questionarioController } from '@/controllers/questionario.controller';
import { validateApiKey } from '@/middlewares/auth.middleware';

export async function GET(request: NextRequest) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  return questionarioController.obterMetricas();
}
