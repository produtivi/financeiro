import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/middlewares/auth.middleware';
import { usuarioService } from '@/services/usuario.service';
import { importarUsuarioLinhaSchema } from '@/validators/usuario.validator';
import { read, utils } from 'xlsx';

export async function POST(request: NextRequest) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: 'Arquivo não enviado',
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = read(arrayBuffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const dados = utils.sheet_to_json(worksheet);

    if (dados.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Arquivo vazio ou sem dados válidos',
        },
        { status: 400 }
      );
    }

    const usuariosParaImportar = [];
    const errosValidacao = [];

    for (let i = 0; i < dados.length; i++) {
      const linha = dados[i] as any;
      try {
        const usuarioValidado = importarUsuarioLinhaSchema.parse({
          nome: linha.nome,
          telefone: String(linha.telefone || '').trim(),
          grupo_id: Number(linha.grupo_id),
          agent_id: Number(linha.agent_id),
        });
        usuariosParaImportar.push(usuarioValidado);
      } catch (error: any) {
        errosValidacao.push({
          linha: i + 2,
          erro: error.errors?.[0]?.message || 'Dados inválidos',
          dados: linha,
        });
      }
    }

    if (errosValidacao.length > 0 && usuariosParaImportar.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Todos os registros contêm erros de validação',
          erros: errosValidacao,
        },
        { status: 400 }
      );
    }

    const resultado = await usuarioService.importarEmLote(usuariosParaImportar);

    return NextResponse.json({
      success: true,
      message: 'Importação concluída',
      data: {
        criados: resultado.criados,
        atualizados: resultado.atualizados,
        erros: [...errosValidacao, ...resultado.erros],
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao importar usuários',
      },
      { status: 500 }
    );
  }
}
