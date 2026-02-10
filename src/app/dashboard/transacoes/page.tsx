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
  ChevronDown,
  ChevronUp,
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
  usuario: {
    id: number;
    nome?: string;
    criado_em: string;
    agent_id?: number;
    grupo?: {
      nome: string;
    };
  };
  categoria: { id: number; nome: string };
}

interface Categoria {
  id: number;
  nome: string;
  tipo: string;
}

interface Grupo {
  id: number;
  nome: string;
}

interface Usuario {
  id: number;
  nome: string;
  grupo_id?: number;
}

type PeriodoRapido = 'semana' | 'mes' | 'ano' | 'custom';

export default function TransacoesPage() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroCaixa, setFiltroCaixa] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [filtroGrupo, setFiltroGrupo] = useState('todos');
  const [filtroUsuario, setFiltroUsuario] = useState('todos');
  const [periodoSelecionado, setPeriodoSelecionado] = useState<PeriodoRapido>('custom');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [filtroSemana, setFiltroSemana] = useState('');
  const [busca, setBusca] = useState('');
  const [tabelaExpandida, setTabelaExpandida] = useState(false);

  const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'hkjsaDFSkjSDF39847sfkjdWr23';

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

  const handlePeriodoChange = (tipo: PeriodoRapido) => {
    setPeriodoSelecionado(tipo);
    if (tipo !== 'custom') {
      calcularPeriodo(tipo);
    }
  };

  useEffect(() => {
    carregarDados();
    carregarGrupos();
  }, []);

  useEffect(() => {
    if (filtroGrupo !== 'todos') {
      carregarUsuarios();
    } else {
      setUsuarios([]);
      setFiltroUsuario('todos');
    }
  }, [filtroGrupo]);

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
      if (filtroGrupo !== 'todos') {
        params.append('grupoId', filtroGrupo);
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

  // Primeiro, definir a função calcularSemanaUsuario
  const calcularSemanaUsuario = (dataTransacao: string, usuarioCriadoEm: string): number => {
    const inicio = new Date(usuarioCriadoEm);
    const transacao = new Date(dataTransacao);
    const diffMs = transacao.getTime() - inicio.getTime();
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const semana = Math.floor(diffDias / 7) + 1;
    return Math.max(1, semana);
  };

  // Agora filtrar as transações
  const transacoesFiltradas = transacoes.filter((t) => {
    const matchTipo = filtroTipo === 'todos' || t.tipo === filtroTipo;
    const matchCaixa = filtroCaixa === 'todos' || t.tipo_caixa === filtroCaixa;
    const matchCategoria =
      filtroCategoria === 'todos' || t.categoria.id.toString() === filtroCategoria;

    // Filtro de grupo
    const grupoNome = grupos.find(g => g.id.toString() === filtroGrupo)?.nome;
    const matchGrupo = filtroGrupo === 'todos' || t.usuario.grupo?.nome === grupoNome;

    // Filtro de usuário
    const matchUsuario = filtroUsuario === 'todos' || t.usuario.id.toString() === filtroUsuario;

    // Filtro de data
    let matchData = true;
    if (dataInicio && dataFim) {
      const dataT = new Date(t.data_transacao).getTime();
      const inicio = new Date(dataInicio).getTime();
      const fim = new Date(dataFim + 'T23:59:59').getTime();
      matchData = dataT >= inicio && dataT <= fim;
    } else if (dataInicio) {
      matchData = new Date(t.data_transacao).getTime() >= new Date(dataInicio).getTime();
    } else if (dataFim) {
      matchData = new Date(t.data_transacao).getTime() <= new Date(dataFim + 'T23:59:59').getTime();
    }

    // Filtro de semana
    const matchSemana = filtroSemana === '' ||
      calcularSemanaUsuario(t.data_transacao, t.usuario.criado_em).toString() === filtroSemana;

    const matchBusca =
      busca === '' ||
      t.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
      t.categoria.nome.toLowerCase().includes(busca.toLowerCase()) ||
      t.usuario.nome?.toLowerCase().includes(busca.toLowerCase());

    return matchTipo && matchCaixa && matchCategoria && matchGrupo && matchUsuario && matchData && matchSemana && matchBusca;
  });

  const receitas = transacoesFiltradas.filter((t) => t.tipo === 'receita');
  const despesas = transacoesFiltradas.filter((t) => t.tipo === 'despesa');

  const totalReceitas = receitas.reduce((sum, t) => sum + Number(t.valor), 0);
  const totalDespesas = despesas.reduce((sum, t) => sum + Number(t.valor), 0);
  const saldo = totalReceitas - totalDespesas;

  // Calcular saldos por tipo de caixa
  const receitasPessoal = transacoesFiltradas.filter((t) => t.tipo === 'receita' && t.tipo_caixa === 'pessoal').reduce((sum, t) => sum + Number(t.valor), 0);
  const despesasPessoal = transacoesFiltradas.filter((t) => t.tipo === 'despesa' && t.tipo_caixa === 'pessoal').reduce((sum, t) => sum + Number(t.valor), 0);
  const saldoPessoal = receitasPessoal - despesasPessoal;

  const receitasNegocio = transacoesFiltradas.filter((t) => t.tipo === 'receita' && t.tipo_caixa === 'negocio').reduce((sum, t) => sum + Number(t.valor), 0);
  const despesasNegocio = transacoesFiltradas.filter((t) => t.tipo === 'despesa' && t.tipo_caixa === 'negocio').reduce((sum, t) => sum + Number(t.valor), 0);
  const saldoNegocio = receitasNegocio - despesasNegocio;

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

  // Calcular evolução por semana (depois da declaração da função)
  const saldosPorSemana: { [key: number]: { pessoal: number; negocio: number; total: number } } = {};

  transacoesFiltradas.forEach((t) => {
    const semana = calcularSemanaUsuario(t.data_transacao, t.usuario.criado_em);
    if (!saldosPorSemana[semana]) {
      saldosPorSemana[semana] = { pessoal: 0, negocio: 0, total: 0 };
    }

    const valor = Number(t.valor) * (t.tipo === 'receita' ? 1 : -1);

    if (t.tipo_caixa === 'pessoal') {
      saldosPorSemana[semana].pessoal += valor;
    } else {
      saldosPorSemana[semana].negocio += valor;
    }
    saldosPorSemana[semana].total += valor;
  });

  // Preencher todas as semanas de 1 até a maior semana
  const semanasComDados = Object.keys(saldosPorSemana).map(Number);
  const maxSemana = semanasComDados.length > 0 ? Math.max(...semanasComDados) : 0;

  // Criar array com todas as semanas de 1 até maxSemana
  const todasSemanas: number[] = [];
  for (let i = 1; i <= maxSemana; i++) {
    todasSemanas.push(i);
    // Se a semana não tem dados, inicializar com zeros
    if (!saldosPorSemana[i]) {
      saldosPorSemana[i] = { pessoal: 0, negocio: 0, total: 0 };
    }
  }

  // Calcular saldos acumulados
  const saldosAcumulados: { [key: number]: { pessoal: number; negocio: number; total: number } } = {};
  let acumuladoPessoal = 0;
  let acumuladoNegocio = 0;
  let acumuladoTotal = 0;

  todasSemanas.forEach((semana) => {
    acumuladoPessoal += saldosPorSemana[semana].pessoal;
    acumuladoNegocio += saldosPorSemana[semana].negocio;
    acumuladoTotal += saldosPorSemana[semana].total;

    saldosAcumulados[semana] = {
      pessoal: acumuladoPessoal,
      negocio: acumuladoNegocio,
      total: acumuladoTotal,
    };
  });

  const semanasOrdenadas = todasSemanas;

  const exportarTransacoes = async () => {
    try {
      // Exportar as transações já filtradas na tela
      const csvLines: string[] = [];
      csvLines.push('ID,Usuário,Grupo,Agent ID,Tipo,Tipo Caixa,Valor,Categoria,Data Transação,Semana Usuário,Tipo Entrada,Descrição');

      transacoesFiltradas.forEach((t) => {
        const semanaUsuario = calcularSemanaUsuario(t.data_transacao, t.usuario.criado_em);
        const descricao = (t.descricao || '').replace(/,/g, ';').replace(/\n/g, ' ');
        const grupoNome = t.usuario.grupo?.nome || 'Sem Grupo';

        csvLines.push(
          `${t.id},${t.usuario.nome || `Usuário #${t.usuario.id}`},${grupoNome},${t.usuario.agent_id || 'N/A'},${t.tipo},${t.tipo_caixa},${t.valor},${t.categoria.nome},${formatarData(t.data_transacao)},${semanaUsuario},${t.tipo_entrada},${descricao}`
        );
      });

      const csv = csvLines.join('\n');
      const bom = '\uFEFF';
      const csvWithBom = bom + csv;

      const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' });
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
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Filtros</h2>
          </div>
          <button
            onClick={exportarTransacoes}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar Dados
          </button>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-300 mb-2 block">Período Rápido</label>
          <div className="flex gap-2 flex-wrap">
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Data Início</label>
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
            <label className="text-sm font-medium text-gray-300 mb-2 block">Data Fim</label>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Filtrar por Grupo</label>
            <select
              value={filtroGrupo}
              onChange={(e) => setFiltroGrupo(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="todos">Todos os Grupos</option>
              {grupos.map((grupo) => (
                <option key={grupo.id} value={grupo.id}>
                  {grupo.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Filtrar por Usuário</label>
            <select
              value={filtroUsuario}
              onChange={(e) => setFiltroUsuario(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              disabled={filtroGrupo === 'todos'}
            >
              <option value="todos">Todos os Usuários</option>
              {usuarios.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nome || `Usuário #${usuario.id}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
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

          <input
            type="number"
            value={filtroSemana}
            onChange={(e) => setFiltroSemana(e.target.value)}
            placeholder="Semana"
            min="1"
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm w-32"
          />

          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por descrição, categoria ou usuário..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>
        </div>
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
            <span className="text-gray-400 text-sm">Saldo Total</span>
            <Wallet className={`w-5 h-5 ${saldo >= 0 ? 'text-purple-500' : 'text-orange-500'}`} />
          </div>
          <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatarMoeda(saldo)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border border-blue-500/30 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-400" />
              <span className="text-gray-300 font-semibold">Caixa Pessoal</span>
            </div>
          </div>
          <p className={`text-3xl font-bold mb-2 ${saldoPessoal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatarMoeda(saldoPessoal)}
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Receitas</p>
              <p className="text-green-400 font-medium">{formatarMoeda(receitasPessoal)}</p>
            </div>
            <div>
              <p className="text-gray-400">Despesas</p>
              <p className="text-red-400 font-medium">{formatarMoeda(despesasPessoal)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border border-purple-500/30 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-400" />
              <span className="text-gray-300 font-semibold">Caixa do Negócio</span>
            </div>
          </div>
          <p className={`text-3xl font-bold mb-2 ${saldoNegocio >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatarMoeda(saldoNegocio)}
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Receitas</p>
              <p className="text-green-400 font-medium">{formatarMoeda(receitasNegocio)}</p>
            </div>
            <div>
              <p className="text-gray-400">Despesas</p>
              <p className="text-red-400 font-medium">{formatarMoeda(despesasNegocio)}</p>
            </div>
          </div>
        </div>
      </div>

      {semanasOrdenadas.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-400" />
              Evolução dos Saldos por Semana (Acumulado)
            </h2>
            {semanasOrdenadas.length > 5 && (
              <button
                onClick={() => setTabelaExpandida(!tabelaExpandida)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {tabelaExpandida ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Mostrar Menos
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Mostrar Todas ({semanasOrdenadas.length} semanas)
                  </>
                )}
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-gray-400 font-medium pb-3 px-2">Semana</th>
                  <th className="text-right text-gray-400 font-medium pb-3 px-2">Mov. Pessoal</th>
                  <th className="text-right text-gray-400 font-medium pb-3 px-2">Mov. Negócio</th>
                  <th className="text-right text-gray-400 font-medium pb-3 px-2">Saldo Acum. Pessoal</th>
                  <th className="text-right text-gray-400 font-medium pb-3 px-2">Saldo Acum. Negócio</th>
                  <th className="text-right text-gray-400 font-medium pb-3 px-2">Saldo Total</th>
                </tr>
              </thead>
              <tbody>
                {(tabelaExpandida ? semanasOrdenadas : semanasOrdenadas.slice(-5)).map((semana) => {
                  const movimentos = saldosPorSemana[semana];
                  const acumulados = saldosAcumulados[semana];
                  const temMovimento = movimentos.pessoal !== 0 || movimentos.negocio !== 0;

                  return (
                    <tr key={semana} className={`border-b border-gray-800/50 hover:bg-gray-800/30 ${!temMovimento ? 'opacity-50' : ''}`}>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${temMovimento ? 'bg-orange-500/20 text-orange-300' : 'bg-gray-700/50 text-gray-400'}`}>
                          Semana {semana}
                        </span>
                      </td>
                      <td className={`text-right font-medium px-2 text-xs ${movimentos.pessoal > 0 ? 'text-green-400' : movimentos.pessoal < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                        {movimentos.pessoal !== 0 ? formatarMoeda(movimentos.pessoal) : '-'}
                      </td>
                      <td className={`text-right font-medium px-2 text-xs ${movimentos.negocio > 0 ? 'text-green-400' : movimentos.negocio < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                        {movimentos.negocio !== 0 ? formatarMoeda(movimentos.negocio) : '-'}
                      </td>
                      <td className={`text-right font-medium px-2 ${acumulados.pessoal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatarMoeda(acumulados.pessoal)}
                      </td>
                      <td className={`text-right font-medium px-2 ${acumulados.negocio >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatarMoeda(acumulados.negocio)}
                      </td>
                      <td className={`text-right font-bold px-2 ${acumulados.total >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatarMoeda(acumulados.total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-700">
                  <td className="py-3 px-2 font-bold text-white" colSpan={3}>Saldo Final Acumulado</td>
                  <td className={`text-right font-bold px-2 ${saldoPessoal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatarMoeda(saldoPessoal)}
                  </td>
                  <td className={`text-right font-bold px-2 ${saldoNegocio >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatarMoeda(saldoNegocio)}
                  </td>
                  <td className={`text-right font-bold px-2 ${saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatarMoeda(saldo)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          {!tabelaExpandida && semanasOrdenadas.length > 5 && (
            <p className="text-center text-gray-500 text-xs mt-3">
              Mostrando últimas 5 semanas de {semanasOrdenadas.length}
            </p>
          )}
        </div>
      )}



      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">

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
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${transacao.tipo === 'receita'
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
                          className={`px-2 py-1 rounded text-xs font-medium ${transacao.tipo === 'receita'
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-red-500/20 text-red-300'
                            }`}
                        >
                          {transacao.tipo}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${transacao.tipo_caixa === 'pessoal'
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
                        <span className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded text-xs font-medium">
                          Semana {calcularSemanaUsuario(transacao.data_transacao, transacao.usuario.criado_em)}
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
                      className={`text-2xl font-bold ${transacao.tipo === 'receita' ? 'text-green-500' : 'text-red-500'
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
