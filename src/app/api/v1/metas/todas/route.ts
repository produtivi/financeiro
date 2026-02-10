import { NextRequest, NextResponse } from 'next/server';
import { metaService } from '@/services/meta.service';
import { validateApiKey } from '@/middlewares/auth.middleware';
import { getSession } from '@/middlewares/authorization.middleware';

export async function GET(req: NextRequest) {
  const session = await getSession();

  if (!session) {
    const authResult = validateApiKey(req);
    if (authResult) return authResult;
  }

  try {
    const { searchParams } = new URL(req.url);
    const data_inicio = searchParams.get('data_inicio');
    const data_fim = searchParams.get('data_fim');
    const tipo_meta = searchParams.get('tipo_meta');
    const cumprida = searchParams.get('cumprida');

    const filtros: Record<string, string | boolean> = {};
    if (data_inicio) filtros.data_inicio = data_inicio;
    if (data_fim) filtros.data_fim = data_fim;
    if (tipo_meta) filtros.tipo_meta = tipo_meta;
    if (cumprida) filtros.cumprida = cumprida === 'true';

    const metas = await metaService.listarTodas(filtros);

    return NextResponse.json({
      success: true,
      data: metas,
      message: 'Metas listadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao listar todas as metas:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao listar todas as metas'
      },
      { status: 500 }
    );
  }
}
