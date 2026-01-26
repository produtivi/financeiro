import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ success: false, message: 'Não autenticado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const startDateStr = searchParams.get('startDate');
  const endDateStr = searchParams.get('endDate');
  const grupoId = searchParams.get('grupoId');
  const usuarioId = searchParams.get('usuarioId');

  const agentIds = session.user.role === 'master' ? undefined : session.user.agentIds;

  const whereUsuario: any = { deletado_em: null };

  if (agentIds && agentIds.length > 0) {
    whereUsuario.agent_id = { in: agentIds };
  }

  if (grupoId) {
    whereUsuario.grupo_id = Number(grupoId);
  }

  if (usuarioId) {
    whereUsuario.id = Number(usuarioId);
  }

  const usuariosPermitidos = await prisma.usuario.findMany({
    where: whereUsuario,
    select: { id: true },
  });

  const usuarioIds = usuariosPermitidos.map((u) => u.id);

  let startDate: Date | undefined;
  let endDate: Date | undefined;

  if (startDateStr && endDateStr) {
    startDate = new Date(startDateStr);
    endDate = new Date(endDateStr);
  }

  // Query 1: Como dashboard (métricas)
  const transacoesDashboard = await prisma.transacao.count({
    where: {
      usuario_id: { in: usuarioIds },
      deletado_em: null,
      ...(startDate && endDate
        ? {
            data_transacao: {
              gte: startDate,
              lte: endDate,
            },
          }
        : {}),
    },
  });

  // Query 2: Como exportação (com include)
  const transacoesExportacao = await prisma.transacao.findMany({
    where: {
      usuario_id: { in: usuarioIds },
      deletado_em: null,
      ...(startDate && endDate
        ? {
            data_transacao: {
              gte: startDate,
              lte: endDate,
            },
          }
        : {}),
    },
    include: {
      categoria: {
        select: { id: true, nome: true },
      },
      usuario: {
        select: { id: true, nome: true, chat_id: true, agent_id: true },
      },
    },
    orderBy: { data_transacao: 'desc' },
  });

  // Encontrar transações órfãs (com usuario_id que não existe)
  const todasTransacoesSemFiltroUsuario = await prisma.transacao.count({
    where: {
      deletado_em: null,
      ...(startDate && endDate
        ? {
            data_transacao: {
              gte: startDate,
              lte: endDate,
            },
          }
        : {}),
    },
  });

  // Verificar se há usuários deletados com transações
  const transacoesComUsuarioDeletado = await prisma.transacao.count({
    where: {
      deletado_em: null,
      usuario: {
        NOT: {
          deletado_em: null,
        },
      },
      ...(startDate && endDate
        ? {
            data_transacao: {
              gte: startDate,
              lte: endDate,
            },
          }
        : {}),
    },
  });

  // Verificar transações com categoria deletada
  const transacoesComCategoriaDeletada = await prisma.transacao.count({
    where: {
      usuario_id: { in: usuarioIds },
      deletado_em: null,
      categoria: {
        NOT: {
          deletado_em: null,
        },
      },
      ...(startDate && endDate
        ? {
            data_transacao: {
              gte: startDate,
              lte: endDate,
            },
          }
        : {}),
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      resumo: {
        totalUsuariosPermitidos: usuarioIds.length,
        transacoesDashboard: transacoesDashboard,
        transacoesExportacao: transacoesExportacao.length,
        todasTransacoes: todasTransacoesSemFiltroUsuario,
        diferenca: transacoesDashboard - transacoesExportacao.length,
      },
      problemas: {
        transacoesComUsuarioDeletado,
        transacoesComCategoriaDeletada,
        transacoesOrfas: todasTransacoesSemFiltroUsuario - transacoesDashboard,
      },
      filtros: {
        startDate: startDateStr,
        endDate: endDateStr,
        grupoId,
        usuarioId,
        agentIds,
      },
    },
  });
}
