'use client';

import { useState, useEffect } from 'react';
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Calendar,
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

export default function LatenciasPage() {
  const [latencias, setLatencias] = useState<Latencia[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [usuarioFiltro, setUsuarioFiltro] = useState('');

  useEffect(() => {
    carregarDados();
  }, [usuarioFiltro]);

  const carregarDados = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (usuarioFiltro) {
        params.append('usuario_id', usuarioFiltro);
      }

      const [latenciasRes, estatisticasRes] = await Promise.all([
        fetch(`/api/v1/latencias?${params}`),
        fetch(`/api/v1/latencias/estatisticas?${params}`),
      ]);

      const latenciasData = await latenciasRes.json();
      const estatisticasData = await estatisticasRes.json();

      if (latenciasData.success) {
        setLatencias(latenciasData.data);
      }

      if (estatisticasData.success) {
        setEstatisticas(estatisticasData.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-gray-400 text-sm mb-1">Total de Registros</p>
          <p className="text-3xl font-bold text-white">{estatisticas?.total || 0}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-gray-400 text-sm mb-1">Latência Média</p>
          <p className="text-3xl font-bold text-white">
            {formatarTempo(estatisticas?.latencia_media || 0)}
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-8 h-8 text-cyan-500" />
          </div>
          <p className="text-gray-400 text-sm mb-1">Latência Mínima</p>
          <p className="text-3xl font-bold text-white">
            {formatarTempo(estatisticas?.latencia_minima || 0)}
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-gray-400 text-sm mb-1">Latência Máxima</p>
          <p className="text-3xl font-bold text-white">
            {formatarTempo(estatisticas?.latencia_maxima || 0)}
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-gray-400 text-sm mb-1">Taxa de Resposta</p>
          <p className="text-3xl font-bold text-white">
            {estatisticas?.taxa_resposta.toFixed(1) || 0}%
          </p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-500" />
          Histórico de Latências
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-4 px-4 text-gray-400 font-semibold">Usuário</th>
                <th className="text-left py-4 px-4 text-gray-400 font-semibold">Tipo</th>
                <th className="text-left py-4 px-4 text-gray-400 font-semibold">Lembrete</th>
                <th className="text-left py-4 px-4 text-gray-400 font-semibold">Resposta</th>
                <th className="text-left py-4 px-4 text-gray-400 font-semibold">Latência</th>
                <th className="text-left py-4 px-4 text-gray-400 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {latencias.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    Nenhuma latência registrada
                  </td>
                </tr>
              ) : (
                latencias.map((latencia) => (
                  <tr key={latencia.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-4 px-4">
                      <p className="text-white font-medium">{latencia.usuario.nome}</p>
                      <p className="text-sm text-gray-400">Agent {latencia.agent_id}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-300">
                        {latencia.tipo_lembrete || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-300">
                      {formatarData(latencia.momento_lembrete)}
                    </td>
                    <td className="py-4 px-4 text-gray-300">
                      {formatarData(latencia.momento_resposta)}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`font-semibold ${
                          latencia.latencia_segundos < 300
                            ? 'text-green-500'
                            : latencia.latencia_segundos < 900
                            ? 'text-yellow-500'
                            : 'text-red-500'
                        }`}
                      >
                        {formatarTempo(latencia.latencia_segundos)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {latencia.respondeu ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-500">
                          Respondeu
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-500">
                          Não Respondeu
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
