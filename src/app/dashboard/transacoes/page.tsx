'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Search,
  Filter,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  Wallet,
  Briefcase,
  Download,
} from 'lucide-react';

interface Transacao {
  id: number;
  tipo: 'receita' | 'despesa';
  tipo_caixa: 'pessoal' | 'negocio';
  valor: number;
  descricao?: string;
  data_transacao: string;
  tipo_entrada: string;
  arquivo_url?: string;
  usuario: { id: number; nome?: string };
  categoria: { id: number; nome: string };
}

interface Categoria {
  id: number;
  nome: string;
  tipo: string;
}

export default function TransacoesPage() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroCaixa, setFiltroCaixa] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [busca, setBusca] = useState('');

  const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'hkjsaDFSkjSDF39847sfkjdWr23';

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [resTransacoes, resCategorias] = await Promise.all([
        fetch('/api/v1/transacoes', { headers: { 'x-api-key': API_KEY } }),
        fetch('/api/v1/categorias', { headers: { 'x-api-key': API_KEY } }),
      ]);

      const [dataTransacoes, dataCategorias] = await Promise.all([
        resTransacoes.json(),
        resCategorias.json(),
      ]);

      if (dataTransacoes.success) setTransacoes(dataTransacoes.data);
      if (dataCategorias.success) setCategorias(dataCategorias.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const transacoesFiltradas = transacoes.filter((t) => {
    const matchTipo = filtroTipo === 'todos' || t.tipo === filtroTipo;
    const matchCaixa = filtroCaixa === 'todos' || t.tipo_caixa === filtroCaixa;
    const matchCategoria =
      filtroCategoria === 'todos' || t.categoria.id.toString() === filtroCategoria;
    const matchBusca =
      busca === '' ||
      t.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
      t.categoria.nome.toLowerCase().includes(busca.toLowerCase()) ||
      t.usuario.nome?.toLowerCase().includes(busca.toLowerCase());

    return matchTipo && matchCaixa && matchCategoria && matchBusca;
  });

  const receitas = transacoesFiltradas.filter((t) => t.tipo === 'receita');
  const despesas = transacoesFiltradas.filter((t) => t.tipo === 'despesa');

  const totalReceitas = receitas.reduce((sum, t) => sum + Number(t.valor), 0);
  const totalDespesas = despesas.reduce((sum, t) => sum + Number(t.valor), 0);
  const saldo = totalReceitas - totalDespesas;

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const formatarData = (data: string) => {
    const dataSemHora = data.split('T')[0];
    return new Date(dataSemHora + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const exportarTransacoes = async () => {
    try {
      const response = await fetch('/api/v1/transacoes/exportar', {
        headers: { 'x-api-key': API_KEY },
      });

      if (!response.ok) {
        throw new Error('Erro ao exportar transações');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transacoes-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao exportar transações:', error);
      alert('Erro ao exportar transações. Tente novamente.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <TrendingUp className="w-8 h-8" />
          Transações
        </h1>
        <p className="text-gray-400">Todas as transações financeiras do sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Transações</span>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-white">{transacoesFiltradas.length}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Receitas</span>
            <ArrowUpCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-500">{formatarMoeda(totalReceitas)}</p>
          <p className="text-xs text-gray-500 mt-1">{receitas.length} lançamentos</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Despesas</span>
            <ArrowDownCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-500">{formatarMoeda(totalDespesas)}</p>
          <p className="text-xs text-gray-500 mt-1">{despesas.length} lançamentos</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Saldo</span>
            <Wallet className={`w-5 h-5 ${saldo >= 0 ? 'text-purple-500' : 'text-orange-500'}`} />
          </div>
          <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatarMoeda(saldo)}
          </p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por descrição, categoria ou usuário..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-11 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={exportarTransacoes}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
              >
                <option value="todos">Todos os tipos</option>
                <option value="receita">Receitas</option>
                <option value="despesa">Despesas</option>
              </select>
            </div>

            <select
              value={filtroCaixa}
              onChange={(e) => setFiltroCaixa(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
            >
              <option value="todos">Todos os caixas</option>
              <option value="pessoal">Pessoal</option>
              <option value="negocio">Negócio</option>
            </select>

            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
            >
              <option value="todos">Todas as categorias</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Carregando transações...</p>
          </div>
        ) : transacoesFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Nenhuma transação encontrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transacoesFiltradas.map((transacao) => (
              <div
                key={transacao.id}
                className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        transacao.tipo === 'receita'
                          ? 'bg-green-500/10'
                          : 'bg-red-500/10'
                      }`}
                    >
                      {transacao.tipo === 'receita' ? (
                        <ArrowUpCircle className="w-6 h-6 text-green-500" />
                      ) : (
                        <ArrowDownCircle className="w-6 h-6 text-red-500" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            transacao.tipo === 'receita'
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-red-500/20 text-red-300'
                          }`}
                        >
                          {transacao.tipo}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            transacao.tipo_caixa === 'pessoal'
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-purple-500/20 text-purple-300'
                          }`}
                        >
                          {transacao.tipo_caixa === 'pessoal' ? (
                            <span className="flex items-center gap-1">
                              <Wallet className="w-3 h-3" />
                              Pessoal
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3 h-3" />
                              Negócio
                            </span>
                          )}
                        </span>
                        <span className="px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300">
                          {transacao.categoria.nome}
                        </span>
                      </div>

                      <p className="text-white font-medium mb-1">
                        {transacao.descricao || 'Sem descrição'}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatarData(transacao.data_transacao)}
                        </span>
                        <span>
                          {transacao.usuario.nome || `Usuário #${transacao.usuario.id}`}
                        </span>
                        {transacao.tipo_entrada !== 'texto' && (
                          <span className="px-2 py-0.5 bg-gray-700 rounded text-xs">
                            {transacao.tipo_entrada}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-2xl font-bold ${
                        transacao.tipo === 'receita' ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {transacao.tipo === 'receita' ? '+' : '-'}
                      {formatarMoeda(Number(transacao.valor))}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">ID: {transacao.id}</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-4 text-sm text-gray-400 text-center">
              Mostrando {transacoesFiltradas.length} de {transacoes.length} transações
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
