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
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

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
    low_engagement: {
      count: number;
      description: string;
      percentage: string;
    };
    total_chats: number;
  }>;
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

      const res = await fetch(`/api/v1/dashboard/metricas?${params}`);
      const data = await res.json();

      if (data.success) {
        setMetrics(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    } finally {
      setLoading(false);
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Período Rápido</label>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-xs text-gray-400">Total</span>
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
            <span className="text-xs text-gray-400">Receitas</span>
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
            <span className="text-xs text-gray-400">Despesas</span>
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
            <span className="text-xs text-gray-400">Saldo</span>
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
            <span className="text-xs text-gray-400">Ranking</span>
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

      {metrics?.engagementStats && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-cyan-500" />
            Engajamento de Conversas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                    <div className="grid grid-cols-2 gap-4">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-bold text-white">Caixa Pessoal</h3>
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
