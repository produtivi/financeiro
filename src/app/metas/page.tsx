'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Target, Trash2, Plus, CheckCircle2, XCircle, Calendar, TrendingUp } from 'lucide-react';

interface Meta {
  id: number;
  descricao: string;
  tipo_meta: string;
  data_inicio: string;
  data_fim: string;
  cumprida: boolean | null;
  respondido_em: string | null;
  usuario: { id: number; nome?: string };
}

interface Usuario {
  id: number;
  nome?: string;
  chat_id: number;
}

interface Estatisticas {
  total: number;
  cumpridas: number;
  nao_cumpridas: number;
  sem_resposta: number;
  taxa_cumprimento: number;
  por_tipo: Record<string, { total: number; cumpridas: number; taxa: number }>;
}

const TIPOS_META = [
  { value: 'reserva_financeira', label: 'Reserva Financeira' },
  { value: 'controle_inventario', label: 'Controle de Inventário' },
  { value: 'meta_vendas', label: 'Meta de Vendas' },
  { value: 'pagamento_contas', label: 'Pagamento de Contas' },
  { value: 'outro', label: 'Outro' },
];

export default function MetasPage() {
  const [metas, setMetas] = useState<Meta[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState('');

  const [usuarioId, setUsuarioId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipoMeta, setTipoMeta] = useState('reserva_financeira');
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0]);
  const [dataFim, setDataFim] = useState('');

  const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'hkjsaDFSkjSDF39847sfkjdWr23';

  useEffect(() => {
    carregarUsuarios();
  }, []);

  useEffect(() => {
    if (usuarioSelecionado) {
      carregarMetas();
      carregarEstatisticas();
    }
  }, [usuarioSelecionado]);

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

  const carregarMetas = async () => {
    if (!usuarioSelecionado) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/metas?usuario_id=${usuarioSelecionado}`, {
        headers: { 'x-api-key': API_KEY },
      });
      const data = await res.json();
      if (data.success) {
        setMetas(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarEstatisticas = async () => {
    if (!usuarioSelecionado) return;
    try {
      const res = await fetch(`/api/v1/metas/estatisticas?usuario_id=${usuarioSelecionado}`, {
        headers: { 'x-api-key': API_KEY },
      });
      const data = await res.json();
      if (data.success) {
        setEstatisticas(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const criarMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/metas', {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario_id: Number(usuarioId),
          descricao,
          tipo_meta: tipoMeta,
          data_inicio: dataInicio,
          data_fim: dataFim,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setDescricao('');
        setDataFim('');
        if (usuarioId === usuarioSelecionado) {
          carregarMetas();
          carregarEstatisticas();
        }
      }
    } catch (error) {
      console.error('Erro ao criar meta:', error);
    }
  };

  const marcarCumprida = async (id: number, cumprida: boolean) => {
    try {
      const res = await fetch(`/api/v1/metas/${id}/cumprida?usuario_id=${usuarioSelecionado}`, {
        method: 'PUT',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cumprida }),
      });
      const data = await res.json();
      if (data.success) {
        carregarMetas();
        carregarEstatisticas();
      }
    } catch (error) {
      console.error('Erro ao marcar meta:', error);
    }
  };

  const deletarMeta = async (id: number) => {
    if (!confirm('Deseja deletar esta meta?')) return;
    try {
      const res = await fetch(`/api/v1/metas/${id}?usuario_id=${usuarioSelecionado}`, {
        method: 'DELETE',
        headers: { 'x-api-key': API_KEY },
      });
      const data = await res.json();
      if (data.success) {
        carregarMetas();
        carregarEstatisticas();
      }
    } catch (error) {
      console.error('Erro ao deletar meta:', error);
    }
  };

  const formatarData = (data: string) => {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const getTipoMetaLabel = (tipo: string) => {
    return TIPOS_META.find(t => t.value === tipo)?.label || tipo;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-400 hover:underline flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <Target className="w-8 h-8 text-purple-400" />
          <h1 className="text-4xl font-bold">Metas Semanais</h1>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Selecione um usuário para visualizar</label>
          <select
            value={usuarioSelecionado}
            onChange={(e) => setUsuarioSelecionado(e.target.value)}
            className="w-full max-w-md bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white"
          >
            <option value="">Selecione um usuário</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome || `Usuário #${u.id}`}
              </option>
            ))}
          </select>
        </div>

        {estatisticas && usuarioSelecionado && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-300 text-sm">Total de Metas</span>
                <Target className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-3xl font-bold">{estatisticas.total}</p>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-300 text-sm">Cumpridas</span>
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl font-bold">{estatisticas.cumpridas}</p>
            </div>

            <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-red-300 text-sm">Não Cumpridas</span>
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-3xl font-bold">{estatisticas.nao_cumpridas}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-300 text-sm">Taxa de Sucesso</span>
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-bold">{estatisticas.taxa_cumprimento.toFixed(0)}%</p>
            </div>
          </div>
        )}

        <div className="bg-gray-800/50 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nova Meta
          </h2>
          <form onSubmit={criarMeta} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Usuário</label>
              <select
                value={usuarioId}
                onChange={(e) => setUsuarioId(e.target.value)}
                required
                className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white"
              >
                <option value="">Selecione</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nome || `Usuário #${u.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Tipo de Meta</label>
              <select
                value={tipoMeta}
                onChange={(e) => setTipoMeta(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white"
              >
                {TIPOS_META.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Descrição da Meta</label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Economizar R$ 500 para reserva de emergência"
                required
                rows={3}
                className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Data Início</label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                required
                className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Data Fim</label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                required
                className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded font-semibold flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Criar Meta
              </button>
            </div>
          </form>
        </div>

        {usuarioSelecionado && (
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Metas do Usuário</h2>
            {loading ? (
              <p className="text-gray-400">Carregando...</p>
            ) : metas.length === 0 ? (
              <p className="text-gray-400">Nenhuma meta cadastrada ainda.</p>
            ) : (
              <div className="space-y-3">
                {metas.map((meta) => (
                  <div
                    key={meta.id}
                    className="bg-gray-900/50 p-5 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-300">
                            {getTipoMetaLabel(meta.tipo_meta)}
                          </span>
                          {meta.cumprida === null && (
                            <span className="text-xs px-2 py-1 rounded bg-gray-500/20 text-gray-300">
                              Aguardando resposta
                            </span>
                          )}
                          {meta.cumprida === true && (
                            <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Cumprida
                            </span>
                          )}
                          {meta.cumprida === false && (
                            <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-300 flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              Não cumprida
                            </span>
                          )}
                        </div>
                        <p className="text-white mb-2">{meta.descricao}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatarData(meta.data_inicio)} - {formatarData(meta.data_fim)}
                          </span>
                          {meta.respondido_em && (
                            <span>
                              Respondido em: {new Date(meta.respondido_em).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deletarMeta(meta.id)}
                        className="text-red-400 hover:text-red-300 ml-4"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {meta.cumprida === null && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-700">
                        <button
                          onClick={() => marcarCumprida(meta.id, true)}
                          className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-semibold flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Marcar como Cumprida
                        </button>
                        <button
                          onClick={() => marcarCumprida(meta.id, false)}
                          className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-semibold flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Marcar como Não Cumprida
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
