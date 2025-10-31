'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  TrendingUp,
  Target,
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  DollarSign,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Usuario {
  id: number;
  status: string;
  grupo_experimental?: string;
}

interface Transacao {
  tipo: 'receita' | 'despesa';
  valor: number;
}

interface DashboardStats {
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
  };
  metas: {
    total: number;
    cumpridas: number;
    naoCumpridas: number;
    taxaCumprimento: number;
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'hkjsaDFSkjSDF39847sfkjdWr23';

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  const carregarEstatisticas = async () => {
    try {
      const [resUsuarios, resTransacoes] = await Promise.all([
        fetch('/api/v1/usuarios', { headers: { 'x-api-key': API_KEY } }),
        fetch('/api/v1/transacoes', { headers: { 'x-api-key': API_KEY } }),
      ]);

      const [dataUsuarios, dataTransacoes] = await Promise.all([
        resUsuarios.json(),
        resTransacoes.json(),
      ]);

      let metasData = { total: 0, cumpridas: 0, naoCumpridas: 0, taxaCumprimento: 0 };

      if (dataUsuarios.success && dataUsuarios.data.length > 0) {
        const primeiroUsuario = dataUsuarios.data[0];
        try {
          const resMetas = await fetch(
            `/api/v1/metas/estatisticas?usuario_id=${primeiroUsuario.id}`,
            { headers: { 'x-api-key': API_KEY } }
          );
          const dataMetas = await resMetas.json();
          if (dataMetas.success) {
            metasData = {
              total: dataMetas.data.total,
              cumpridas: dataMetas.data.cumpridas,
              naoCumpridas: dataMetas.data.nao_cumpridas,
              taxaCumprimento: dataMetas.data.taxa_cumprimento,
            };
          }
        } catch (error) {
          console.log('Sem metas ainda');
        }
      }

      const usuarios = dataUsuarios.success ? dataUsuarios.data : [];
      const transacoes = dataTransacoes.success ? dataTransacoes.data : [];

      const porGrupo: Record<string, number> = {};
      usuarios.forEach((u: Usuario) => {
        const grupo = u.grupo_experimental || 'controle';
        porGrupo[grupo] = (porGrupo[grupo] || 0) + 1;
      });

      const receitas = transacoes.filter((t: Transacao) => t.tipo === 'receita');
      const despesas = transacoes.filter((t: Transacao) => t.tipo === 'despesa');

      const totalReceitas = receitas.reduce((sum: number, t: Transacao) => sum + Number(t.valor), 0);
      const totalDespesas = despesas.reduce((sum: number, t: Transacao) => sum + Number(t.valor), 0);

      setStats({
        usuarios: {
          total: usuarios.length,
          ativos: usuarios.filter((u: Usuario) => u.status === 'active').length,
          porGrupo,
        },
        transacoes: {
          total: transacoes.length,
          receitas: receitas.length,
          despesas: despesas.length,
          saldo: totalReceitas - totalDespesas,
          totalReceitas,
          totalDespesas,
        },
        metas: metasData,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Carregando estatísticas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Visão geral do sistema Impact Hub</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-xs text-gray-400">Total</span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{stats?.usuarios.total}</p>
          <p className="text-sm text-gray-400">Usuários Cadastrados</p>
          <div className="mt-3 pt-3 border-t border-gray-800">
            <p className="text-xs text-gray-500">{stats?.usuarios.ativos} ativos</p>
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
            {formatarMoeda(stats?.transacoes.totalReceitas || 0)}
          </p>
          <p className="text-sm text-gray-400">{stats?.transacoes.receitas} lançamentos</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
              <ArrowDownCircle className="w-6 h-6 text-red-500" />
            </div>
            <span className="text-xs text-gray-400">Despesas</span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            {formatarMoeda(stats?.transacoes.totalDespesas || 0)}
          </p>
          <p className="text-sm text-gray-400">{stats?.transacoes.despesas} lançamentos</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${(stats?.transacoes.saldo || 0) >= 0
              ? 'bg-purple-500/10'
              : 'bg-orange-500/10'
              }`}>
              <Wallet className={`w-6 h-6 ${(stats?.transacoes.saldo || 0) >= 0
                ? 'text-purple-500'
                : 'text-orange-500'
                }`} />
            </div>
            <span className="text-xs text-gray-400">Saldo</span>
          </div>
          <p className={`text-3xl font-bold mb-1 ${(stats?.transacoes.saldo || 0) >= 0
            ? 'text-green-500'
            : 'text-red-500'
            }`}>
            {formatarMoeda(stats?.transacoes.saldo || 0)}
          </p>
          <p className="text-sm text-gray-400">Saldo Total</p>
        </div>
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
                  <p className="text-sm text-gray-400">{stats?.metas.cumpridas} metas</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-green-500">{stats?.metas.cumpridas}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-white font-semibold">Não Cumpridas</p>
                  <p className="text-sm text-gray-400">{stats?.metas.naoCumpridas} metas</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-red-500">{stats?.metas.naoCumpridas}</p>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Taxa de Cumprimento</p>
              <p className="text-3xl font-bold text-blue-400">
                {stats?.metas.taxaCumprimento.toFixed(0)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" />
            Grupos Experimentais
          </h2>
          <div className="space-y-3">
            {Object.entries(stats?.usuarios.porGrupo || {}).map(([grupo, quantidade]) => (
              <div key={grupo} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div>
                  <p className="text-white font-medium capitalize">{grupo}</p>
                  <p className="text-sm text-gray-400">
                    {((quantidade / (stats?.usuarios.total || 1)) * 100).toFixed(0)}% do total
                  </p>
                </div>
                <p className="text-2xl font-bold text-white">{quantidade}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div >
  );
}
