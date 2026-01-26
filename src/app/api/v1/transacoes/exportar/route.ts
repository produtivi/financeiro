import { NextRequest, NextResponse } from 'next/server';
import { transacaoController } from '@/controllers/transacao.controller';

export async function GET(request: NextRequest) {
  return transacaoController.exportarTransacoes(request);
}
