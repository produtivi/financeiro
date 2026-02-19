import { NextRequest, NextResponse } from 'next/server';
import { dashboardService } from '@/services/dashboard.service';
import { ApiResponse } from '@/types/api';

const extrairValorDaDescricao = (descricao: string): string => {
  const regexValor = /R\$\s*(\d+(?:[.,]\d+)?)|(\d+(?:[.,]\d+)?)\s*(?:reais?|R\$)/gi;
  const match = regexValor.exec(descricao);

  if (match) {
    const valor = match[1] || match[2];
    return `R$ ${valor.replace(',', '.')}`;
  }

  return 'N/A';
};

export class DashboardController {
  async obterMetricas(request: NextRequest, agentIds?: number[]): Promise<NextResponse<ApiResponse>> {
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

      const metricas = await dashboardService.obterMetricas({
        startDate,
        endDate,
        agentIds,
        grupoId: grupoId ? Number(grupoId) : undefined,
        usuarioId: usuarioId ? Number(usuarioId) : undefined,
      });

      return NextResponse.json({
        success: true,
        data: metricas,
        message: 'Métricas da dashboard obtidas com sucesso',
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao obter métricas da dashboard',
        },
        { status: 500 }
      );
    }
  }

  async listarGrupos(agentIds?: number[]): Promise<NextResponse<ApiResponse>> {
    try {
      const grupos = await dashboardService.listarGrupos(agentIds);
      return NextResponse.json({
        success: true,
        data: grupos,
        message: 'Grupos listados com sucesso',
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao listar grupos',
        },
        { status: 500 }
      );
    }
  }

  async listarUsuarios(request: NextRequest, agentIds?: number[]): Promise<NextResponse<ApiResponse>> {
    try {
      const { searchParams } = new URL(request.url);
      const grupoId = searchParams.get('grupoId');

      const usuarios = await dashboardService.listarUsuarios(
        agentIds,
        grupoId ? Number(grupoId) : undefined
      );

      return NextResponse.json({
        success: true,
        data: usuarios,
        message: 'Usuários listados com sucesso',
      });
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao listar usuários',
        },
        { status: 500 }
      );
    }
  }

  async exportarDados(request: NextRequest, agentIds?: number[]): Promise<NextResponse> {
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

      const dados = await dashboardService.exportarDados({
        startDate,
        endDate,
        agentIds,
        grupoId: grupoId ? Number(grupoId) : undefined,
        usuarioId: usuarioId ? Number(usuarioId) : undefined,
      });

      const csvLines: string[] = [];

      csvLines.push('USUÁRIOS');
      csvLines.push('ID,Nome,Chat ID,Agent ID,Grupo,Status,Telefone,Criado Em');
      dados.usuarios.forEach((u: any) => {
        csvLines.push(
          `${u.id},${u.nome || ''},${u.chat_id},${u.agent_id},${u.grupo?.nome || 'Sem Grupo'},${u.status},${u.telefone || ''},${new Date(u.criado_em).toLocaleString('pt-BR')}`
        );
      });

      csvLines.push('');
      csvLines.push('TRANSAÇÕES');
      csvLines.push('ID,Usuário,Grupo,Tipo,Tipo Caixa,Valor,Categoria,Tipo Entrada,Data Transação,Semana Usuário,Descrição');
      dados.transacoes.forEach((t: any) => {
        // Calcular semana desde início do usuário
        const inicioUsuario = new Date(t.usuario.criado_em);
        const dataTransacao = new Date(t.data_transacao);
        const diffMs = dataTransacao.getTime() - inicioUsuario.getTime();
        const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const semanaUsuario = Math.max(1, Math.floor(diffDias / 7) + 1); // Semana 1, 2, 3...

        csvLines.push(
          `${t.id},${t.usuario.nome},${t.usuario.grupo?.nome || 'N/A'},${t.tipo},${t.tipo_caixa},${t.valor},${t.categoria.nome},${t.tipo_entrada},${new Date(t.data_transacao).toLocaleDateString('pt-BR')},${semanaUsuario},${(t.descricao || '').replace(/,/g, ';')}`
        );
      });

      csvLines.push('');
      csvLines.push('METAS');
      csvLines.push('ID,Usuário,Grupo,Tipo Meta,Cumprida,Data Início,Data Fim,Semana Usuário,Valor Alvo,Descrição');
      dados.metas.forEach((m: any) => {
        // Calcular semana desde início do usuário
        const inicioUsuario = new Date(m.usuario.criado_em);
        const dataInicio = new Date(m.data_inicio);
        const diffMs = dataInicio.getTime() - inicioUsuario.getTime();
        const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const semanaUsuario = Math.max(1, Math.floor(diffDias / 7) + 1); // Semana 1, 2, 3...
        const valorAlvo = extrairValorDaDescricao(m.descricao);
        const descricao = (m.descricao || '').replace(/,/g, ';').replace(/\n/g, ' ');

        csvLines.push(
          `${m.id},${m.usuario.nome},${m.usuario.grupo?.nome || 'N/A'},${m.tipo_meta},${m.cumprida === null ? 'Pendente' : m.cumprida ? 'Sim' : 'Não'},${new Date(m.data_inicio).toLocaleDateString('pt-BR')},${new Date(m.data_fim).toLocaleDateString('pt-BR')},${semanaUsuario},${valorAlvo},${descricao}`
        );
      });

      csvLines.push('');
      csvLines.push('MENSAGENS');
      csvLines.push('Usuário,Chat ID,Agent ID,Grupo,Tipo Mensagem,Quantidade');
      dados.mensagens.forEach((msg: any) => {
        csvLines.push(
          `${msg.usuario_nome},${msg.chat_id},${msg.agent_id},${msg.grupo},${msg.tipo_mensagem},${msg.quantidade}`
        );
      });

      csvLines.push('');
      csvLines.push('LATÊNCIAS');
      csvLines.push('Tipo,ID,Usuário,Grupo,Agent ID,Chat ID,Tipo Lembrete,Momento,Latência (segundos),Latência (minutos),Respondeu');

      // Latências do banco (lembretes registrados)
      if (dados.latencias && dados.latencias.length > 0) {
        dados.latencias.forEach((l) => {
          const latenciaMinutos = (l.latencia_segundos / 60).toFixed(2);
          csvLines.push(
            `Lembrete,${l.id},${l.usuario.nome},${l.usuario.grupo?.nome || 'N/A'},${l.agent_id},N/A,${l.tipo_lembrete || 'N/A'},${new Date(l.momento_lembrete).toLocaleString('pt-BR')},${l.latencia_segundos},${latenciaMinutos},${l.respondeu ? 'Sim' : 'Não'}`
          );
        });
      }

      // Pílulas do conhecimento (da API externa)
      if (dados.pilulas && dados.pilulas.length > 0) {
        dados.pilulas.forEach((p) => {
          const dataEnvio = new Date(p.template_timestamp * 1000).toLocaleString('pt-BR');
          const latenciaMinutos = p.latency_minutes;
          csvLines.push(
            `Pílula,N/A,${p.usuario_nome},${p.grupo},${p.usuario_agent_id || 437},${p.chat_id || p.usuario_chat_id || 'N/A'},${p.template_name},${dataEnvio},${p.latency_seconds},${latenciaMinutos},Sim`
          );
        });
      }

      // Goals Template Latency (Acompanhamento de Metas)
      if (dados.goalsLatency && dados.goalsLatency.length > 0) {
        dados.goalsLatency.forEach((g) => {
          const dataEnvio = new Date(g.template_timestamp * 1000).toLocaleString('pt-BR');
          const latenciaMinutos = g.latency_minutes;
          csvLines.push(
            `Meta,N/A,${g.usuario_nome},${g.grupo},${g.usuario_agent_id || 437},${g.chat_id || g.usuario_chat_id || 'N/A'},${g.template_name},${dataEnvio},${g.latency_seconds},${latenciaMinutos},Sim`
          );
        });
      }

      // Response Latency (Lembretes de Registro)
      if (dados.responseLatency && dados.responseLatency.length > 0) {
        dados.responseLatency.forEach((r) => {
          const dataEnvio = r.template_timestamp ? new Date(r.template_timestamp * 1000).toLocaleString('pt-BR') : 'N/A';
          const latenciaMinutos = r.latency_minutes || 0;
          csvLines.push(
            `Registro,N/A,${r.usuario_nome},${r.grupo},${r.usuario_agent_id || 437},${r.chat_id || r.usuario_chat_id || 'N/A'},${r.template_name || 'N/A'},${dataEnvio},${r.latency_seconds || 0},${latenciaMinutos},Sim`
          );
        });
      }

      csvLines.push('');
      csvLines.push('SOLICITAÇÕES ATIVAS');
      csvLines.push('Usuário,Grupo,Tipo Solicitação,Timestamp');
      if (dados.solicitacoesAtivas && dados.solicitacoesAtivas.length > 0) {
        dados.solicitacoesAtivas.forEach((s: any) => {
          const dataFormatada = new Date(s.timestamp * 1000).toLocaleString('pt-BR');
          csvLines.push(
            `${s.usuario_nome},${s.grupo},${s.tipo_solicitacao},${dataFormatada}`
          );
        });
      }

      csvLines.push('');
      csvLines.push('VISUALIZAÇÕES DE PAINEL');
      csvLines.push('Usuário,Grupo,Tipo Visualização,Timestamp');
      if (dados.visualizacoesPainel && dados.visualizacoesPainel.length > 0) {
        dados.visualizacoesPainel.forEach((v: any) => {
          const dataFormatada = new Date(v.timestamp * 1000).toLocaleString('pt-BR');
          csvLines.push(
            `${v.usuario_nome},${v.grupo},${v.tipo_visualizacao},${dataFormatada}`
          );
        });
      }

      csvLines.push('');
      csvLines.push('ENGAJAMENTO COMPLETO (MENSAGENS INBOUND)');
      csvLines.push('Usuário,Chat ID,Grupo,Grupo ID,Quantidade de Mensagens');
      if (dados.inboundMessages && dados.inboundMessages.length > 0) {
        dados.inboundMessages.forEach((m: any) => {
          csvLines.push(
            `${m.usuario_nome},${m.chat_id},${m.grupo},${m.grupo_id || 'N/A'},${m.message_count}`
          );
        });
      }

      const csv = csvLines.join('\n');
      const bom = '\uFEFF';
      const csvWithBom = bom + csv;

      return new NextResponse(csvWithBom, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="dashboard-export-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      return NextResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : 'Erro ao exportar dados',
        },
        { status: 500 }
      );
    }
  }
}

export const dashboardController = new DashboardController();
