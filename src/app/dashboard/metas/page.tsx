'use client';

import { useState, useEffect } from 'react';
import {
  Target,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  TrendingUp,
  Download,
} from 'lucide-react';

interface Meta {
  id: number;
  descricao: string;
  tipo_meta: string;
  data_inicio: string;
  data_fim: string;
  cumprida: boolean | null;
  respondido_em: string | null;
  criado_em: string;
  usuario: {
    id: number;
    nome?: string;
    agent_id?: number;
    criado_em?: string;
    grupo?: {
      id: number;
      nome: string;
    };
  };
}

interface Usuario {
  id: number;
  nome?: string;
  grupo_id?: number;
  criado_em?: string;
}

interface Grupo {
  id: number;
  nome: string;
}

type PeriodoRapido = 'semana' | 'mes' | 'ano' | 'custom';

const TIPOS_META = {
  reserva_financeira: 'Reserva Financeira',
  controle_inventario: 'Controle de Inventário',
  meta_vendas: 'Meta de Vendas',
  pagamento_contas: 'Pagamento de Contas',
  outro: 'Outro',
};

export default function MetasPage() {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroUsuario, setFiltroUsuario] = useState('todos');
  const [filtroGrupo, setFiltroGrupo] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [periodoSelecionado, setPeriodoSelecionado] = useState<PeriodoRapido>('custom');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [filtroSemana, setFiltroSemana] = useState('');
  const [busca, setBusca] = useState('');

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
    carregarUsuarios();
    carregarGrupos();
  }, []);

  useEffect(() => {
    if (usuarios.length > 0) {
      carregarTodasMetas();
    }
  }, [usuarios]);

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
      const res = await fetch('/api/v1/usuarios', {
        headers: { 'x-api-key': API_KEY },
      });
      const data = await res.json();
      if (data.success) {
        setUsuarios(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const carregarTodasMetas = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/metas/todas', {
        headers: { 'x-api-key': API_KEY },
      });
      const data = await res.json();

      if (data.success && data.data) {
        setMetas(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularSemanaUsuario = (dataInicio: string, usuarioCriadoEm: string): number => {
    const inicio = new Date(usuarioCriadoEm);
    const meta = new Date(dataInicio);
    const diffMs = meta.getTime() - inicio.getTime();
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const semana = Math.floor(diffDias / 7) + 1;
    return Math.max(1, semana);
  };

  const extrairValorDaDescricao = (descricao: string): string | null => {
    // Regex para encontrar valores monetários: R$ 1000, R$1000, 1000 reais, etc
    const regexValor = /R\$\s*(\d+(?:[.,]\d+)?)|(\d+(?:[.,]\d+)?)\s*(?:reais?|R\$)/gi;
    const match = regexValor.exec(descricao);

    if (match) {
      const valor = match[1] || match[2];
      return `R$ ${valor.replace(',', '.')}`;
    }

    return null;
  };

  const metasFiltradas = metas.filter((meta) => {
    const matchUsuario =
      filtroUsuario === 'todos' || meta.usuario.id.toString() === filtroUsuario;

    // Filtro de grupo
    const matchGrupo = filtroGrupo === 'todos' || meta.usuario.grupo?.id.toString() === filtroGrupo;

    let matchStatus = true;
    if (filtroStatus === 'cumpridas') matchStatus = meta.cumprida === true;
    else if (filtroStatus === 'nao_cumpridas') matchStatus = meta.cumprida === false;
    else if (filtroStatus === 'pendentes') matchStatus = meta.cumprida === null;

    const matchTipo = filtroTipo === 'todos' || meta.tipo_meta === filtroTipo;

    // Filtro de data
    let matchData = true;
    if (dataInicio && dataFim) {
      const dataInicioMeta = new Date(meta.data_inicio).getTime();
      const inicio = new Date(dataInicio).getTime();
      const fim = new Date(dataFim + 'T23:59:59').getTime();
      matchData = dataInicioMeta >= inicio && dataInicioMeta <= fim;
    } else if (dataInicio) {
      matchData = new Date(meta.data_inicio).getTime() >= new Date(dataInicio).getTime();
    } else if (dataFim) {
      matchData = new Date(meta.data_inicio).getTime() <= new Date(dataFim + 'T23:59:59').getTime();
    }

    // Filtro de semana
    const matchSemana = filtroSemana === '' ||
      (meta.usuario.criado_em && calcularSemanaUsuario(meta.data_inicio, meta.usuario.criado_em).toString() === filtroSemana);

    const matchBusca =
      busca === '' ||
      meta.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      meta.usuario.nome?.toLowerCase().includes(busca.toLowerCase());

    return matchUsuario && matchGrupo && matchStatus && matchTipo && matchData && matchSemana && matchBusca;
  });

  // Calcular estatísticas com base nas metas filtradas
  const estatisticasFiltradas = {
    total: metasFiltradas.length,
    cumpridas: metasFiltradas.filter((m) => m.cumprida === true).length,
    nao_cumpridas: metasFiltradas.filter((m) => m.cumprida === false).length,
    sem_resposta: metasFiltradas.filter((m) => m.cumprida === null).length,
    taxa_cumprimento: 0,
    por_tipo: {} as Record<string, { total: number; cumpridas: number; taxa: number }>,
  };

  const totalRespondidas = estatisticasFiltradas.cumpridas + estatisticasFiltradas.nao_cumpridas;
  estatisticasFiltradas.taxa_cumprimento = totalRespondidas > 0
    ? (estatisticasFiltradas.cumpridas / totalRespondidas) * 100
    : 0;

  const formatarData = (data: string) => {
    const dataSemHora = data.split('T')[0];
    return new Date(dataSemHora + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const exportarMetas = async () => {
    try {
      // Exportar as metas já filtradas na tela
      const csvLines: string[] = [];
      csvLines.push('ID,Usuário,Grupo,Agent ID,Tipo Meta,Cumprida,Data Início,Data Fim,Semana Usuário,Valor Alvo,Descrição');

      metasFiltradas.forEach((m) => {
        const semanaUsuario = m.usuario.criado_em
          ? calcularSemanaUsuario(m.data_inicio, m.usuario.criado_em)
          : 'N/A';

        const descricao = (m.descricao || '').replace(/,/g, ';').replace(/\n/g, ' ');
        const grupoNome = m.usuario.grupo?.nome || 'Sem Grupo';
        const statusCumprida = m.cumprida === null ? 'Pendente' : m.cumprida ? 'Sim' : 'Não';
        const tipoMetaNome = TIPOS_META[m.tipo_meta as keyof typeof TIPOS_META] || m.tipo_meta;
        const valorAlvo = extrairValorDaDescricao(m.descricao) || 'N/A';

        csvLines.push(
          `${m.id},${m.usuario.nome || `Usuário #${m.usuario.id}`},${grupoNome},${m.usuario.agent_id || 'N/A'},${tipoMetaNome},${statusCumprida},${formatarData(m.data_inicio)},${formatarData(m.data_fim)},${semanaUsuario},${valorAlvo},${descricao}`
        );
      });

      const csv = csvLines.join('\n');
      const bom = '\uFEFF';
      const csvWithBom = bom + csv;

      const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `metas-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao exportar metas:', error);
      alert('Erro ao exportar metas');
    }
  };

  const getStatusIcon = (cumprida: boolean | null) => {
    if (cumprida === null)
      return <Clock className="w-5 h-5 text-gray-400" />;
    if (cumprida) return <CheckCircle className="w-5 h-5 text-green-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusBadge = (cumprida: boolean | null) => {
    if (cumprida === null)
      return <span className="px-3 py-1 bg-gray-500/20 text-gray-300 rounded-full text-xs font-medium">Pendente</span>;
    if (cumprida)
      return <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-medium">Cumprida</span>;
    return <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-medium">Não Cumprida</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Target className="w-8 h-8" />
            Metas Semanais
          </h1>
          <p className="text-gray-400">Acompanhar metas financeiras de todos os usuários</p>
        </div>

      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Filtros</h2>
          </div>
          <button
            onClick={exportarMetas}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-300 mb-2 block">Período Rápido</label>
          <div className="flex gap-2 flex-wrap">
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
            >
              <option value="todos">Todos os Usuários</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome || `Usuário #${u.id}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
          >
            <option value="todos">Todos status</option>
            <option value="cumpridas">Cumpridas</option>
            <option value="nao_cumpridas">Não Cumpridas</option>
            <option value="pendentes">Pendentes</option>
          </select>

          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
          >
            <option value="todos">Todos os tipos</option>
            {Object.entries(TIPOS_META).map(([valor, label]) => (
              <option key={valor} value={valor}>
                {label}
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
              placeholder="Buscar por descrição ou usuário..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total de Metas</span>
            <Target className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-white">{estatisticasFiltradas.total}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Cumpridas</span>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-500">{estatisticasFiltradas.cumpridas}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Não Cumpridas</span>
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-red-500">{estatisticasFiltradas.nao_cumpridas}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Taxa de Sucesso</span>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-500">
            {estatisticasFiltradas.taxa_cumprimento.toFixed(0)}%
          </p>
        </div>
      </div>



      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Carregando metas...</p>
          </div>
        ) : metasFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Nenhuma meta encontrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {metasFiltradas.map((meta) => (
              <div
                key={meta.id}
                className="bg-gray-800/50 border border-gray-700 rounded-lg p-5 hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getStatusIcon(meta.cumprida)}</div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(meta.cumprida)}
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-medium">
                        {TIPOS_META[meta.tipo_meta as keyof typeof TIPOS_META]}
                      </span>
                    </div>

                    <p className="text-white font-medium mb-2">{meta.descricao}</p>
                    {extrairValorDaDescricao(meta.descricao) && (
                      <p className="text-gray-300 text-sm mb-2">
                        <span className="font-semibold">Valor Alvo:</span> {extrairValorDaDescricao(meta.descricao)}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatarData(meta.data_inicio)} - {formatarData(meta.data_fim)}
                      </span>
                      <span>{meta.usuario.nome || `Usuário #${meta.usuario.id}`}</span>
                      {meta.usuario.criado_em && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs font-medium">
                          Semana {calcularSemanaUsuario(meta.data_inicio, meta.usuario.criado_em)}
                        </span>
                      )}
                      {meta.respondido_em && (
                        <span>
                          Respondido: {new Date(meta.respondido_em).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-500">ID: {meta.id}</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-4 text-sm text-gray-400 text-center">
              Mostrando {metasFiltradas.length} de {metas.length} metas
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
