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
  const [loading, setLoading] = useState(true);
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
  }, [calcularPeriodo]);

  const handlePeriodoChange = (tipo: PeriodoRapido) => {
    setPeriodoSelecionado(tipo);
    if (tipo !== 'custom') {
      calcularPeriodo(tipo);
    }
  };

  const carregarDados = useCallback(async () => {
    if (!dataInicio || !dataFim) return;

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

      if (AGENT_API_URL) {
        const apiParams = new URLSearchParams({
          startDate: dataInicio,
          endDate: dataFim,
        });

        promises.push(
          fetch(`${AGENT_API_URL}/public/agent-metrics/response-latency?${apiParams}`).catch(() => null),
          fetch(`${AGENT_API_URL}/public/agent-metrics/goals-template-latency?${apiParams}`).catch(() => null)
        );
      }

      const results = await Promise.all(promises);

      const [latenciasRes, estatisticasRes, responseLatencyRes, goalsTemplateLatencyRes] = results;

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

      if (responseLatencyRes && responseLatencyRes.ok) {
        const responseLatencyData = await responseLatencyRes.json();
        if (responseLatencyData.success) {
          setResponseLatency(responseLatencyData.data);
        }
      } else {
        setResponseLatency(null);
      }

      if (goalsTemplateLatencyRes && goalsTemplateLatencyRes.ok) {
        const goalsTemplateLatencyData = await goalsTemplateLatencyRes.json();
        if (goalsTemplateLatencyData.success) {
          setGoalsTemplateLatency(goalsTemplateLatencyData.data);
        }
      } else {
        setGoalsTemplateLatency(null);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [usuarioFiltro, dataInicio, dataFim, AGENT_API_URL]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Carregando latências...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Latências</h1>
        <p className="text-gray-400">
          Tempo de resposta entre lembretes e respostas dos usuários
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
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
      </div>

      {!AGENT_API_URL && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <p className="text-yellow-400 text-sm">
            AGENT_API_URL não configurada. As métricas de latência da API externa não serão exibidas.
          </p>
        </div>
      )}

      {AGENT_API_URL && !responseLatency && !goalsTemplateLatency && !loading && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <p className="text-blue-400 text-sm">
            Nenhuma métrica de latência disponível para o período selecionado.
          </p>
        </div>
      )}

      {responseLatency && responseLatency.latency_metrics && (
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
                {new Date(responseLatency.period.start_date).toLocaleDateString('pt-BR')}
              </p>
              <p className="text-sm font-semibold text-white">
                até {new Date(responseLatency.period.end_date).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      )}

      {goalsTemplateLatency && goalsTemplateLatency.latency_metrics && (
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


    </div>
  );
}
