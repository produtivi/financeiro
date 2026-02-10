'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Calendar,
  Target,
  Lightbulb,
  Download,
} from 'lucide-react';

interface Latencia {
  id: number;
  usuario_id: number;
  agent_id: number;
  momento_lembrete: string;
  momento_resposta: string;
  latencia_segundos: number;
  tipo_lembrete: string | null;
  respondeu: boolean;
  criado_em: string;
  usuario: {
    id: number;
    nome: string;
    agent_id: number;
  };
}

interface Estatisticas {
  total: number;
  latencia_media: number;
  latencia_minima: number;
  latencia_maxima: number;
  taxa_resposta: number;
}

interface Grupo {
  id: number;
  nome: string;
}

interface Usuario {
  id: number;
  nome: string;
}

interface LatenciaMetrics {
  average_seconds: number;
  average_minutes: number;
  average_hours: number;
  median_seconds: number;
  median_minutes: number;
  median_hours: number;
  min_seconds: number;
  min_minutes: number;
  max_seconds: number;
  max_minutes: number;
  max_hours: number;
}

interface ResponseLatencyData {
  period: {
    start_date: string;
    end_date: string;
  };
  reminders_sent: number;
  unique_contacts_sent: number;
  total_responses: number;
  unique_contacts_responded: number;
  response_rate_percent: number;
  latency_metrics: LatenciaMetrics | null;
  message?: string;
}

interface GoalsTemplateLatencyData {
  period: {
    start_date: string;
    end_date: string;
  };
  templates_sent: number;
  unique_contacts_sent: number;
  templates_sent_by_type: {
    formal: number;
    padrao: number;
  };
  total_responses: number;
  unique_contacts_responded: number;
  response_rate_percent: number;
  responses_by_template_type: {
    formal: number;
    padrao: number;
  };
  latency_metrics: LatenciaMetrics | null;
  message?: string;
}

interface KnowledgePillLatencyData {
  period: {
    start_date: string;
    end_date: string;
  };
  total_responses: number;
  unique_contacts: number;
  latency_metrics: LatenciaMetrics | null;
  message?: string;
}

type PeriodoRapido = 'semana' | 'mes' | 'ano' | 'custom';

const getDomingoAnterior = (data: Date): Date => {
  const dia = data.getDay();
  const diff = dia === 0 ? 0 : dia;
  const domingo = new Date(data);
  domingo.setDate(domingo.getDate() - diff);
  domingo.setHours(0, 0, 0, 0);
  return domingo;
};

