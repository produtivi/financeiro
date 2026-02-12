import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dashboardService } from '@/services/dashboard.service';

// Aumentar timeout para 60 segundos (exportação pode demorar)
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, message: 'Não autenticado' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const grupoId = searchParams.get('grupoId');
    const usuarioId = searchParams.get('usuarioId');

    if (!startDateStr || !endDateStr) {
      return NextResponse.json(
        {
          success: false,
          message: 'Parâmetros startDate e endDate são obrigatórios',
        },
        { status: 400 }
      );
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: 'Datas inválidas',
        },
        { status: 400 }
      );
    }

    const agentIds = session.user.role === 'master' ? undefined : session.user.agentIds;

    // Buscar dados usando o mesmo service do dashboard
    const dados = await dashboardService.exportarDados({
      startDate,
      endDate,
      agentIds,
      grupoId: grupoId ? Number(grupoId) : undefined,
      usuarioId: usuarioId ? Number(usuarioId) : undefined,
    });

    const csvLines: string[] = [];
    const bom = '\uFEFF'; // BOM para UTF-8

    // Cabeçalho principal
    csvLines.push('EXPORTAÇÃO DE LATÊNCIAS');
    csvLines.push(`Período: ${startDate.toLocaleDateString('pt-BR')} até ${endDate.toLocaleDateString('pt-BR')}`);
    csvLines.push('');

    // ===== SEÇÃO: LATÊNCIAS COMPLETAS =====
    csvLines.push('LATÊNCIAS');
    csvLines.push('Tipo,ID,Usuário,Grupo,Agent ID,Chat ID,Tipo Lembrete,Momento,Latência (segundos),Latência (minutos),Latência (horas),Respondeu');

    // Latências do banco (lembretes registrados)
    if (dados.latencias && dados.latencias.length > 0) {
      dados.latencias.forEach((l: any) => {
        const latenciaMinutos = (l.latencia_segundos / 60).toFixed(2);
        const latenciaHoras = (l.latencia_segundos / 3600).toFixed(2);
        csvLines.push(
          `Lembrete,${l.id},${l.usuario.nome},${l.usuario.grupo?.nome || 'N/A'},${l.agent_id},N/A,${l.tipo_lembrete || 'N/A'},${new Date(l.momento_lembrete).toLocaleString('pt-BR')},${l.latencia_segundos},${latenciaMinutos},${latenciaHoras},${l.respondeu ? 'Sim' : 'Não'}`
        );
      });
    }

    // Pílulas do conhecimento (da API externa)
    if (dados.pilulas && dados.pilulas.length > 0) {
      dados.pilulas.forEach((p: any) => {
        const dataEnvio = new Date(p.template_timestamp * 1000).toLocaleString('pt-BR');
        const latenciaMinutos = p.latency_minutes;
        const latenciaHoras = (p.latency_seconds / 3600).toFixed(2);
        csvLines.push(
          `Pílula,N/A,${p.usuario_nome},${p.grupo},${p.usuario_agent_id || 437},${p.chat_id || p.usuario_chat_id || 'N/A'},${p.template_name},${dataEnvio},${p.latency_seconds},${latenciaMinutos},${latenciaHoras},Sim`
        );
      });
    }

    // Goals Template Latency (Acompanhamento de Metas)
    if (dados.goalsLatency && dados.goalsLatency.length > 0) {
      dados.goalsLatency.forEach((g: any) => {
        const dataEnvio = new Date(g.template_timestamp * 1000).toLocaleString('pt-BR');
        const latenciaMinutos = g.latency_minutes;
        const latenciaHoras = (g.latency_seconds / 3600).toFixed(2);
        csvLines.push(
          `Meta,N/A,${g.usuario_nome},${g.grupo},${g.usuario_agent_id || 437},${g.chat_id || g.usuario_chat_id || 'N/A'},${g.template_name},${dataEnvio},${g.latency_seconds},${latenciaMinutos},${latenciaHoras},Sim`
        );
      });
    }

    // Response Latency (Lembretes de Registro)
    if (dados.responseLatency && dados.responseLatency.length > 0) {
      dados.responseLatency.forEach((r: any) => {
        const dataEnvio = r.template_timestamp ? new Date(r.template_timestamp * 1000).toLocaleString('pt-BR') : 'N/A';
        const latenciaMinutos = r.latency_minutes || 0;
        const latenciaHoras = (r.latency_seconds / 3600).toFixed(2);
        csvLines.push(
          `Registro,N/A,${r.usuario_nome},${r.grupo},${r.usuario_agent_id || 437},${r.chat_id || r.usuario_chat_id || 'N/A'},${r.template_name || 'N/A'},${dataEnvio},${r.latency_seconds || 0},${latenciaMinutos},${latenciaHoras},Sim`
        );
      });
    }

    // Verificar se há dados
    const totalLatencias =
      (dados.latencias?.length || 0) +
      (dados.pilulas?.length || 0) +
      (dados.goalsLatency?.length || 0) +
      (dados.responseLatency?.length || 0);

    if (totalLatencias === 0) {
      csvLines.push('Nenhum dado disponível para o período selecionado');
    }

    const csv = csvLines.join('\n');
    const csvWithBom = bom + csv;

    return new NextResponse(csvWithBom, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="latencias-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Erro ao exportar latências:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao exportar latências',
      },
      { status: 500 }
    );
  }
}
