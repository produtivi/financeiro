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
  usuario: { id: number; nome?: string };
}

interface Usuario {
  id: number;
  nome?: string;
}

interface Estatisticas {
  total: number;
  cumpridas: number;
  nao_cumpridas: number;
  sem_resposta: number;
  taxa_cumprimento: number;
  por_tipo: Record<string, { total: number; cumpridas: number; taxa: number }>;
}

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
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroUsuario, setFiltroUsuario] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [busca, setBusca] = useState('');

  const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'hkjsaDFSkjSDF39847sfkjdWr23';

  useEffect(() => {
    carregarUsuarios();
  }, []);

  useEffect(() => {
    if (usuarios.length > 0) {
      carregarTodasMetas();
    }
  }, [usuarios]);

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
      const promises = usuarios.map((usuario) =>
        fetch(`/api/v1/metas?usuario_id=${usuario.id}`, {
          headers: { 'x-api-key': API_KEY },
        }).then((res) => res.json())
      );

      const results = await Promise.all(promises);
      const todasMetas: Meta[] = [];

      results.forEach((data) => {
        if (data.success && data.data) {
          todasMetas.push(...data.data);
        }
      });

      setMetas(todasMetas);
      calcularEstatisticas(todasMetas);
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularEstatisticas = (metasData: Meta[]) => {
    const total = metasData.length;
    const cumpridas = metasData.filter((m) => m.cumprida === true).length;
    const naoCumpridas = metasData.filter((m) => m.cumprida === false).length;
    const semResposta = metasData.filter((m) => m.cumprida === null).length;
    const taxa = total > 0 ? (cumpridas / (cumpridas + naoCumpridas || 1)) * 100 : 0;

    const porTipo: Record<string, { total: number; cumpridas: number; taxa: number }> = {};
    Object.keys(TIPOS_META).forEach((tipo) => {
      const metasTipo = metasData.filter((m) => m.tipo_meta === tipo);
      const cumpridasTipo = metasTipo.filter((m) => m.cumprida === true).length;
      const totalRespondidas = metasTipo.filter((m) => m.cumprida !== null).length;
      porTipo[tipo] = {
        total: metasTipo.length,
        cumpridas: cumpridasTipo,
        taxa: totalRespondidas > 0 ? (cumpridasTipo / totalRespondidas) * 100 : 0,
      };
    });

    setEstatisticas({
      total,
      cumpridas,
      nao_cumpridas: naoCumpridas,
      sem_resposta: semResposta,
      taxa_cumprimento: taxa,
      por_tipo: porTipo,
    });
  };

  const metasFiltradas = metas.filter((meta) => {
    const matchUsuario =
      filtroUsuario === 'todos' || meta.usuario.id.toString() === filtroUsuario;

    let matchStatus = true;
    if (filtroStatus === 'cumpridas') matchStatus = meta.cumprida === true;
    else if (filtroStatus === 'nao_cumpridas') matchStatus = meta.cumprida === false;
    else if (filtroStatus === 'pendentes') matchStatus = meta.cumprida === null;

    const matchTipo = filtroTipo === 'todos' || meta.tipo_meta === filtroTipo;

    const matchBusca =
      busca === '' ||
      meta.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      meta.usuario.nome?.toLowerCase().includes(busca.toLowerCase());

    return matchUsuario && matchStatus && matchTipo && matchBusca;
  });

  const formatarData = (data: string) => {
    const dataSemHora = data.split('T')[0];
    return new Date(dataSemHora + 'T00:00:00').toLocaleDateString('pt-BR');
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
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Target className="w-8 h-8" />
          Metas Semanais
        </h1>
        <p className="text-gray-400">Acompanhar metas financeiras de todos os usuários</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total de Metas</span>
            <Target className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-white">{estatisticas?.total || 0}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Cumpridas</span>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-500">{estatisticas?.cumpridas || 0}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Não Cumpridas</span>
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-red-500">{estatisticas?.nao_cumpridas || 0}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Taxa de Sucesso</span>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-500">
            {estatisticas?.taxa_cumprimento.toFixed(0) || 0}%
          </p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex flex-col gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por descrição ou usuário..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-11 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filtroUsuario}
                onChange={(e) => setFiltroUsuario(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
              >
                <option value="todos">Todos os usuários</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nome || `Usuário #${u.id}`}
                  </option>
                ))}
              </select>
            </div>

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
          </div>
        </div>

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

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatarData(meta.data_inicio)} - {formatarData(meta.data_fim)}
                      </span>
                      <span>{meta.usuario.nome || `Usuário #${meta.usuario.id}`}</span>
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