export default function LatenciasPage() {
  const [latencias, setLatencias] = useState<Latencia[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [responseLatency, setResponseLatency] = useState<ResponseLatencyData | null>(null);
  const [goalsTemplateLatency, setGoalsTemplateLatency] = useState<GoalsTemplateLatencyData | null>(null);
  const [knowledgePillLatency, setKnowledgePillLatency] = useState<KnowledgePillLatencyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingResponseLatency, setLoadingResponseLatency] = useState(false);
  const [loadingGoalsLatency, setLoadingGoalsLatency] = useState(false);
  const [loadingKnowledgePillLatency, setLoadingKnowledgePillLatency] = useState(false);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState('');
  const [usuarioSelecionado, setUsuarioSelecionado] = useState('');
  const [usuarioFiltro, setUsuarioFiltro] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [periodoSelecionado, setPeriodoSelecionado] = useState<PeriodoRapido>('semana');

  const AGENT_API_URL = process.env.NEXT_PUBLIC_AGENT_API_URL;

  const calcularPeriodo = useCallback((tipo: PeriodoRapido) => {
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);
    let inicio = new Date();

    switch (tipo) {
      case 'semana':
        inicio = getDomingoAnterior(hoje);
        break;
      case 'mes':
        inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        inicio.setHours(0, 0, 0, 0);
        break;
      case 'ano':
        inicio = new Date(hoje.getFullYear(), 0, 1);
        inicio.setHours(0, 0, 0, 0);
        break;
      default:
        return;
    }

    setDataInicio(inicio.toISOString().split('T')[0]);
    setDataFim(hoje.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    calcularPeriodo('semana');
    carregarGrupos();
  }, [calcularPeriodo]);

  useEffect(() => {
    if (grupoSelecionado) {
      carregarUsuarios();
    } else {
      setUsuarios([]);
      setUsuarioSelecionado('');
    }
  }, [grupoSelecionado]);

  const carregarGrupos = async () => {
    try {
      const res = await fetch('/api/v1/dashboard/grupos');
      const data = await res.json();
      if (data.success) {
        setGrupos(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    }
  };

  const carregarUsuarios = async () => {
    try {
      const params = new URLSearchParams();
      if (grupoSelecionado) {
        params.append('grupoId', grupoSelecionado);
      }

      const res = await fetch(`/api/v1/dashboard/usuarios?${params}`);
      const data = await res.json();
      if (data.success) {
        setUsuarios(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const handleGrupoChange = (grupoId: string) => {
    setGrupoSelecionado(grupoId);
    setUsuarioSelecionado('');
    // Limpa as métricas antigas para não mostrar dados incorretos
    setResponseLatency(null);
    setGoalsTemplateLatency(null);
    setKnowledgePillLatency(null);
  };

  const handlePeriodoChange = (tipo: PeriodoRapido) => {
    setPeriodoSelecionado(tipo);
    if (tipo !== 'custom') {
      calcularPeriodo(tipo);
    }
  };

  const carregarDados = useCallback(async () => {
    if (!dataInicio || !dataFim) return;

    // Valida se as datas estão no formato correto (YYYY-MM-DD com 10 caracteres)
    if (dataInicio.length !== 10 || dataFim.length !== 10) {
      return;
    }

    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (usuarioFiltro) {
        params.append('usuario_id', usuarioFiltro);
      }

      const promises = [
        fetch(`/api/v1/latencias?${params}`).catch(() => null),
        fetch(`/api/v1/latencias/estatisticas?${params}`).catch(() => null),
      ];

      const results = await Promise.all(promises);

      const [latenciasRes, estatisticasRes] = results;

      if (latenciasRes && latenciasRes.ok) {
        const latenciasData = await latenciasRes.json();
        if (latenciasData.success) {
          setLatencias(latenciasData.data);
        }
      }

      if (estatisticasRes && estatisticasRes.ok) {
        const estatisticasData = await estatisticasRes.json();
        if (estatisticasData.success) {
          setEstatisticas(estatisticasData.data);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [usuarioFiltro, dataInicio, dataFim]);

  const carregarLatencias = useCallback(() => {
    if (!AGENT_API_URL || !dataInicio || !dataFim) return;

    // Valida se as datas estão no formato correto (YYYY-MM-DD com 10 caracteres)
    if (dataInicio.length !== 10 || dataFim.length !== 10) {
      return;
    }

    const apiParams = new URLSearchParams({
      startDate: dataInicio,
      endDate: dataFim,
    });

    if (grupoSelecionado) {
      apiParams.append('grupo_id', grupoSelecionado);
    }

    if (usuarioSelecionado) {
      apiParams.append('usuario_id', usuarioSelecionado);
    }

    carregarResponseLatency(apiParams);
    carregarGoalsLatency(apiParams);
    carregarKnowledgePillLatency(apiParams);
  }, [AGENT_API_URL, dataInicio, dataFim, grupoSelecionado, usuarioSelecionado]);

  useEffect(() => {
    if (dataInicio && dataFim && dataInicio.length === 10 && dataFim.length === 10) {
      carregarLatencias();
    }
  }, [dataInicio, dataFim, grupoSelecionado, usuarioSelecionado, carregarLatencias]);

  const carregarResponseLatency = async (params: URLSearchParams) => {
    setLoadingResponseLatency(true);
    setResponseLatency(null);

    try {
      const response = await fetch(`${AGENT_API_URL}/public/agent-metrics/response-latency?${params}`);

      if (response && response.ok) {
        const data = await response.json();
        if (data.success) {
          setResponseLatency(data.data);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar latência de registro:', err);
    } finally {
      setLoadingResponseLatency(false);
    }
  };

  const carregarGoalsLatency = async (params: URLSearchParams) => {
    setLoadingGoalsLatency(true);
    setGoalsTemplateLatency(null);

    try {
      const response = await fetch(`${AGENT_API_URL}/public/agent-metrics/goals-template-latency?${params}`);

      if (response && response.ok) {
        const data = await response.json();
        if (data.success) {
          setGoalsTemplateLatency(data.data);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar latência de metas:', err);
    } finally {
      setLoadingGoalsLatency(false);
    }
  };

  const carregarKnowledgePillLatency = async (params: URLSearchParams) => {
    setLoadingKnowledgePillLatency(true);
    setKnowledgePillLatency(null);

    try {
      const response = await fetch(`${AGENT_API_URL}/public/agent-metrics/knowledge-pill-latency?${params}`);

      if (response && response.ok) {
        const data = await response.json();
        if (data.success) {
          setKnowledgePillLatency(data.data);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar latência de pílulas:', err);
    } finally {
      setLoadingKnowledgePillLatency(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const formatarTempo = (segundos: number): string => {
    if (segundos < 60) {
      return `${segundos}s`;
    }
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    if (minutos < 60) {
      return `${minutos}min ${segundosRestantes}s`;
    }
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    return `${horas}h ${minutosRestantes}min`;
  };

  const formatarData = (data: string): string => {
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const baixarCSV = async () => {
    const bom = '\uFEFF'; // BOM para UTF-8
    const rows: string[] = [];

    // ===== SEÇÃO 1: ESTATÍSTICAS COMPILADAS =====
    rows.push('');

    // Obter nomes de grupo e usuário
    const grupoNome = grupoSelecionado
      ? grupos.find(g => g.id.toString() === grupoSelecionado)?.nome || 'Todos os Grupos'
      : 'Todos os Grupos';

    const usuarioNome = usuarioSelecionado
      ? usuarios.find(u => u.id.toString() === usuarioSelecionado)?.nome || 'Todos os Usuários'
      : 'Todos os Usuários';

    // Cabeçalho
    rows.push('Tipo de Latência,Grupo,Usuário,Período Início,Período Fim,Total Respostas,Contatos Únicos Responderam,Taxa de Resposta (%),Tempo Mínimo (segundos),Tempo Mediano (segundos),Tempo Médio (segundos),Tempo Máximo (segundos),Tempo Médio (minutos),Tempo Médio (horas)');

    // Response Latency
    if (responseLatency && responseLatency.latency_metrics) {
      const metrics = responseLatency.latency_metrics;
      rows.push([
        'Lembretes de Registro',
        grupoNome,
        usuarioNome,
        responseLatency.period.start_date,
        responseLatency.period.end_date,
        responseLatency.total_responses,
        responseLatency.unique_contacts_responded,
        responseLatency.response_rate_percent.toFixed(2),
        metrics.min_seconds,
        metrics.median_seconds,
        metrics.average_seconds,
        metrics.max_seconds,
        metrics.average_minutes.toFixed(2),
        metrics.average_hours.toFixed(2),
      ].join(','));
    }

    // Goals Template Latency
    if (goalsTemplateLatency && goalsTemplateLatency.latency_metrics) {
      const metrics = goalsTemplateLatency.latency_metrics;
      rows.push([
        'Templates de Metas',
        grupoNome,
        usuarioNome,
        goalsTemplateLatency.period.start_date,
        goalsTemplateLatency.period.end_date,
        goalsTemplateLatency.total_responses,
        goalsTemplateLatency.unique_contacts_responded,
        goalsTemplateLatency.response_rate_percent.toFixed(2),
        metrics.min_seconds,
        metrics.median_seconds,
        metrics.average_seconds,
        metrics.max_seconds,
        metrics.average_minutes.toFixed(2),
        metrics.average_hours.toFixed(2),
      ].join(','));
    }

    // Knowledge Pill Latency
    if (knowledgePillLatency && knowledgePillLatency.latency_metrics) {
      const metrics = knowledgePillLatency.latency_metrics;
      rows.push([
        'Pílulas do Conhecimento',
        grupoNome,
        usuarioNome,
        knowledgePillLatency.period.start_date,
        knowledgePillLatency.period.end_date,
        knowledgePillLatency.total_responses,
        knowledgePillLatency.unique_contacts,
        '', // não tem taxa de resposta
        metrics.min_seconds,
        metrics.median_seconds,
        metrics.average_seconds,
        metrics.max_seconds,
        metrics.average_minutes.toFixed(2),
        metrics.average_hours.toFixed(2),
      ].join(','));
    }

    // ===== SEÇÃO 2: DADOS INDIVIDUAIS DE LATÊNCIA =====


    // Buscar dados detalhados da API
    try {
      const params = new URLSearchParams();
      if (grupoSelecionado) {
        params.append('grupoId', grupoSelecionado);
      }
      if (usuarioSelecionado) {
        params.append('usuario_id', usuarioSelecionado);
      }
      if (dataInicio && dataFim) {
        params.append('data_inicio', dataInicio);
        params.append('data_fim', dataFim);
      }

      const response = await fetch(`/api/v1/latencias?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
          rows.push('ID,Usuário,Grupo,Agent ID,Tipo Lembrete,Momento Lembrete,Momento Resposta,Latência (segundos),Latência (minutos),Latência (horas),Respondeu');

          data.data.forEach((l: Latencia & { usuario: { nome: string; grupo?: { nome: string } } }) => {
            const latenciaMinutos = (l.latencia_segundos / 60).toFixed(2);
            const latenciaHoras = (l.latencia_segundos / 3600).toFixed(2);
            const grupo = l.usuario?.grupo?.nome || 'Sem Grupo';

            rows.push([
              l.id,
              l.usuario?.nome || `Usuário #${l.usuario_id}`,
              grupo,
              l.agent_id,
              l.tipo_lembrete || 'N/A',
              new Date(l.momento_lembrete).toLocaleString('pt-BR'),
              new Date(l.momento_resposta).toLocaleString('pt-BR'),
              l.latencia_segundos,
              latenciaMinutos,
              latenciaHoras,
              l.respondeu ? 'Sim' : 'Não'
            ].join(','));
          });
        } else {
          rows.push('');
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados individuais:', error);
      rows.push('Erro ao buscar dados individuais de latência.');
    }

    const csvContent = bom + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const dataFormatada = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `latencias_${dataFormatada}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Latências</h1>
          <p className="text-gray-400">
            Tempo de resposta entre lembretes e respostas dos usuários
          </p>
        </div>
        <button
          onClick={baixarCSV}
          disabled={!responseLatency && !goalsTemplateLatency && !knowledgePillLatency}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Download className="w-5 h-5" />
          Baixar CSV
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Período Rápido</label>
            <div className="flex gap-2 flex-wrap mb-4">
              <button
                onClick={() => handlePeriodoChange('semana')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${periodoSelecionado === 'semana'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
              >
                Última Semana
              </button>
              <button
                onClick={() => handlePeriodoChange('mes')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${periodoSelecionado === 'mes'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
              >
                Último Mês
              </button>
              <button
                onClick={() => handlePeriodoChange('ano')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${periodoSelecionado === 'ano'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
              >
                Último Ano
              </button>
              <button
                onClick={() => handlePeriodoChange('custom')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${periodoSelecionado === 'custom'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
              >
                Personalizado
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Data Início</label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => {
                  setDataInicio(e.target.value);
                  setPeriodoSelecionado('custom');
                }}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Data Fim</label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => {
                  setDataFim(e.target.value);
                  setPeriodoSelecionado('custom');
                }}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Filtrar por Grupo</label>
            <select
              value={grupoSelecionado}
              onChange={(e) => handleGrupoChange(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 mb-4"
            >
              <option value="">Todos os Grupos</option>
              {grupos.map((grupo) => (
                <option key={grupo.id} value={grupo.id}>
                  {grupo.nome}
                </option>
              ))}
            </select>

            <label className="block text-sm font-medium text-gray-300 mb-2">Filtrar por Usuário</label>
            <select
              value={usuarioSelecionado}
              onChange={(e) => setUsuarioSelecionado(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              disabled={!grupoSelecionado}
            >
              <option value="">Todos os Usuários</option>
              {usuarios.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nome || `Usuário #${usuario.id}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!AGENT_API_URL && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <p className="text-yellow-400 text-sm">
            AGENT_API_URL não configurada. As métricas de latência da API externa não serão exibidas.
          </p>
        </div>
      )}

      {loadingResponseLatency && !responseLatency ? (
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 border border-blue-500/30 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-400 animate-pulse" />
            Latência de Lembretes de Registro
          </h2>
          <div className="flex flex-col items-center justify-center h-32 space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            <p className="text-gray-400 text-sm text-center">
              Carregando... Esta métrica pode demorar pois busca por palavras-chave específicas nas mensagens
            </p>
          </div>
        </div>
      ) : responseLatency && responseLatency.latency_metrics && (
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 border border-blue-500/30 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-400" />
            Latência de Lembretes de Registro
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            Tempo de resposta após lembretes de registro de entradas/saídas
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Lembretes Enviados</p>
              <p className="text-3xl font-bold text-blue-400">{responseLatency.reminders_sent}</p>
              <p className="text-xs text-gray-500 mt-1">{responseLatency.unique_contacts_sent} contatos únicos</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Respostas Recebidas</p>
              <p className="text-3xl font-bold text-white">{responseLatency.total_responses}</p>
              <p className="text-xs text-gray-500 mt-1">{responseLatency.unique_contacts_responded} contatos únicos</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Taxa de Resposta</p>
              <p className="text-3xl font-bold text-green-400">{responseLatency.response_rate_percent.toFixed(1)}%</p>
              <p className="text-xs text-gray-500 mt-1">{responseLatency.total_responses}/{responseLatency.reminders_sent} responderam</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 pt-4 border-t border-blue-500/20">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Latência Média</p>
              <p className="text-3xl font-bold text-blue-400">
                {responseLatency.latency_metrics.average_minutes.toFixed(1)}min
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Latência Mínima</p>
              <p className="text-3xl font-bold text-cyan-400">
                {responseLatency.latency_metrics.min_minutes.toFixed(1)}min
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Latência Máxima</p>
              <p className="text-3xl font-bold text-orange-400">
                {responseLatency.latency_metrics.max_minutes.toFixed(1)}min
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-blue-500/20">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-2">Mediana</p>
              <p className="text-2xl font-bold text-white">
                {responseLatency.latency_metrics.median_minutes.toFixed(1)} minutos
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ({responseLatency.latency_metrics.median_hours.toFixed(2)}h)
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-2">Tempo Médio</p>
              <p className="text-2xl font-bold text-white">
                {responseLatency.latency_metrics.average_hours.toFixed(2)} horas
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ({responseLatency.latency_metrics.average_seconds} segundos)
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-2">Período</p>
              <p className="text-sm font-semibold text-white">
                {new Date(dataInicio).toLocaleDateString('pt-BR')}
              </p>
              <p className="text-sm font-semibold text-white">
                até {new Date(dataFim).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      )}

      {loadingGoalsLatency && !goalsTemplateLatency ? (
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border border-purple-500/30 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-400 animate-pulse" />
            Latência de Templates de Metas
          </h2>
          <div className="flex flex-col items-center justify-center h-32 space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
            <p className="text-gray-400 text-sm text-center">
              Carregando... Esta métrica pode demorar pois analisa mensagens específicas de WhatsApp
            </p>
          </div>
        </div>
      ) : goalsTemplateLatency && goalsTemplateLatency.latency_metrics && (
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border border-purple-500/30 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-400" />
            Latência de Templates de Metas
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            Tempo de resposta após envio de templates de acompanhamento de metas
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Templates Enviados</p>
              <p className="text-3xl font-bold text-blue-400">{goalsTemplateLatency.templates_sent}</p>
              <p className="text-xs text-gray-500 mt-1">{goalsTemplateLatency.unique_contacts_sent} contatos únicos</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Respostas Recebidas</p>
              <p className="text-3xl font-bold text-white">{goalsTemplateLatency.total_responses}</p>
              <p className="text-xs text-gray-500 mt-1">{goalsTemplateLatency.unique_contacts_responded} contatos únicos</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Taxa de Resposta</p>
              <p className="text-3xl font-bold text-green-400">{goalsTemplateLatency.response_rate_percent.toFixed(1)}%</p>
              <p className="text-xs text-gray-500 mt-1">{goalsTemplateLatency.total_responses}/{goalsTemplateLatency.templates_sent} responderam</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 pt-4 border-t border-purple-500/20">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Latência Média</p>
              <p className="text-3xl font-bold text-purple-400">
                {goalsTemplateLatency.latency_metrics.average_minutes.toFixed(1)}min
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Latência Mínima</p>
              <p className="text-3xl font-bold text-cyan-400">
                {goalsTemplateLatency.latency_metrics.min_minutes.toFixed(1)}min
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-1">Latência Máxima</p>
              <p className="text-3xl font-bold text-orange-400">
                {goalsTemplateLatency.latency_metrics.max_minutes.toFixed(1)}min
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-purple-500/20">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-2">Template Formal</p>
              <p className="text-2xl font-bold text-purple-400">
                {goalsTemplateLatency.templates_sent_by_type?.formal || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">envios</p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-2">Template Padrão</p>
              <p className="text-2xl font-bold text-pink-400">
                {goalsTemplateLatency.templates_sent_by_type?.padrao || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">envios</p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-2">Mediana</p>
              <p className="text-2xl font-bold text-white">
                {goalsTemplateLatency.latency_metrics.median_minutes.toFixed(1)} min
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ({goalsTemplateLatency.latency_metrics.median_hours.toFixed(2)}h)
              </p>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-2">Tempo Médio</p>
              <p className="text-2xl font-bold text-white">
                {goalsTemplateLatency.latency_metrics.average_hours.toFixed(2)} horas
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ({goalsTemplateLatency.latency_metrics.average_seconds}s)
              </p>
            </div>
          </div>
        </div>
      )}

      {loadingKnowledgePillLatency && !knowledgePillLatency ? (
        <div className="bg-gradient-to-br from-amber-500/10 to-yellow-600/10 border border-amber-500/30 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-amber-400 animate-pulse" />
            Latência de Pílulas do Conhecimento
          </h2>
          <div className="flex flex-col items-center justify-center h-32 space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
            <p className="text-gray-400 text-sm text-center">
              Carregando... Esta métrica pode demorar pois analisa mensagens de pílulas do conhecimento
            </p>
          </div>
        </div>
      ) : knowledgePillLatency ? (
        knowledgePillLatency.latency_metrics ? (
          <div className="bg-gradient-to-br from-amber-500/10 to-yellow-600/10 border border-amber-500/30 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-amber-400" />
              Latência de Pílulas do Conhecimento
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Tempo de resposta após envio de pílulas do conhecimento (conteúdo educativo)
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center bg-gray-900/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-2">Total Respostas</p>
                <p className="text-3xl font-bold text-white">{knowledgePillLatency.total_responses}</p>
              </div>
              <div className="text-center bg-gray-900/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-2">Contatos Únicos</p>
                <p className="text-3xl font-bold text-white">{knowledgePillLatency.unique_contacts}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-2">Tempo Mínimo</p>
                <p className="text-2xl font-bold text-green-400">
                  {knowledgePillLatency.latency_metrics.min_minutes.toFixed(0)} min
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  ({knowledgePillLatency.latency_metrics.min_seconds}s)
                </p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-2">Tempo Mediano</p>
                <p className="text-2xl font-bold text-blue-400">
                  {knowledgePillLatency.latency_metrics.median_hours.toFixed(2)} horas
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  ({knowledgePillLatency.latency_metrics.median_minutes.toFixed(0)}min)
                </p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-2">Tempo Médio</p>
                <p className="text-2xl font-bold text-white">
                  {knowledgePillLatency.latency_metrics.average_hours.toFixed(2)} horas
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  ({knowledgePillLatency.latency_metrics.average_minutes.toFixed(0)}min)
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-amber-500/10 to-yellow-600/10 border border-amber-500/30 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-amber-400" />
              Latência de Pílulas do Conhecimento
            </h2>
            <div className="flex flex-col items-center justify-center h-32">
              <p className="text-gray-400 text-center">
                {knowledgePillLatency.message || 'Nenhum dado disponível para o período selecionado'}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Total de respostas: {knowledgePillLatency.total_responses || 0}
              </p>
            </div>
          </div>
        )
      ) : null}


    </div>
  );
}
