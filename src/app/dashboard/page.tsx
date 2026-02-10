'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Users,
  Target,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  FileText,
  Mic,
  Image as ImageIcon,
  Video,
  Receipt,
  TrendingUp,
  Briefcase,
  User,
  PieChart as PieChartIcon,
  Download,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Lightbulb,
  HelpCircle,
  Eye,
  Activity,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { MetricTooltip } from '@/components/MetricTooltip';

interface DashboardMetrics {
  usuarios: {
    total: number;
    ativos: number;
    porGrupo: Record<string, number>;
  };
  transacoes: {
    total: number;
    receitas: number;
    despesas: number;
    saldo: number;
    totalReceitas: number;
    totalDespesas: number;
    porTipoEntrada: Record<string, number>;
    pessoal: {
      receitas: number;
      despesas: number;
      saldo: number;
      quantidade: number;
    };
    negocio: {
      receitas: number;
      despesas: number;
      saldo: number;
      quantidade: number;
    };
    percentualNegocio: number;
    percentualPessoal: number;
  };
  metas: {
    total: number;
    cumpridas: number;
    naoCumpridas: number;
    pendentes: number;
    taxaCumprimento: number;
    porTipoMeta: Record<string, number>;
  };
  mensagens?: {
    total: number;
    porTipo: Record<string, number>;
  };
  engagementStats?: EngagementStats;
}

interface EngagementStats {
  agent_id: number;
  timestamp: string;
  summary: {
    high_engagement: {
      count: number;
      description: string;
      percentage: string;
    };
    mid_engagement: {
      count: number;
      description: string;
      percentage: string;
    };
    low_engagement: {
      count: number;
      description: string;
      percentage: string;
    };
    total_chats: number;
    total_tags: number;
  };
  by_tag: Array<{
    tag_id: number;
    tag_name: string;
    tag_color: string;
    high_engagement: {
      count: number;
      description: string;
      percentage: string;
    };
    mid_engagement: {
      count: number;
      description: string;
      percentage: string;
    };
    low_engagement: {
      count: number;
      description: string;
      percentage: string;
    };
    total_chats: number;
  }>;
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
  total_responses: number;
  unique_contacts: number;
  latency_metrics: LatenciaMetrics | null;
  message?: string;
}

