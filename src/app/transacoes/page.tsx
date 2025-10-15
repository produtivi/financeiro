'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Trash2, Plus } from 'lucide-react';

interface Transacao {
  id: number;
  tipo: 'receita' | 'despesa';
  valor: number;
  descricao?: string;
  data_transacao: string;
  usuario: { id: number; nome?: string };
  categoria: { id: number; nome: string };
}

interface Categoria {
  id: number;
  nome: string;
  tipo: string;
}

interface Usuario {
  id: number;
  nome?: string;
  chat_id: number;
}

export default function TransacoesPage() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  const [usuarioId, setUsuarioId] = useState('');
  const [tipo, setTipo] = useState<'receita' | 'despesa'>('receita');
  const [valor, setValor] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);

  const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'hkjsaDFSkjSDF39847sfkjdWr23';

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [resTransacoes, resCategorias, resUsuarios] = await Promise.all([
        fetch('/api/v1/transacoes', { headers: { 'x-api-key': API_KEY } }),
        fetch('/api/v1/categorias', { headers: { 'x-api-key': API_KEY } }),
        fetch('/api/v1/usuarios', { headers: { 'x-api-key': API_KEY } }),
      ]);

      const [dataTransacoes, dataCategorias, dataUsuarios] = await Promise.all([
        resTransacoes.json(),
        resCategorias.json(),
        resUsuarios.json(),
      ]);

      if (dataTransacoes.success) setTransacoes(dataTransacoes.data);
      if (dataCategorias.success) setCategorias(dataCategorias.data);
      if (dataUsuarios.success) setUsuarios(dataUsuarios.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const criarTransacao = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/transacoes', {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario_id: Number(usuarioId),
          tipo,
          valor: Number(valor),
          categoria_id: Number(categoriaId),
          descricao: descricao || undefined,
          data_transacao: data,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setValor('');
        setDescricao('');
        carregarDados();
      }
    } catch (error) {
      console.error('Erro ao criar transação:', error);
    }
  };

  const deletarTransacao = async (id: number) => {
    if (!confirm('Deseja deletar esta transação?')) return;
    try {
      const res = await fetch(`/api/v1/transacoes/${id}`, {
        method: 'DELETE',
        headers: { 'x-api-key': API_KEY },
      });
      const data = await res.json();
      if (data.success) {
        carregarDados();
      }
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
    }
  };

  const categoriasFiltradas = categorias.filter((c) => c.tipo === tipo);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-400 hover:underline flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="w-8 h-8 text-yellow-400" />
          <h1 className="text-4xl font-bold">Transações</h1>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nova Transação
          </h2>
          <form onSubmit={criarTransacao} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="block text-sm text-gray-400 mb-1">Tipo</label>
              <select
                value={tipo}
                onChange={(e) => {
                  setTipo(e.target.value as 'receita' | 'despesa');
                  setCategoriaId('');
                }}
                className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white"
              >
                <option value="receita">Receita</option>
                <option value="despesa">Despesa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Categoria</label>
              <select
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                required
                className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white"
              >
                <option value="">Selecione</option>
                {categoriasFiltradas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Valor</label>
              <input
                type="number"
                step="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0.00"
                required
                className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Data</label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                required
                className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Descrição (opcional)</label>
              <input
                type="text"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descrição"
                className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="bg-yellow-600 hover:bg-yellow-700 px-6 py-2 rounded font-semibold flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Criar Transação
              </button>
            </div>
          </form>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4">Lista de Transações</h2>
          {loading ? (
            <p className="text-gray-400">Carregando...</p>
          ) : (
            <div className="space-y-2">
              {transacoes.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between bg-gray-900/50 p-4 rounded"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          t.tipo === 'receita'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {t.tipo}
                      </span>
                      <span className="font-semibold">
                        R$ {Number(t.valor).toFixed(2)}
                      </span>
                      <span className="text-gray-400 text-sm">{t.categoria.nome}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {t.descricao} • {new Date(t.data_transacao).toLocaleDateString('pt-BR')} •{' '}
                      {t.usuario.nome || `Usuário #${t.usuario.id}`}
                    </div>
                  </div>
                  <button
                    onClick={() => deletarTransacao(t.id)}
                    className="text-red-400 hover:text-red-300 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Deletar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
