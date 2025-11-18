import { NextRequest } from 'next/server';
import { questionarioController } from '@/controllers/questionario.controller';

export async function GET(request: NextRequest) {
  return questionarioController.exportarDados();
}