interface GoalsTemplateLatencyData {
  period: {
    start_date: string;
    end_date: string;
  };
  total_responses: number;
  unique_contacts: number;
  templates_used: {
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

interface ActiveRequestsData {
  total_active_requests: number;
  requests_by_type: {
    resumo: number;
    ajuda: number;
    suporte: number;
  };
  unique_users: number;
}

interface PanelViewsData {
  total_panel_views: number;
  via_button: number;
  via_direct_request: number;
  unique_users: number;
}

interface GoalsFrequencyData {
  total_goals_registered: number;
  total_goals_completed: number;
  total_goals_not_completed: number;
  completion_rate_percent: number;
  unique_users: number;
}

interface Grupo {
  id: number;
  nome: string;
}

interface Usuario {
  id: number;
  nome: string;
}

type PeriodoRapido = 'semana' | 'mes' | 'ano' | 'custom';

const CORES_GRUPOS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4'];
const CORES_TIPOS = {
  texto: '#3b82f6',
  audio: '#10b981',
  foto: '#ec4899',
  video: '#8b5cf6',
  nota_fiscal: '#f59e0b',
};

const LABELS_TIPOS: Record<string, string> = {
  texto: 'Texto',
  audio: 'Áudio',
  foto: 'Foto',
  video: 'Vídeo',
  nota_fiscal: 'Nota Fiscal',
};

const ICONS_TIPOS: Record<string, any> = {
  texto: FileText,
  audio: Mic,
  foto: ImageIcon,
  video: Video,
  nota_fiscal: Receipt,
};

const LABELS_TIPOS_META: Record<string, string> = {
  reserva_financeira: 'Reserva Financeira',
  controle_inventario: 'Controle de Inventário',
  meta_vendas: 'Meta de Vendas',
  pagamento_contas: 'Pagamento de Contas',
  outro: 'Outro',
};

const CORES_TIPOS_META: Record<string, string> = {
  reserva_financeira: '#10b981',
  controle_inventario: '#3b82f6',
  meta_vendas: '#f59e0b',
  pagamento_contas: '#ef4444',
  outro: '#8b5cf6',
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodoSelecionado, setPeriodoSelecionado] = useState<PeriodoRapido>('semana');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState('');
  const [usuarioSelecionado, setUsuarioSelecionado] = useState('');
  const [responseLatency, setResponseLatency] = useState<ResponseLatencyData | null>(null);
  const [goalsTemplateLatency, setGoalsTemplateLatency] = useState<GoalsTemplateLatencyData | null>(null);
  const [knowledgePillLatency, setKnowledgePillLatency] = useState<KnowledgePillLatencyData | null>(null);
  const [loadingResponseLatency, setLoadingResponseLatency] = useState(false);
  const [loadingGoalsLatency, setLoadingGoalsLatency] = useState(false);
  const [loadingKnowledgePillLatency, setLoadingKnowledgePillLatency] = useState(false);
  const [errorResponseLatency, setErrorResponseLatency] = useState(false);
  const [errorGoalsLatency, setErrorGoalsLatency] = useState(false);
  const [errorKnowledgePillLatency, setErrorKnowledgePillLatency] = useState(false);
  const [activeRequests, setActiveRequests] = useState<ActiveRequestsData | null>(null);
  const [panelViews, setPanelViews] = useState<PanelViewsData | null>(null);
  const [goalsFrequency, setGoalsFrequency] = useState<GoalsFrequencyData | null>(null);
  const [loadingActiveRequests, setLoadingActiveRequests] = useState(false);
  const [loadingPanelViews, setLoadingPanelViews] = useState(false);
  const [loadingGoalsFrequency, setLoadingGoalsFrequency] = useState(false);

  const getDomingoAnterior = (data: Date): Date => {
    const dia = data.getDay();
    const diff = dia === 0 ? 0 : dia;
    const domingo = new Date(data);
    domingo.setDate(domingo.getDate() - diff);
    domingo.setHours(0, 0, 0, 0);
    return domingo;
  };

  const calcularPeriodo = (tipo: PeriodoRapido) => {
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
  };

  useEffect(() => {
    calcularPeriodo('semana');
    carregarGrupos();
  }, []);

  useEffect(() => {
    if (grupoSelecionado) {
      carregarUsuarios();
    } else {
      setUsuarios([]);
      setUsuarioSelecionado('');
    }
  }, [grupoSelecionado]);

  useEffect(() => {
    if (dataInicio && dataFim) {
      carregarMetricas();
    }
  }, [dataInicio, dataFim, grupoSelecionado, usuarioSelecionado]);

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

  const carregarMetricas = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        startDate: dataInicio,
        endDate: dataFim,
      });

      if (grupoSelecionado) {
        params.append('grupoId', grupoSelecionado);
      }

      if (usuarioSelecionado) {
        params.append('usuarioId', usuarioSelecionado);
      }

      const metricsRes = await fetch(`/api/v1/dashboard/metricas?${params}`);

      if (!metricsRes || !metricsRes.ok) {
        throw new Error('Erro ao carregar métricas');
      }

      const data = await metricsRes.json();
      if (data.success) {
        setMetrics(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    } finally {
      setLoading(false);
    }

    carregarLatencias();
  };

  const carregarLatencias = async () => {
    const AGENT_API_URL = process.env.NEXT_PUBLIC_AGENT_API_URL;

    if (!AGENT_API_URL) {
      console.error('AGENT_API_URL não configurada');
      return;
    }

    const params = new URLSearchParams({
      startDate: dataInicio,
      endDate: dataFim,
    });

    if (grupoSelecionado) {
      params.append('grupo_id', grupoSelecionado);
    }

    if (usuarioSelecionado) {
      params.append('usuario_id', usuarioSelecionado);
    }

    carregarResponseLatency(AGENT_API_URL, params);
    carregarGoalsLatency(AGENT_API_URL, params);
    carregarKnowledgePillLatency(AGENT_API_URL, params);
    carregarActiveRequests(AGENT_API_URL, params);
    carregarPanelViews(AGENT_API_URL, params);
    carregarGoalsFrequency(AGENT_API_URL, params);
  };

  const carregarResponseLatency = async (agentApiUrl: string, params: URLSearchParams) => {
    setLoadingResponseLatency(true);
    setResponseLatency(null);
    setErrorResponseLatency(false);

    try {
      const response = await fetch(`${agentApiUrl}/public/agent-metrics/response-latency?${params}`);

      if (response && response.ok) {
        const data = await response.json();
        if (data.success) {
          setResponseLatency(data.data);
          setErrorResponseLatency(false);
        }
      } else {
        console.error('Erro ao carregar latência de registro:', response.status, response.statusText);
        setErrorResponseLatency(true);
      }
    } catch (err) {
      console.error('Erro ao carregar latência de registro:', err);
      setErrorResponseLatency(true);
    } finally {
      setLoadingResponseLatency(false);
    }
  };

  const carregarGoalsLatency = async (agentApiUrl: string, params: URLSearchParams) => {
    setLoadingGoalsLatency(true);
    setGoalsTemplateLatency(null);
    setErrorGoalsLatency(false);

    try {
      const response = await fetch(`${agentApiUrl}/public/agent-metrics/goals-template-latency?${params}`);

      if (response && response.ok) {
        const data = await response.json();
        if (data.success) {
          setGoalsTemplateLatency(data.data);
          setErrorGoalsLatency(false);
        }
      } else {
        console.error('Erro ao carregar latência de metas:', response.status, response.statusText);
        setErrorGoalsLatency(true);
      }
    } catch (err) {
      console.error('Erro ao carregar latência de metas:', err);
      setErrorGoalsLatency(true);
    } finally {
      setLoadingGoalsLatency(false);
    }
  };

  const carregarKnowledgePillLatency = async (agentApiUrl: string, params: URLSearchParams) => {
    setLoadingKnowledgePillLatency(true);
    setKnowledgePillLatency(null);
    setErrorKnowledgePillLatency(false);

    try {
      const response = await fetch(`${agentApiUrl}/public/agent-metrics/knowledge-pill-latency?${params}`);

      if (response && response.ok) {
        const data = await response.json();
        if (data.success) {
          setKnowledgePillLatency(data.data);
          setErrorKnowledgePillLatency(false);
        }
      } else {
        console.error('Erro ao carregar latência de pílulas:', response.status, response.statusText);
        setErrorKnowledgePillLatency(true);
      }
    } catch (err) {
      console.error('Erro ao carregar latência de pílulas:', err);
      setErrorKnowledgePillLatency(true);
    } finally {
      setLoadingKnowledgePillLatency(false);
    }
  };

  const carregarActiveRequests = async (agentApiUrl: string, params: URLSearchParams) => {
    setLoadingActiveRequests(true);
    setActiveRequests(null);

    try {
      const response = await fetch(`${agentApiUrl}/public/agent-metrics/active-requests?${params}`);

      if (response && response.ok) {
        const data = await response.json();
        if (data.success) {
          setActiveRequests(data.data);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar solicitações ativas:', err);
    } finally {
      setLoadingActiveRequests(false);
    }
  };

  const carregarPanelViews = async (agentApiUrl: string, params: URLSearchParams) => {
    setLoadingPanelViews(true);
    setPanelViews(null);

    try {
      const response = await fetch(`${agentApiUrl}/public/agent-metrics/panel-views?${params}`);

      if (response && response.ok) {
        const data = await response.json();
        if (data.success) {
          setPanelViews(data.data);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar visualizações de painel:', err);
    } finally {
      setLoadingPanelViews(false);
    }
  };

  const carregarGoalsFrequency = async (agentApiUrl: string, params: URLSearchParams) => {
    setLoadingGoalsFrequency(true);
    setGoalsFrequency(null);

    try {
      const response = await fetch(`${agentApiUrl}/public/agent-metrics/goals-frequency?${params}`);

      if (response && response.ok) {
        const data = await response.json();
        if (data.success) {
          setGoalsFrequency(data.data);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar frequência de metas:', err);
    } finally {
      setLoadingGoalsFrequency(false);
    }
  };

  const handlePeriodoChange = (tipo: PeriodoRapido) => {
    setPeriodoSelecionado(tipo);
    if (tipo !== 'custom') {
      calcularPeriodo(tipo);
    }
  };

  const handleGrupoChange = (grupoId: string) => {
    setGrupoSelecionado(grupoId);
    setUsuarioSelecionado('');
    // Limpa as métricas antigas para não mostrar dados incorretos
    setResponseLatency(null);
    setGoalsTemplateLatency(null);
    setKnowledgePillLatency(null);
    setErrorResponseLatency(false);
    setErrorGoalsLatency(false);
    setErrorKnowledgePillLatency(false);
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const exportarDados = async () => {
    try {
      const params = new URLSearchParams({
        startDate: dataInicio,
        endDate: dataFim,
      });

      if (grupoSelecionado) {
        params.append('grupoId', grupoSelecionado);
      }

      if (usuarioSelecionado) {
        params.append('usuarioId', usuarioSelecionado);
      }

      const response = await fetch(`/api/v1/dashboard/exportar?${params}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      alert('Erro ao exportar dados');
    }
  };

  const dadosGrupos = metrics
    ? Object.entries(metrics.usuarios.porGrupo).map(([nome, valor]) => ({
        name: nome,
        value: valor,
      }))
    : [];

  const dadosTiposMensagens = metrics?.mensagens
    ? Object.entries(metrics.mensagens.porTipo).map(([tipo, quantidade]) => ({
        tipo,
        label: tipo === 'text' ? 'Texto' : tipo === 'audio' ? 'Áudio' : tipo === 'image' ? 'Imagem' : tipo === 'video' ? 'Vídeo' : tipo,
        quantidade,
        fill: tipo === 'text' ? '#3b82f6' : tipo === 'audio' ? '#10b981' : tipo === 'image' ? '#ec4899' : tipo === 'video' ? '#8b5cf6' : '#6b7280',
      }))
    : [];

  const dadosTiposEntrada = dadosTiposMensagens;

  const dadosTiposMeta = metrics?.metas.porTipoMeta
    ? Object.entries(metrics.metas.porTipoMeta)
        .map(([tipo, quantidade]) => ({
          tipo,
          label: LABELS_TIPOS_META[tipo] || tipo,
          quantidade,
          fill: CORES_TIPOS_META[tipo] || '#6b7280',
        }))
        .sort((a, b) => b.quantidade - a.quantidade)
    : [];

  const tipoMetaMaisSolicitado = dadosTiposMeta.length > 0 ? dadosTiposMeta[0] : null;

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Carregando métricas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Visão geral do sistema Impact Hub</p>
        {session?.user && (
          <p className="text-sm text-gray-500 mt-1">
            Logado como: {session.user.name} ({session.user.role})
          </p>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Filtros</h2>
          </div>
          <button
            onClick={exportarDados}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar Dados
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              Período Rápido
              <MetricTooltip
                title="Período Rápido"
                description="Escolha um período pré-definido para ver os dados. Última Semana mostra desde domingo até hoje. Último Mês mostra o mês atual. Último Ano mostra o ano atual. Personalizado permite escolher datas específicas."
              />
            </label>
            <div className="flex gap-2 flex-wrap mb-4">
              <button
                onClick={() => handlePeriodoChange('semana')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  periodoSelecionado === 'semana'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Última Semana
              </button>
              <button
                onClick={() => handlePeriodoChange('mes')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  periodoSelecionado === 'mes'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Último Mês
              </button>
              <button
                onClick={() => handlePeriodoChange('ano')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  periodoSelecionado === 'ano'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Último Ano
              </button>
              <button
                onClick={() => handlePeriodoChange('custom')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  periodoSelecionado === 'custom'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                Personalizado
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  Data Início
                  <MetricTooltip
                    title="Data Início"
                    description="A partir de qual data você quer ver os dados. Por exemplo, se escolher 01/01/2024, vai mostrar informações desde esse dia até a Data Fim."
                  />
                </label>
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
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  Data Fim
                  <MetricTooltip
                    title="Data Fim"
                    description="Até qual data você quer ver os dados. Por exemplo, se escolher hoje, vai mostrar informações desde a Data Início até hoje."
                  />
                </label>
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
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              Filtrar por Grupo
              <MetricTooltip
                title="Filtrar por Grupo"
                description="Escolha um grupo experimental específico para ver só os dados desse grupo. Se deixar 'Todos os Grupos', mostra dados de todos os participantes juntos."
              />
            </label>
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

            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              Filtrar por Usuário
              <MetricTooltip
                title="Filtrar por Usuário"
                description="Escolha um usuário específico para ver só os dados dessa pessoa. Você precisa primeiro escolher um grupo para poder selecionar um usuário."
              />
            </label>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div className="flex items-center gap-2">
              <MetricTooltip
                title="Usuários Cadastrados"
                description="Número total de usuários cadastrados no sistema, incluindo ativos e inativos. Usuários ativos são aqueles com status 'active'."
              />
              <span className="text-xs text-gray-400">Total</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{metrics?.usuarios.total}</p>
          <p className="text-sm text-gray-400">Usuários Cadastrados</p>
          <div className="mt-3 pt-3 border-t border-gray-800">
            <p className="text-xs text-gray-500">{metrics?.usuarios.ativos} ativos</p>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <ArrowUpCircle className="w-6 h-6 text-green-500" />
            </div>
            <div className="flex items-center gap-2">
              <MetricTooltip
                title="Receitas"
                description="Soma de todas as transações de entrada (receitas) registradas no período selecionado, incluindo caixa pessoal e negócio."
              />
              <span className="text-xs text-gray-400">Receitas</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            {formatarMoeda(metrics?.transacoes.totalReceitas || 0)}
          </p>
          <p className="text-sm text-gray-400">{metrics?.transacoes.receitas} lançamentos</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
              <ArrowDownCircle className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex items-center gap-2">
              <MetricTooltip
                title="Despesas"
                description="Soma de todas as transações de saída (despesas) registradas no período selecionado, incluindo caixa pessoal e negócio."
              />
              <span className="text-xs text-gray-400">Despesas</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            {formatarMoeda(metrics?.transacoes.totalDespesas || 0)}
          </p>
          <p className="text-sm text-gray-400">{metrics?.transacoes.despesas} lançamentos</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                (metrics?.transacoes.saldo || 0) >= 0 ? 'bg-purple-500/10' : 'bg-orange-500/10'
              }`}
            >
              <Wallet
                className={`w-6 h-6 ${
                  (metrics?.transacoes.saldo || 0) >= 0 ? 'text-purple-500' : 'text-orange-500'
                }`}
              />
            </div>
            <div className="flex items-center gap-2">
              <MetricTooltip
                title="Saldo Total"
                description="Diferença entre receitas e despesas (Receitas - Despesas). Representa o fluxo de caixa líquido no período, somando caixa pessoal e negócio."
              />
              <span className="text-xs text-gray-400">Saldo</span>
            </div>
          </div>
          <p
            className={`text-3xl font-bold mb-1 ${
              (metrics?.transacoes.saldo || 0) >= 0 ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {formatarMoeda(metrics?.transacoes.saldo || 0)}
          </p>
          <p className="text-sm text-gray-400">Saldo Total</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-500" />
            </div>
            <div className="flex items-center gap-2">
              <MetricTooltip
                title="Meta Mais Solicitada"
                description="Tipo de meta mais criada pelos usuários no período. Exemplos: Reserva Financeira, Meta de Vendas, Pagamento de Contas, etc."
              />
              <span className="text-xs text-gray-400">Ranking</span>
            </div>
          </div>
          {tipoMetaMaisSolicitado ? (
            <>
              <p className="text-2xl font-bold text-white mb-1">{tipoMetaMaisSolicitado.label}</p>
              <p className="text-sm text-gray-400">Meta mais solicitada</p>
              <div className="mt-3 pt-3 border-t border-gray-800">
                <p className="text-xs text-gray-500">{tipoMetaMaisSolicitado.quantidade} metas criadas</p>
              </div>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-gray-400 mb-1">-</p>
              <p className="text-sm text-gray-400">Nenhuma meta</p>
            </>
          )}
        </div>
      </div>

      {/* Novas Métricas: Solicitações Ativas, Visualização de Painel e Frequência de Metas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Solicitações Ativas */}
        {loadingActiveRequests ? (
          <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/30 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-cyan-400 animate-pulse" />
              Solicitações Ativas
              <MetricTooltip
                title="Solicitações Ativas"
                description="Conta quantas vezes os usuários pediram ajuda por conta própria. COMO FUNCIONA: (1) Sistema busca mensagens que o usuário enviou contendo as palavras: 'resumo', 'ajuda' ou 'suporte'; (2) Separa cada pedido por tipo; (3) Identifica o grupo experimental de cada pessoa. RESULTADO: Total de pedidos, quantos foram de resumo/ajuda/suporte, e quantas pessoas únicas pediram. IMPORTANTE: Mede quando a pessoa tomou INICIATIVA sozinha, sem ter recebido nenhum lembrete antes. Ideal para avaliar o grupo controle."
              />
            </h2>
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            </div>
          </div>
        ) : activeRequests ? (
          <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/30 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-cyan-400" />
              Solicitações Ativas
              <MetricTooltip
                title="Solicitações Ativas"
                description="Conta quantas vezes os usuários pediram ajuda por conta própria. COMO FUNCIONA: (1) Sistema busca mensagens que o usuário enviou contendo as palavras: 'resumo', 'ajuda' ou 'suporte'; (2) Separa cada pedido por tipo; (3) Identifica o grupo experimental de cada pessoa. RESULTADO: Total de pedidos, quantos foram de resumo/ajuda/suporte, e quantas pessoas únicas pediram. IMPORTANTE: Mede quando a pessoa tomou INICIATIVA sozinha, sem ter recebido nenhum lembrete antes. Ideal para avaliar o grupo controle."
              />
            </h2>
            <p className="text-4xl font-bold text-cyan-400 mb-4">{activeRequests.total_active_requests}</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Resumos:</span>
                <span className="text-cyan-300 font-semibold">{activeRequests.requests_by_type.resumo}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Ajuda:</span>
                <span className="text-cyan-300 font-semibold">{activeRequests.requests_by_type.ajuda}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Suporte:</span>
                <span className="text-cyan-300 font-semibold">{activeRequests.requests_by_type.suporte}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-cyan-500/20">
                <span className="text-gray-300">Usuários únicos:</span>
                <span className="text-white font-bold">{activeRequests.unique_users}</span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Visualização de Painel */}
        {loadingPanelViews ? (
          <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 border border-indigo-500/30 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-400 animate-pulse" />
              Visualização de Painel
              <MetricTooltip
                title="Visualização de Painel"
                description="Conta quantas vezes os usuários pediram para ver o resumo financeiro, e como pediram. COMO FUNCIONA: (1) Sistema busca quando as pessoas pediram resumo de duas formas: clicando no botão 'Ver resumo semanal' OU escrevendo uma mensagem pedindo o resumo; (2) Separa em duas categorias: via botão ou via mensagem escrita; (3) Identifica o grupo experimental. RESULTADO: Total de visualizações, quantas foram via botão, quantas via mensagem escrita, e quantas pessoas únicas. INTERPRETAÇÃO: Via botão = pessoa viu o lembrete e clicou. Via mensagem = pessoa pediu por conta própria (típico do grupo controle)."
              />
            </h2>
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
            </div>
          </div>
        ) : panelViews ? (
          <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 border border-indigo-500/30 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-400" />
              Visualização de Painel
              <MetricTooltip
                title="Visualização de Painel"
                description="Conta quantas vezes os usuários pediram para ver o resumo financeiro, e como pediram. COMO FUNCIONA: (1) Sistema busca quando as pessoas pediram resumo de duas formas: clicando no botão 'Ver resumo semanal' OU escrevendo uma mensagem pedindo o resumo; (2) Separa em duas categorias: via botão ou via mensagem escrita; (3) Identifica o grupo experimental. RESULTADO: Total de visualizações, quantas foram via botão, quantas via mensagem escrita, e quantas pessoas únicas. INTERPRETAÇÃO: Via botão = pessoa viu o lembrete e clicou. Via mensagem = pessoa pediu por conta própria (típico do grupo controle)."
              />
            </h2>
            <p className="text-4xl font-bold text-indigo-400 mb-4">{panelViews.total_panel_views}</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Via Botão:</span>
                <span className="text-indigo-300 font-semibold">{panelViews.via_button}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Pedido Direto:</span>
                <span className="text-indigo-300 font-semibold">{panelViews.via_direct_request}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-indigo-500/20">
                <span className="text-gray-300">Usuários únicos:</span>
                <span className="text-white font-bold">{panelViews.unique_users}</span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Frequência de Metas */}
        {loadingGoalsFrequency ? (
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/30 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
              Frequência de Metas
              <MetricTooltip
                title="Frequência de Metas"
                description="Conta quantas vezes os usuários criaram metas e responderam se conseguiram cumprir. COMO FUNCIONA: (1) REGISTRO: Sistema conta quando aparece a confirmação 'Meta registrada com sucesso'; (2) CUMPRIMENTO: Conta quando a pessoa clica em 'Sim, registrar próxima' (meta cumprida) ou 'Não, registrar próxima' (não cumprida); (3) Calcula taxa de cumprimento = metas cumpridas dividido por total de respostas × 100. RESULTADO: Total de metas criadas, quantas foram cumpridas, quantas não foram, taxa de cumprimento em %, e quantas pessoas únicas. Mostra se as pessoas estão criando o hábito de definir e acompanhar suas metas financeiras."
              />
            </h2>
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
            </div>
          </div>
        ) : goalsFrequency ? (
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/30 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Frequência de Metas
              <MetricTooltip
                title="Frequência de Metas"
                description="Conta quantas vezes os usuários criaram metas e responderam se conseguiram cumprir. COMO FUNCIONA: (1) REGISTRO: Sistema conta quando aparece a confirmação 'Meta registrada com sucesso'; (2) CUMPRIMENTO: Conta quando a pessoa clica em 'Sim, registrar próxima' (meta cumprida) ou 'Não, registrar próxima' (não cumprida); (3) Calcula taxa de cumprimento = metas cumpridas dividido por total de respostas × 100. RESULTADO: Total de metas criadas, quantas foram cumpridas, quantas não foram, taxa de cumprimento em %, e quantas pessoas únicas. Mostra se as pessoas estão criando o hábito de definir e acompanhar suas metas financeiras."
              />
            </h2>
            <p className="text-4xl font-bold text-emerald-400 mb-4">{goalsFrequency.total_goals_registered}</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Cumpridas:</span>
                <span className="text-green-400 font-semibold">{goalsFrequency.total_goals_completed}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Não Cumpridas:</span>
                <span className="text-red-400 font-semibold">{goalsFrequency.total_goals_not_completed}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-emerald-500/20">
                <span className="text-gray-300">Taxa de Cumprimento:</span>
                <span className="text-white font-bold">{goalsFrequency.completion_rate_percent.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Usuários únicos:</span>
                <span className="text-white font-semibold">{goalsFrequency.unique_users}</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {metrics?.engagementStats && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-cyan-500" />
            Engajamento de Conversas
            <MetricTooltip
              title="Engajamento de Conversas"
              description="Mostra o quanto os usuários estão conversando com o chatbot. Alto (mais de 2 mensagens): usuário está bem envolvido e responde bastante. Médio (1 ou 2 mensagens): usuário responde algumas vezes. Baixo (nenhuma mensagem): usuário não está respondendo."
            />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <MessageCircle className="w-5 h-5 text-cyan-400" />
                <span className="text-sm text-gray-400">Total de Chats</span>
              </div>
              <p className="text-3xl font-bold text-white">{metrics.engagementStats.summary.total_chats}</p>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <ThumbsUp className="w-5 h-5 text-green-400" />
                <span className="text-sm text-gray-400">Alto Engajamento</span>
              </div>
              <p className="text-3xl font-bold text-green-400">{metrics.engagementStats.summary.high_engagement.count}</p>
              <p className="text-xs text-gray-500 mt-1">{metrics.engagementStats.summary.high_engagement.percentage}%</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Minus className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-gray-400">Médio Engajamento</span>
              </div>
              <p className="text-3xl font-bold text-yellow-400">{metrics.engagementStats.summary.mid_engagement?.count || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{metrics.engagementStats.summary.mid_engagement?.percentage || '0'}%</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <ThumbsDown className="w-5 h-5 text-orange-400" />
                <span className="text-sm text-gray-400">Baixo Engajamento</span>
              </div>
              <p className="text-3xl font-bold text-orange-400">{metrics.engagementStats.summary.low_engagement.count}</p>
              <p className="text-xs text-gray-500 mt-1">{metrics.engagementStats.summary.low_engagement.percentage}%</p>
            </div>
          </div>

          {metrics.engagementStats.by_tag.length > 0 && (
            <>
              <h3 className="text-lg font-semibold text-white mb-4">Por Grupo Experimental</h3>
              <div className="space-y-3">
                {metrics.engagementStats.by_tag.map((tag) => (
                  <div key={tag.tag_id} className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.tag_color }}
                        />
                        <span className="font-semibold text-white">{tag.tag_name}</span>
                      </div>
                      <span className="text-sm text-gray-400">{tag.total_chats} chats</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <ThumbsUp className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-gray-400">Alto</span>
                        </div>
                        <p className="text-xl font-bold text-green-400">
                          {tag.high_engagement.count} <span className="text-sm text-gray-500">({tag.high_engagement.percentage}%)</span>
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Minus className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm text-gray-400">Médio</span>
                        </div>
                        <p className="text-xl font-bold text-yellow-400">
                          {tag.mid_engagement?.count || 0} <span className="text-sm text-gray-500">({tag.mid_engagement?.percentage || '0'}%)</span>
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <ThumbsDown className="w-4 h-4 text-orange-400" />
                          <span className="text-sm text-gray-400">Baixo</span>
                        </div>
                        <p className="text-xl font-bold text-orange-400">
                          {tag.low_engagement.count} <span className="text-sm text-gray-500">({tag.low_engagement.percentage}%)</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loadingGoalsLatency && !goalsTemplateLatency ? (
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border border-purple-500/30 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400 animate-pulse" />
              Tempo de Resposta - Acompanhamento de Metas
              <MetricTooltip
                title="Tempo de Resposta - Templates de Metas"
                description="Mede quanto tempo os usuários levam para responder às mensagens sobre acompanhamento de metas. COMO FUNCIONA: (1) Sistema identifica quando enviou mensagens perguntando sobre metas (exemplos: 'novo_acompahamentometas_formal', 'meta_grupo_padrao'); (2) Para cada mensagem, busca a primeira resposta que o usuário enviou; (3) Separa por grupo: Grupo 2 (mensagens formais) vs Grupo 3 (mensagens informais). RESULTADO: Total de mensagens enviadas, quantas pessoas responderam, tempo médio de resposta, tempo mínimo e máximo. Mostra qual mensagem específica foi enviada e o grupo experimental de cada pessoa."
              />
            </h2>
            <div className="flex flex-col items-center justify-center h-32 space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
              <p className="text-gray-400 text-sm text-center">
                Carregando... Esta métrica pode demorar um pouco pois analisa mensagens específicas de WhatsApp
              </p>
            </div>
          </div>
        ) : errorGoalsLatency ? (
          <div className="bg-gradient-to-br from-red-500/10 to-orange-600/10 border border-red-500/30 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-red-400" />
              Tempo de Resposta - Acompanhamento de Metas
              <MetricTooltip
                title="Tempo de Resposta - Templates de Metas"
                description="Mede quanto tempo os usuários levam para responder às mensagens sobre acompanhamento de metas. COMO FUNCIONA: (1) Sistema identifica quando enviou mensagens perguntando sobre metas (exemplos: 'novo_acompahamentometas_formal', 'meta_grupo_padrao'); (2) Para cada mensagem, busca a primeira resposta que o usuário enviou; (3) Separa por grupo: Grupo 2 (mensagens formais) vs Grupo 3 (mensagens informais). RESULTADO: Total de mensagens enviadas, quantas pessoas responderam, tempo médio de resposta, tempo mínimo e máximo. Mostra qual mensagem específica foi enviada e o grupo experimental de cada pessoa."
              />
            </h2>
            <div className="flex flex-col items-center justify-center h-32 space-y-3">
              <p className="text-red-400 text-sm text-center">
                Não foi possível carregar os dados. A busca demorou muito ou o serviço está indisponível. Tente novamente com um período menor.
              </p>
            </div>
          </div>
        ) : goalsTemplateLatency && goalsTemplateLatency.latency_metrics ? (
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border border-purple-500/30 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Tempo de Resposta - Acompanhamento de Metas
              <MetricTooltip
                title="Tempo de Resposta - Templates de Metas"
                description="Mede quanto tempo os usuários levam para responder às mensagens sobre acompanhamento de metas. COMO FUNCIONA: (1) Sistema identifica quando enviou mensagens perguntando sobre metas (exemplos: 'novo_acompahamentometas_formal', 'meta_grupo_padrao'); (2) Para cada mensagem, busca a primeira resposta que o usuário enviou; (3) Separa por grupo: Grupo 2 (mensagens formais) vs Grupo 3 (mensagens informais). RESULTADO: Total de mensagens enviadas, quantas pessoas responderam, tempo médio de resposta, tempo mínimo e máximo. Mostra qual mensagem específica foi enviada e o grupo experimental de cada pessoa."
              />
            </h2>
            <p className="text-gray-400 text-xs mb-4">
              Tempo após enviar templates de WhatsApp sobre check-in de metas
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="text-center bg-gray-900/50 rounded-lg p-3">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <p className="text-gray-400 text-xs">Total Respostas</p>
                  <MetricTooltip
                    title="Total de Respostas"
                    description="Quantas vezes as pessoas responderam aos templates de WhatsApp sobre acompanhamento de metas no período selecionado."
                  />
                </div>
                <p className="text-xl font-bold text-white">{goalsTemplateLatency.total_responses}</p>
              </div>
              <div className="text-center bg-gray-900/50 rounded-lg p-3">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <p className="text-gray-400 text-xs">Tempo Médio</p>
                  <MetricTooltip
                    title="Tempo Médio de Resposta"
                    description="Média de tempo (em minutos) que as pessoas levam para responder após receber o template de metas. É calculado somando o tempo entre o envio do template e a primeira resposta de cada pessoa, depois dividindo pelo total de respostas."
                  />
                </div>
                <p className="text-xl font-bold text-green-400">
                  {goalsTemplateLatency.latency_metrics.average_minutes.toFixed(1)}min
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {loadingResponseLatency && !responseLatency ? (
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 border border-blue-500/30 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400 animate-pulse" />
              Tempo de Resposta - Lembretes de Registro
              <MetricTooltip
                title="Tempo de Resposta - Lembretes de Registro"
                description="Mede quanto tempo os usuários levam para responder aos lembretes de registro financeiro. COMO FUNCIONA: (1) Sistema identifica quando enviou lembretes com 'Oi! Tudo bem? Faz um tempo que você não registra...'; (2) Para cada lembrete, busca a primeira mensagem que o usuário enviou depois; (3) Calcula quanto tempo passou entre o lembrete e a resposta. RESULTADO: Tempo médio, tempo mínimo, tempo máximo. Taxa de resposta = quantos responderam dividido por quantos receberam o lembrete × 100. Dados separados por grupo experimental."
              />
            </h2>
            <div className="flex flex-col items-center justify-center h-32 space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              <p className="text-gray-400 text-sm text-center">
                Carregando... Esta métrica demora mais pois busca por palavras-chave específicas nas mensagens
              </p>
            </div>
          </div>
        ) : errorResponseLatency ? (
          <div className="bg-gradient-to-br from-red-500/10 to-orange-600/10 border border-red-500/30 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-400" />
              Tempo de Resposta - Lembretes de Registro
              <MetricTooltip
                title="Tempo de Resposta - Lembretes de Registro"
                description="Mede quanto tempo os usuários levam para responder aos lembretes de registro financeiro. COMO FUNCIONA: (1) Sistema identifica quando enviou lembretes com 'Oi! Tudo bem? Faz um tempo que você não registra...'; (2) Para cada lembrete, busca a primeira mensagem que o usuário enviou depois; (3) Calcula quanto tempo passou entre o lembrete e a resposta. RESULTADO: Tempo médio, tempo mínimo, tempo máximo. Taxa de resposta = quantos responderam dividido por quantos receberam o lembrete × 100. Dados separados por grupo experimental."
              />
            </h2>
            <div className="flex flex-col items-center justify-center h-32 space-y-3">
              <p className="text-red-400 text-sm text-center">
                Não foi possível carregar os dados. A busca demorou muito ou o serviço está indisponível. Tente novamente com um período menor.
              </p>
            </div>
          </div>
        ) : responseLatency && responseLatency.latency_metrics ? (
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 border border-blue-500/30 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              Tempo de Resposta - Lembretes de Registro
              <MetricTooltip
                title="Tempo de Resposta - Lembretes de Registro"
                description="Mede quanto tempo os usuários levam para responder aos lembretes de registro financeiro. COMO FUNCIONA: (1) Sistema identifica quando enviou lembretes com 'Oi! Tudo bem? Faz um tempo que você não registra...'; (2) Para cada lembrete, busca a primeira mensagem que o usuário enviou depois; (3) Calcula quanto tempo passou entre o lembrete e a resposta. RESULTADO: Tempo médio, tempo mínimo, tempo máximo. Taxa de resposta = quantos responderam dividido por quantos receberam o lembrete × 100. Dados separados por grupo experimental."
              />
            </h2>
            <p className="text-gray-400 text-xs mb-4">
              Tempo após enviar lembretes automáticos de registro diário
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="text-center bg-gray-900/50 rounded-lg p-3">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <p className="text-gray-400 text-xs">Total Respostas</p>
                  <MetricTooltip
                    title="Total de Respostas"
                    description="Quantas vezes as pessoas responderam às mensagens de lembrete de registro (como 'Dá uma olhada nos seus registros') no período selecionado."
                  />
                </div>
                <p className="text-xl font-bold text-white">{responseLatency.total_responses}</p>
              </div>
              <div className="text-center bg-gray-900/50 rounded-lg p-3">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <p className="text-gray-400 text-xs">Tempo Médio</p>
                  <MetricTooltip
                    title="Tempo Médio de Resposta"
                    description="Média de tempo (em minutos) que as pessoas levam para responder após receber o lembrete de registro. É calculado somando o tempo entre o envio do lembrete e a primeira resposta de cada pessoa, depois dividindo pelo total de respostas."
                  />
                </div>
                <p className="text-xl font-bold text-green-400">
                  {responseLatency.latency_metrics.average_minutes.toFixed(1)}min
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {loadingKnowledgePillLatency && !knowledgePillLatency ? (
          <div className="bg-gradient-to-br from-amber-500/10 to-yellow-600/10 border border-amber-500/30 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400 animate-pulse" />
              Tempo de Resposta - Pílulas do Conhecimento
              <MetricTooltip
                title="Tempo de Resposta - Pílulas do Conhecimento"
                description="Mede quanto tempo os usuários levam para responder às dicas educacionais. COMO FUNCIONA: (1) Sistema identifica quando enviou pílulas educativas (exemplos: 'pilula_h13_formal', 'pilulah9_padrao'); (2) Para cada pílula, busca a primeira mensagem que o usuário enviou depois; (3) Separa por grupo: Grupo 2 (pílulas formais) vs Grupo 3 (pílulas informais). RESULTADO: Total de pílulas enviadas, quantas pessoas responderam, tempo médio de resposta, tempo mínimo e máximo. Mostra o interesse das pessoas no conteúdo educativo financeiro."
              />
            </h2>
            <div className="flex flex-col items-center justify-center h-32 space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
              <p className="text-gray-400 text-sm text-center">
                Carregando... Esta métrica pode demorar pois analisa mensagens de pílulas do conhecimento
              </p>
            </div>
          </div>
        ) : errorKnowledgePillLatency ? (
          <div className="bg-gradient-to-br from-red-500/10 to-orange-600/10 border border-red-500/30 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-red-400" />
              Tempo de Resposta - Pílulas do Conhecimento
              <MetricTooltip
                title="Tempo de Resposta - Pílulas do Conhecimento"
                description="Mede quanto tempo os usuários levam para responder às dicas educacionais. COMO FUNCIONA: (1) Sistema identifica quando enviou pílulas educativas (exemplos: 'pilula_h13_formal', 'pilulah9_padrao'); (2) Para cada pílula, busca a primeira mensagem que o usuário enviou depois; (3) Separa por grupo: Grupo 2 (pílulas formais) vs Grupo 3 (pílulas informais). RESULTADO: Total de pílulas enviadas, quantas pessoas responderam, tempo médio de resposta, tempo mínimo e máximo. Mostra o interesse das pessoas no conteúdo educativo financeiro."
              />
            </h2>
            <div className="flex flex-col items-center justify-center h-32 space-y-3">
              <p className="text-red-400 text-sm text-center">
                Não foi possível carregar os dados. A busca demorou muito ou o serviço está indisponível. Tente novamente com um período menor.
              </p>
            </div>
          </div>
        ) : knowledgePillLatency && knowledgePillLatency.latency_metrics ? (
          <div className="bg-gradient-to-br from-amber-500/10 to-yellow-600/10 border border-amber-500/30 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              Tempo de Resposta - Pílulas do Conhecimento
              <MetricTooltip
                title="Tempo de Resposta - Pílulas do Conhecimento"
                description="Mede quanto tempo os usuários levam para responder às dicas educacionais. COMO FUNCIONA: (1) Sistema identifica quando enviou pílulas educativas (exemplos: 'pilula_h13_formal', 'pilulah9_padrao'); (2) Para cada pílula, busca a primeira mensagem que o usuário enviou depois; (3) Separa por grupo: Grupo 2 (pílulas formais) vs Grupo 3 (pílulas informais). RESULTADO: Total de pílulas enviadas, quantas pessoas responderam, tempo médio de resposta, tempo mínimo e máximo. Mostra o interesse das pessoas no conteúdo educativo financeiro."
              />
            </h2>
            <p className="text-gray-400 text-xs mb-4">
              Tempo após enviar pílulas do conhecimento (conteúdo educativo)
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="text-center bg-gray-900/50 rounded-lg p-3">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <p className="text-gray-400 text-xs">Total Respostas</p>
                  <MetricTooltip
                    title="Total de Respostas"
                    description="Quantas vezes as pessoas responderam às pílulas do conhecimento enviadas no período selecionado."
                  />
                </div>
                <p className="text-xl font-bold text-white">{knowledgePillLatency.total_responses}</p>
              </div>
              <div className="text-center bg-gray-900/50 rounded-lg p-3">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <p className="text-gray-400 text-xs">Tempo Médio</p>
                  <MetricTooltip
                    title="Tempo Médio de Resposta"
                    description="Média de tempo (em minutos) que as pessoas levam para responder após receber uma pílula do conhecimento. É calculado somando o tempo entre o envio e a primeira resposta de cada pessoa, depois dividindo pelo total de respostas."
                  />
                </div>
                <p className="text-xl font-bold text-green-400">
                  {knowledgePillLatency.latency_metrics.average_minutes.toFixed(1)}min
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-bold text-white">Caixa Pessoal</h3>
              <MetricTooltip
                title="Caixa Pessoal"
                description="Transações financeiras de uso pessoal do usuário. Inclui receitas e despesas pessoais separadas do caixa de negócio."
              />
            </div>
            <span className="text-xs text-blue-300">
              {metrics?.transacoes.percentualPessoal.toFixed(1)}% dos registros
            </span>
          </div>
          <p
            className={`text-3xl font-bold mb-3 ${
              (metrics?.transacoes.pessoal.saldo || 0) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {formatarMoeda(metrics?.transacoes.pessoal.saldo || 0)}
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Receitas:</span>
              <span className="text-green-400">{formatarMoeda(metrics?.transacoes.pessoal.receitas || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Despesas:</span>
              <span className="text-red-400">{formatarMoeda(metrics?.transacoes.pessoal.despesas || 0)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold pt-2 border-t border-blue-500/20">
              <span className="text-gray-300">Transações:</span>
              <span className="text-blue-300">{metrics?.transacoes.pessoal.quantidade}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-bold text-white">Caixa Negócio</h3>
              <MetricTooltip
                title="Caixa Negócio"
                description="Transações financeiras relacionadas ao negócio/empresa do usuário. Inclui receitas e despesas empresariais separadas do caixa pessoal."
              />
            </div>
            <span className="text-xs text-purple-300">
              {metrics?.transacoes.percentualNegocio.toFixed(1)}% dos registros
            </span>
          </div>
          <p
            className={`text-3xl font-bold mb-3 ${
              (metrics?.transacoes.negocio.saldo || 0) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {formatarMoeda(metrics?.transacoes.negocio.saldo || 0)}
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Receitas:</span>
              <span className="text-green-400">{formatarMoeda(metrics?.transacoes.negocio.receitas || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Despesas:</span>
              <span className="text-red-400">{formatarMoeda(metrics?.transacoes.negocio.despesas || 0)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold pt-2 border-t border-purple-500/20">
              <span className="text-gray-300">Transações:</span>
              <span className="text-purple-300">{metrics?.transacoes.negocio.quantidade}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <PieChartIcon className="w-6 h-6 text-blue-500" />
            Grupos Experimentais
          </h2>
          {dadosGrupos.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosGrupos}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dadosGrupos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CORES_GRUPOS[index % CORES_GRUPOS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-8">Nenhum dado disponível</p>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-green-500" />
            Mensagens Recebidas por Tipo
          </h2>
          {dadosTiposEntrada.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosTiposEntrada}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="label"
                  stroke="#d1d5db"
                  tick={{ fill: '#d1d5db' }}
                  style={{ fontSize: '14px' }}
                />
                <YAxis
                  stroke="#d1d5db"
                  tick={{ fill: '#d1d5db' }}
                  style={{ fontSize: '14px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  labelStyle={{ color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="quantidade" fill="#8884d8" radius={[8, 8, 0, 0]}>
                  {dadosTiposEntrada.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-8">Nenhum dado disponível</p>
          )}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Target className="w-6 h-6 text-orange-500" />
          Tipos de Meta Mais Solicitados
        </h2>
        {dadosTiposMeta.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosTiposMeta}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="label"
                stroke="#d1d5db"
                tick={{ fill: '#d1d5db' }}
                style={{ fontSize: '12px' }}
                angle={-15}
                textAnchor="end"
                height={80}
              />
              <YAxis
                stroke="#d1d5db"
                tick={{ fill: '#d1d5db' }}
                style={{ fontSize: '14px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                labelStyle={{ color: '#fff' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: any, name: string) => {
                  const total = metrics?.metas.total || 0;
                  const percentual = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                  return [`${value} metas (${percentual}%)`, 'Quantidade'];
                }}
              />
              <Bar dataKey="quantidade" fill="#8884d8" radius={[8, 8, 0, 0]}>
                {dadosTiposMeta.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-center py-8">Nenhuma meta criada no período</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-500" />
            Metas
            <MetricTooltip
              title="Status de Metas"
              description="Acompanhamento das metas financeiras definidas. Cumpridas: atingiram o objetivo. Não Cumpridas: não atingiram na data limite. Pendentes: ainda dentro do prazo."
            />
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-white font-semibold">Cumpridas</p>
                  <p className="text-sm text-gray-400">{metrics?.metas.cumpridas} metas</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-green-500">{metrics?.metas.cumpridas}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-white font-semibold">Não Cumpridas</p>
                  <p className="text-sm text-gray-400">{metrics?.metas.naoCumpridas} metas</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-red-500">{metrics?.metas.naoCumpridas}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="text-white font-semibold">Pendentes</p>
                  <p className="text-sm text-gray-400">{metrics?.metas.pendentes} metas</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-400">{metrics?.metas.pendentes}</p>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Taxa de Cumprimento</p>
              <p className="text-3xl font-bold text-blue-400">
                {metrics?.metas.taxaCumprimento.toFixed(0)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-orange-500" />
            Detalhes de Mensagens Recebidas
          </h2>
          <div className="space-y-3">
            {dadosTiposEntrada.map((item) => {
              const iconeMap: Record<string, any> = {
                text: FileText,
                audio: Mic,
                image: ImageIcon,
                video: Video,
                document: Receipt,
              };
              const Icon = iconeMap[item.tipo];
              const percentual =
                metrics?.mensagens && metrics.mensagens.total > 0
                  ? (item.quantidade / metrics.mensagens.total) * 100
                  : 0;

              return (
                <div key={item.tipo} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {Icon && <Icon className="w-6 h-6" style={{ color: item.fill }} />}
                    <div>
                      <p className="text-white font-medium">{item.label}</p>
                      <p className="text-sm text-gray-400">{percentual.toFixed(1)}% do total</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-white">{item.quantidade}</p>
                </div>
              );
            })}
            {dadosTiposEntrada.length === 0 && (
              <p className="text-gray-400 text-center py-8">Nenhuma mensagem no período</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
