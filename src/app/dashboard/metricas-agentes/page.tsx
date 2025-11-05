'use client';

import { useState, useEffect } from 'react';
import {
  MessageSquare,
  Calendar,
  TrendingUp,
  TrendingDown,
  FileText,
  Mic,
  Phone,
  Image as ImageIcon,
  BarChart3,
  Users,
  Wallet,
  Briefcase,
  Target,
  CheckCircle,
  XCircle,
  DollarSign,
  PieChart,
} from 'lucide-react';

interface Usuario {
  id: number;
  chat_id: number;
  agent_id: number;
  nome?: string;
}

interface Transacao {
  id: number;
  tipo: 'receita' | 'despesa';
  tipo_caixa: 'pessoal' | 'negocio';
  valor: number;
  data_transacao: string;
  categoria: { id: number; nome: string };
}

interface Meta {
  id: number;
  tipo_meta: string;
  cumprida: boolean | null;
  data_inicio: string;
  data_fim: string;
}

interface MetricasSummary {
  agent_id: number;
  period: {
    start_date: string;
    end_date: string;
  };
  total_inbound_messages: number;
  inbound_by_type: Record<string, number>;
}

interface MetricasDaily {
  agent_id: number;
  period: {
    start_date: string;
    end_date: string;
  };
  daily_breakdown: Array<{
    date: string;
    total_inbound: number;
    by_type: Record<string, number>;
  }>;
}

const TIPOS_META: Record<string, string> = {
  reserva_financeira: 'Reserva Financeira',
  controle_inventario: 'Controle de Inventário',
  meta_vendas: 'Meta de Vendas',
  pagamento_contas: 'Pagamento de Contas',
  outro: 'Outro',
};

