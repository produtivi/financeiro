'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Wallet,
  Briefcase,
  ArrowUpCircle,
  ArrowDownCircle,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';

interface Usuario {
  id: number;
  chat_id: number;
  agent_id: number;
  nome?: string;
  status: string;
  criado_em: string;
}

interface Transacao {
  id: number;
  tipo: 'receita' | 'despesa';
  tipo_caixa: 'pessoal' | 'negocio';
  valor: number;
  descricao?: string;
  data_transacao: string;
  tipo_entrada: string;
  categoria: { id: number; nome: string };
}

interface Meta {
  id: number;
  descricao: string;
  tipo_meta: string;
  data_inicio: string;
  data_fim: string;
  cumprida: boolean | null;
  respondido_em: string | null;
}

const TIPOS_META = {
  reserva_financeira: 'Reserva Financeira',
  controle_inventario: 'Controle de Inventário',
  meta_vendas: 'Meta de Vendas',
  pagamento_contas: 'Pagamento de Contas',
  outro: 'Outro',
};

export default function UsuarioDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<'transacoes' | 'metas'>('transacoes');

  const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'hkjsaDFSkjSDF39847sfkjdWr23';
  const usuarioId = resolvedParams.id;

  useEffect(() => {
    carregarDados();
  }, [usuarioId]);

  const carregarDados = async () => {
    try {
      const [resUsuario, resTransacoes, resMetas] = await Promise.all([
        fetch(`/api/v1/usuarios/${usuarioId}`, {
          headers: { 'x-api-key': API_KEY },
        }),
        fetch(`/api/v1/transacoes?usuario_id=${usuarioId}`, {
          headers: { 'x-api-key': API_KEY },
        }),
        fetch(`/api/v1/metas?usuario_id=${usuarioId}`, {
          headers: { 'x-api-key': API_KEY },
        }),
      ]);

      const [dataUsuario, dataTransacoes, dataMetas] = await Promise.all([
        resUsuario.json(),
        resTransacoes.json(),
        resMetas.json(),
      ]);

      if (dataUsuario.success) setUsuario(dataUsuario.data);
      if (dataTransacoes.success) setTransacoes(dataTransacoes.data);
      if (dataMetas.success) setMetas(dataMetas.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const receitas = transacoes.filter((t) => t.tipo === 'receita');
  const despesas = transacoes.filter((t) => t.tipo === 'despesa');
  const totalReceitas = receitas.reduce((sum, t) => sum + Number(t.valor), 0);
  const totalDespesas = despesas.reduce((sum, t) => sum + Number(t.valor), 0);
  const saldo = totalReceitas - totalDespesas;

  const receitasPessoal = receitas.filter((t) => t.tipo_caixa === 'pessoal');
  const receitasNegocio = receitas.filter((t) => t.tipo_caixa === 'negocio');
  const despesasPessoal = despesas.filter((t) => t.tipo_caixa === 'pessoal');
  const despesasNegocio = despesas.filter((t) => t.tipo_caixa === 'negocio');

  const metasCumpridas = metas.filter((m) => m.cumprida === true).length;
  const metasNaoCumpridas = metas.filter((m) => m.cumprida === false).length;
  const metasPendentes = metas.filter((m) => m.cumprida === null).length;
  const taxaCumprimento =
    metasCumpridas + metasNaoCumpridas > 0
      ? (metasCumpridas / (metasCumpridas + metasNaoCumpridas)) * 100
      : 0;

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const formatarData = (data: string) => {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const getGrupoColor = (grupo: string) => {
    switch (grupo) {
      case 'controle':
        return 'bg-gray-500/20 text-gray-300';
      case 'padrao':
        return 'bg-blue-500/20 text-blue-300';
      case 'acolhedor':
        return 'bg-purple-500/20 text-purple-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Carregando dados do usuário...</p>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Usuário não encontrado</p>
        <Link href="/dashboard/usuarios" className="text-blue-400 hover:underline mt-4 inline-block">
          Voltar para usuários
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/usuarios"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-1">
            {usuario.nome || `Usuário #${usuario.id}`}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-gray-400">Chat ID: {usuario.chat_id}</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                usuario.status === 'active'
                  ? 'bg-green-500/20 text-green-300'
                  : 'bg-red-500/20 text-red-300'
              }`}
            >
              {usuario.status === 'active' ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Transações</span>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-white">{transacoes.length}</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-500" />
            Caixa Pessoal
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Receitas</span>
              <span className="text-green-500 font-semibold">
                {formatarMoeda(receitasPessoal.reduce((s, t) => s + Number(t.valor), 0))}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Despesas</span>
              <span className="text-red-500 font-semibold">
                {formatarMoeda(despesasPessoal.reduce((s, t) => s + Number(t.valor), 0))}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-700 flex justify-between items-center">
              <span className="text-white font-medium">Saldo</span>
              <span className="text-white font-bold">
                {formatarMoeda(
                  receitasPessoal.reduce((s, t) => s + Number(t.valor), 0) -
                    despesasPessoal.reduce((s, t) => s + Number(t.valor), 0)
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-500" />
            Caixa Negócio
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Receitas</span>
              <span className="text-green-500 font-semibold">
                {formatarMoeda(receitasNegocio.reduce((s, t) => s + Number(t.valor), 0))}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Despesas</span>
              <span className="text-red-500 font-semibold">
                {formatarMoeda(despesasNegocio.reduce((s, t) => s + Number(t.valor), 0))}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-700 flex justify-between items-center">
              <span className="text-white font-medium">Saldo</span>
              <span className="text-white font-bold">
                {formatarMoeda(
                  receitasNegocio.reduce((s, t) => s + Number(t.valor), 0) -
                    despesasNegocio.reduce((s, t) => s + Number(t.valor), 0)
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-500" />
          Metas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">{metas.length}</p>
            <p className="text-gray-400 text-sm mt-1">Total</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-500">{metasCumpridas}</p>
            <p className="text-gray-400 text-sm mt-1">Cumpridas</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-500">{metasNaoCumpridas}</p>
            <p className="text-gray-400 text-sm mt-1">Não Cumpridas</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-500">{taxaCumprimento.toFixed(0)}%</p>
            <p className="text-gray-400 text-sm mt-1">Taxa de Sucesso</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setAbaAtiva('transacoes')}
            className={`flex-1 px-6 py-4 font-semibold transition-colors ${
              abaAtiva === 'transacoes'
                ? 'bg-gray-800 text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Transações ({transacoes.length})
          </button>
          <button
            onClick={() => setAbaAtiva('metas')}
            className={`flex-1 px-6 py-4 font-semibold transition-colors ${
              abaAtiva === 'metas'
                ? 'bg-gray-800 text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Metas ({metas.length})
          </button>
        </div>

        <div className="p-6">
          {abaAtiva === 'transacoes' ? (
            transacoes.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Nenhuma transação registrada</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transacoes.map((transacao) => (
                  <div
                    key={transacao.id}
                    className="bg-gray-800/50 border border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            transacao.tipo === 'receita' ? 'bg-green-500/10' : 'bg-red-500/10'
                          }`}
                        >
                          {transacao.tipo === 'receita' ? (
                            <ArrowUpCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <ArrowDownCircle className="w-5 h-5 text-red-500" />
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
                              {transacao.tipo_caixa === 'pessoal' ? 'Pessoal' : 'Negócio'}
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
                          className={`text-xl font-bold ${
                            transacao.tipo === 'receita' ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {transacao.tipo === 'receita' ? '+' : '-'}
                          {formatarMoeda(Number(transacao.valor))}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            metas.length === 0 ? (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Nenhuma meta registrada</p>
              </div>
            ) : (
              <div className="space-y-3">
                {metas.map((meta) => (
                  <div
                    key={meta.id}
                    className="bg-gray-800/50 border border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {meta.cumprida === null ? (
                          <Clock className="w-5 h-5 text-gray-400" />
                        ) : meta.cumprida ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {meta.cumprida === null ? (
                            <span className="px-3 py-1 bg-gray-500/20 text-gray-300 rounded-full text-xs font-medium">
                              Pendente
                            </span>
                          ) : meta.cumprida ? (
                            <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-medium">
                              Cumprida
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-medium">
                              Não Cumprida
                            </span>
                          )}
                          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-medium">
                            {TIPOS_META[meta.tipo_meta as keyof typeof TIPOS_META]}
                          </span>
                        </div>

                        <p className="text-white font-medium mb-2">{meta.descricao}</p>

                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatarData(meta.data_inicio)} - {formatarData(meta.data_fim)}
                          </span>
                          {meta.respondido_em && (
                            <span>
                              Respondido: {new Date(meta.respondido_em).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
