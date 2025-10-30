'use client';

import { useState, useEffect } from 'react';
import { Folder, Plus, Trash2, Search, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Categoria {
  id: number;
  nome: string;
  tipo: 'receita' | 'despesa';
  ativo: boolean;
  criado_em: string;
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<'receita' | 'despesa'>('receita');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [busca, setBusca] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoriaParaDeletar, setCategoriaParaDeletar] = useState<Categoria | null>(null);

  const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'hkjsaDFSkjSDF39847sfkjdWr23';

  useEffect(() => {
    carregarCategorias();
  }, []);

  const carregarCategorias = async () => {
    try {
      const res = await fetch('/api/v1/categorias', {
        headers: { 'x-api-key': API_KEY },
      });
      const data = await res.json();
      if (data.success) {
        setCategorias(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const criarCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/categorias', {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, tipo, ativo: true }),
      });
      const data = await res.json();
      if (data.success) {
        setNome('');
        setShowForm(false);
        carregarCategorias();
      }
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
    }
  };

  const abrirDialogDeletar = (categoria: Categoria) => {
    setCategoriaParaDeletar(categoria);
    setDeleteDialogOpen(true);
  };

  const deletarCategoria = async () => {
    if (!categoriaParaDeletar) return;

    try {
      const res = await fetch(`/api/v1/categorias/${categoriaParaDeletar.id}`, {
        method: 'DELETE',
        headers: { 'x-api-key': API_KEY },
      });
      const data = await res.json();
      if (data.success) {
        carregarCategorias();
        setDeleteDialogOpen(false);
        setCategoriaParaDeletar(null);
      }
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
    }
  };

  const categoriasFiltradas = categorias.filter((cat) => {
    const matchTipo = filtroTipo === 'todos' || cat.tipo === filtroTipo;
    const matchBusca =
      busca === '' ||
      cat.nome.toLowerCase().includes(busca.toLowerCase()) ||
      cat.id.toString().includes(busca);

    return matchTipo && matchBusca;
  });

  const receitas = categorias.filter((c) => c.tipo === 'receita');
  const despesas = categorias.filter((c) => c.tipo === 'despesa');

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Folder className="w-8 h-8" />
            Categorias
          </h1>
          <p className="text-gray-400">Gerenciar categorias de receitas e despesas</p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Categoria
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total</span>
            <Folder className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-white">{categorias.length}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Receitas</span>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-500">{receitas.length}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Despesas</span>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-red-500">{despesas.length}</p>
        </div>
      </div>

      {showForm && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Criar Nova Categoria</h2>
          <form onSubmit={criarCategoria} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome da Categoria
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Alimentação, Salário, etc."
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTipo('receita')}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${tipo === 'receita'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                >
                  <TrendingUp className="w-5 h-5 inline mr-2" />
                  Receita
                </button>
                <button
                  type="button"
                  onClick={() => setTipo('despesa')}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${tipo === 'despesa'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                >
                  <TrendingDown className="w-5 h-5 inline mr-2" />
                  Despesa
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Criar Categoria
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setNome('');
                }}
                className="px-6 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar categoria..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-11 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="todos">Todos os tipos</option>
            <option value="receita">Receitas</option>
            <option value="despesa">Despesas</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Carregando categorias...</p>
          </div>
        ) : categoriasFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <Folder className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Nenhuma categoria encontrada</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categoriasFiltradas.map((categoria) => (
              <div
                key={categoria.id}
                className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${categoria.tipo === 'receita'
                        ? 'bg-green-500/10'
                        : 'bg-red-500/10'
                        }`}
                    >
                      {categoria.tipo === 'receita' ? (
                        <TrendingUp className="w-5 h-5 text-green-500" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{categoria.nome}</p>
                      <p className="text-xs text-gray-500">ID: {categoria.id}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => abrirDialogDeletar(categoria)}
                    className="text-red-400 cursor-pointer hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${categoria.tipo === 'receita'
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-red-500/20 text-red-300'
                      }`}
                  >
                    {categoria.tipo}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${categoria.ativo
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-gray-500/20 text-gray-400'
                      }`}
                  >
                    {categoria.ativo ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 text-sm text-gray-400 text-center">
          Mostrando {categoriasFiltradas.length} de {categorias.length} categorias
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Tem certeza que deseja deletar a categoria{' '}
              <span className="font-semibold text-white">
                {categoriaParaDeletar?.nome}
              </span>
              ? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2 flex">
            <button
              onClick={() => setDeleteDialogOpen(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={deletarCategoria}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Deletar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