export default function MetricasAgentesPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState('');
  const [metricas, setMetricas] = useState<MetricasSummary | null>(null);
  const [metricasDiarias, setMetricasDiarias] = useState<MetricasDaily | null>(null);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const AGENT_API_URL = process.env.NEXT_PUBLIC_AGENT_API_URL;

  useEffect(() => {
    carregarUsuarios();
    const hoje = new Date();
    const seteDiasAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
    setDataFim(hoje.toISOString().split('T')[0]);
    setDataInicio(seteDiasAtras.toISOString().split('T')[0]);
  }, []);

  const carregarUsuarios = async () => {
    try {
      const res = await fetch('/api/v1/usuarios');
      const data = await res.json();
      if (data.success) {
        setUsuarios(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const carregarDados = async () => {
    if (!usuarioSelecionado) return;

    const usuario = usuarios.find((u) => u.id.toString() === usuarioSelecionado);
    if (!usuario) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dataInicio) params.append('startDate', dataInicio);
      if (dataFim) params.append('endDate', dataFim);

      const [resSummary, resDaily, resTransacoes, resMetas] = await Promise.all([
        fetch(`${AGENT_API_URL}/public/agent-metrics/user/${usuario.chat_id}/summary?${params}`).catch(() => null),
        fetch(`${AGENT_API_URL}/public/agent-metrics/user/${usuario.chat_id}/daily?${params}`).catch(() => null),
        fetch(`/api/v1/transacoes?usuario_id=${usuario.id}`),
        fetch(`/api/v1/metas?usuario_id=${usuario.id}`),
      ]);

      const [dataSummary, dataDaily, dataTransacoes, dataMetas] = await Promise.all([
        resSummary && resSummary.ok ? resSummary.json() : { success: false },
        resDaily && resDaily.ok ? resDaily.json() : { success: false },
        resTransacoes.json(),
        resMetas.json(),
      ]);

      if (dataSummary.success) setMetricas(dataSummary.data);
      if (dataDaily.success) setMetricasDiarias(dataDaily.data);
      if (dataTransacoes.success) {
        const transacoesFiltradas = dataTransacoes.data.filter((t: Transacao) => {
          const dataT = new Date(t.data_transacao);
          const inicio = new Date(dataInicio);
          const fim = new Date(dataFim);
          return dataT >= inicio && dataT <= fim;
        });
        setTransacoes(transacoesFiltradas);
      }
      if (dataMetas.success) {
        const metasFiltradas = dataMetas.data.filter((m: Meta) => {
          const dataM = new Date(m.data_inicio);
          const inicio = new Date(dataInicio);
          const fim = new Date(dataFim);
          return dataM >= inicio && dataM <= fim;
        });
        setMetas(metasFiltradas);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (usuarioSelecionado && dataInicio && dataFim) {
      carregarDados();
    }
  }, [usuarioSelecionado, dataInicio, dataFim]);

  // Cálculos financeiros
  const transacoesPessoal = transacoes.filter((t) => t.tipo_caixa === 'pessoal');
  const transacoesNegocio = transacoes.filter((t) => t.tipo_caixa === 'negocio');

  const receitasPessoal = transacoesPessoal
    .filter((t) => t.tipo === 'receita')
    .reduce((sum, t) => sum + Number(t.valor), 0);
  const despesasPessoal = transacoesPessoal
    .filter((t) => t.tipo === 'despesa')
    .reduce((sum, t) => sum + Number(t.valor), 0);

  const receitasNegocio = transacoesNegocio
    .filter((t) => t.tipo === 'receita')
    .reduce((sum, t) => sum + Number(t.valor), 0);
  const despesasNegocio = transacoesNegocio
    .filter((t) => t.tipo === 'despesa')
    .reduce((sum, t) => sum + Number(t.valor), 0);

  const saldoPessoal = receitasPessoal - despesasPessoal;
  const saldoNegocio = receitasNegocio - despesasNegocio;
  const saldoTotal = saldoPessoal + saldoNegocio;

  const percentualPessoal =
    transacoes.length > 0 ? (transacoesPessoal.length / transacoes.length) * 100 : 0;
  const percentualNegocio =
    transacoes.length > 0 ? (transacoesNegocio.length / transacoes.length) * 100 : 0;

  // Métricas de metas
  const metasDefinidas = metas.length;
  const metasCumpridas = metas.filter((m) => m.cumprida === true).length;
  const metasNaoCumpridas = metas.filter((m) => m.cumprida === false).length;
  const metasPendentes = metas.filter((m) => m.cumprida === null).length;
  const taxaCumprimento =
    metasCumpridas + metasNaoCumpridas > 0
      ? (metasCumpridas / (metasCumpridas + metasNaoCumpridas)) * 100
      : 0;

  // Gastos por categoria
  const gastosPorCategoria = transacoes
    .filter((t) => t.tipo === 'despesa')
    .reduce((acc: Record<string, number>, t) => {
      const nome = t.categoria.nome;
      acc[nome] = (acc[nome] || 0) + Number(t.valor);
      return acc;
    }, {});

  const topCategorias = Object.entries(gastosPorCategoria)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Gastos por dia
  const gastosPorDia = transacoes.reduce((acc: Record<string, number>, t) => {
    if (t.tipo === 'despesa') {
      // Converter data ISO para YYYY-MM-DD
      const dataFormatada = t.data_transacao.split('T')[0];
      acc[dataFormatada] = (acc[dataFormatada] || 0) + Number(t.valor);
    }
    return acc;
  }, {});

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const formatarData = (data: string | undefined | null) => {
    try {
      if (!data) return 'Data não disponível';
      const dataLimpa = String(data).trim();
      const partes = dataLimpa.split('-');

      if (partes.length === 3) {
        const ano = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10);
        const dia = parseInt(partes[2], 10);

        if (isNaN(ano) || isNaN(mes) || isNaN(dia)) return dataLimpa;

        const date = new Date(ano, mes - 1, dia);
        if (isNaN(date.getTime())) return dataLimpa;

        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
        });
      }

      return dataLimpa;
    } catch {
      return String(data);
    }
  };

  const getTipoIcon = (tipo: string) => {
    const icons: Record<string, React.ReactElement> = {
      text: <MessageSquare className="w-5 h-5" />,
      document: <FileText className="w-5 h-5" />,
      audio: <Mic className="w-5 h-5" />,
      voice: <Phone className="w-5 h-5" />,
      image: <ImageIcon className="w-5 h-5" />,
    };
    return icons[tipo] || <MessageSquare className="w-5 h-5" />;
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      text: 'Texto',
      document: 'Documento',
      audio: 'Áudio',
      voice: 'Voz',
      image: 'Imagem',
    };
    return labels[tipo] || tipo;
  };

  const getTipoColor = (tipo: string) => {
    const colors: Record<string, string> = {
      text: 'text-blue-400',
      document: 'text-purple-400',
      audio: 'text-green-400',
      voice: 'text-yellow-400',
      image: 'text-pink-400',
    };
    return colors[tipo] || 'text-gray-400';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <BarChart3 className="w-8 h-8" />
          Métricas Completas
        </h1>
        <p className="text-gray-400">Análise completa de mensagens, finanças e metas</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Selecione o Usuário
            </label>
            <select
              value={usuarioSelecionado}
              onChange={(e) => setUsuarioSelecionado(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Selecione um usuário</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome || `Usuário #${u.id}`} (Agent ID: {u.agent_id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Data Início</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Data Fim</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-400">Carregando métricas...</p>
        </div>
      )}

      {!loading && usuarioSelecionado && metricas && (
        <>
          {/* Saldos e Segregação */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <Wallet className="w-8 h-8 text-blue-400" />
                <span className="text-xs text-blue-300">Caixa Pessoal</span>
              </div>
              <p className={`text-3xl font-bold ${saldoPessoal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatarMoeda(saldoPessoal)}
              </p>
              <div className="mt-3 pt-3 border-t border-blue-500/20 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Receitas:</span>
                  <span className="text-green-400">{formatarMoeda(receitasPessoal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Despesas:</span>
                  <span className="text-red-400">{formatarMoeda(despesasPessoal)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-gray-300">% dos registros:</span>
                  <span className="text-blue-300">{percentualPessoal.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <Briefcase className="w-8 h-8 text-purple-400" />
                <span className="text-xs text-purple-300">Caixa Negócio</span>
              </div>
              <p className={`text-3xl font-bold ${saldoNegocio >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatarMoeda(saldoNegocio)}
              </p>
              <div className="mt-3 pt-3 border-t border-purple-500/20 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Receitas:</span>
                  <span className="text-green-400">{formatarMoeda(receitasNegocio)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Despesas:</span>
                  <span className="text-red-400">{formatarMoeda(despesasNegocio)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-gray-300">% dos registros:</span>
                  <span className="text-purple-300">{percentualNegocio.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <DollarSign className="w-8 h-8 text-green-400" />
                <span className="text-xs text-green-300">Saldo Total</span>
              </div>
              <p className={`text-3xl font-bold ${saldoTotal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatarMoeda(saldoTotal)}
              </p>
              <div className="mt-3 pt-3 border-t border-green-500/20 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Receitas:</span>
                  <span className="text-green-400">
                    {formatarMoeda(receitasPessoal + receitasNegocio)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Despesas:</span>
                  <span className="text-red-400">
                    {formatarMoeda(despesasPessoal + despesasNegocio)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-gray-300">Transações:</span>
                  <span className="text-green-300">{transacoes.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Métricas de Metas */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-6 h-6 text-purple-400" />
              Metas no Período
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{metasDefinidas}</p>
                <p className="text-sm text-gray-400 mt-1">Definidas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-400">{metasCumpridas}</p>
                <p className="text-sm text-gray-400 mt-1">Cumpridas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-400">{metasNaoCumpridas}</p>
                <p className="text-sm text-gray-400 mt-1">Não Cumpridas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-400">{metasPendentes}</p>
                <p className="text-sm text-gray-400 mt-1">Pendentes</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-400">{taxaCumprimento.toFixed(0)}%</p>
                <p className="text-sm text-gray-400 mt-1">Taxa Sucesso</p>
              </div>
            </div>
          </div>

          {/* Top Categorias de Gastos */}
          {topCategorias.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <PieChart className="w-6 h-6 text-orange-400" />
                Top 5 Categorias de Gastos
              </h2>
              <div className="space-y-3">
                {topCategorias.map(([categoria, valor], index) => {
                  const totalDespesas = despesasPessoal + despesasNegocio;
                  const percentual = totalDespesas > 0 ? (valor / totalDespesas) * 100 : 0;

                  return (
                    <div key={categoria} className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-orange-400 font-bold text-sm">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-white font-medium">{categoria}</span>
                          <span className="text-white font-bold">{formatarMoeda(valor)}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full"
                            style={{ width: `${percentual}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{percentual.toFixed(1)}% do total</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Métricas de Mensagens */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-blue-400" />
              Mensagens Recebidas
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{metricas.total_inbound_messages}</p>
                <p className="text-sm text-gray-400 mt-1">Total</p>
              </div>
              {Object.entries(metricas.inbound_by_type)
                .filter(([_, qtd]) => qtd > 0)
                .map(([tipo, qtd]) => (
                  <div key={tipo} className="text-center">
                    <div className="flex justify-center mb-2">
                      <span className={getTipoColor(tipo)}>{getTipoIcon(tipo)}</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{qtd}</p>
                    <p className="text-xs text-gray-400 mt-1">{getTipoLabel(tipo)}</p>
                  </div>
                ))}
            </div>
          </div>

          {/* Breakdown Diário Completo */}
          {metricasDiarias && metricasDiarias.daily_breakdown.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Detalhamento Diário
              </h2>

              <div className="space-y-4">
                {metricasDiarias.daily_breakdown.map((dia) => {
                  const gastosDia = gastosPorDia[dia.date] || 0;

                  return (
                    <div
                      key={dia.date}
                      className="bg-gray-800/50 border border-gray-700 rounded-lg p-5"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-blue-400" />
                          <span className="text-white font-semibold">
                            {(() => {
                              const partes = dia.date.split('-');
                              if (partes.length === 3) {
                                const [ano, mes, d] = partes;
                                const date = new Date(Number(ano), Number(mes) - 1, Number(d));
                                return date.toLocaleDateString('pt-BR', {
                                  weekday: 'long',
                                  day: '2-digit',
                                  month: 'long',
                                });
                              }
                              return dia.date;
                            })()}
                          </span>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-xs text-gray-400">Mensagens</p>
                            <p className="text-xl font-bold text-blue-400">
                              {dia.total_inbound}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-400">Gastos</p>
                            <p className="text-xl font-bold text-red-400">
                              {formatarMoeda(gastosDia)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {Object.entries(dia.by_type)
                          .filter(([_, qtd]) => qtd > 0)
                          .map(([tipo, qtd]) => (
                            <div
                              key={tipo}
                              className="flex items-center gap-2 bg-gray-900/50 rounded px-3 py-2"
                            >
                              <span className={getTipoColor(tipo)}>{getTipoIcon(tipo)}</span>
                              <div>
                                <p className="text-xs text-gray-400">{getTipoLabel(tipo)}</p>
                                <p className="text-white font-semibold">{qtd}</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {!loading && !usuarioSelecionado && (
        <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-xl">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Selecione um usuário para ver as métricas completas</p>
        </div>
      )}
    </div>
  );
}
