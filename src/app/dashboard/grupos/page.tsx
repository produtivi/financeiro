'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Search, Edit2, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Usuario {
  id: number;
  nome: string;
  telefone: string | null;
}

interface Grupo {
  id: number;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  criado_em: string;
  usuarios: Usuario[];
}

export default function GruposPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [busca, setBusca] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [grupoParaDeletar, setGrupoParaDeletar] = useState<Grupo | null>(null);

  const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'hkjsaDFSkjSDF39847sfkjdWr23';

  useEffect(() => {
    carregarGrupos();
  }, []);

  const carregarGrupos = async () => {
    try {
      const res = await fetch('/api/v1/grupos', {
        headers: { 'x-api-key': API_KEY },
      });
      const data = await res.json();
      if (data.success) {
        setGrupos(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    } finally {
      setLoading(false);
    }
  };

  const salvarGrupo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editandoId ? `/api/v1/grupos/${editandoId}` : '/api/v1/grupos';
      const method = editandoId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, descricao: descricao || null, ativo: true }),
      });
      const data = await res.json();
      if (data.success) {
        setNome('');
        setDescricao('');
        setShowForm(false);
        setEditandoId(null);
        carregarGrupos();
      }
    } catch (error) {
      console.error('Erro ao salvar grupo:', error);
    }
  };

  const editarGrupo = (grupo: Grupo) => {
    setNome(grupo.nome);
    setDescricao(grupo.descricao || '');
    setEditandoId(grupo.id);
    setShowForm(true);
  };

  const cancelarEdicao = () => {
    setNome('');
    setDescricao('');
    setEditandoId(null);
    setShowForm(false);
  };

  const abrirDialogDeletar = (grupo: Grupo) => {
    setGrupoParaDeletar(grupo);
    setDeleteDialogOpen(true);
  };

  const deletarGrupo = async () => {
    if (!grupoParaDeletar) return;

    try {
      const res = await fetch(`/api/v1/grupos/${grupoParaDeletar.id}`, {
        method: 'DELETE',
        headers: { 'x-api-key': API_KEY },
      });
      const data = await res.json();
      if (data.success) {
        carregarGrupos();
        setDeleteDialogOpen(false);
        setGrupoParaDeletar(null);
      }
    } catch (error) {
      console.error('Erro ao deletar grupo:', error);
    }
  };

  const gruposFiltrados = grupos.filter(
    (g) =>
      g.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (g.descricao && g.descricao.toLowerCase().includes(busca.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Carregando grupos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Users className="w-8 h-8" />
            Grupos
          </h1>
          <p className="text-gray-400">Gerencie os grupos de usuários</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Grupo
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            {editandoId ? 'Editar Grupo' : 'Criar Novo Grupo'}
          </h2>
          <form onSubmit={salvarGrupo} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nome</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descrição (opcional)
              </label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {editandoId ? 'Atualizar' : 'Criar'}
              </button>
              <button
                type="button"
                onClick={cancelarEdicao}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar grupos..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {gruposFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              {busca ? 'Nenhum grupo encontrado' : 'Nenhum grupo cadastrado'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gruposFiltrados.map((grupo) => (
              <div
                key={grupo.id}
                className="bg-gray-800/50 border border-gray-700 rounded-lg p-5 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{grupo.nome}</h3>
                    {grupo.descricao && (
                      <p className="text-sm text-gray-400 mb-2">{grupo.descricao}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editarGrupo(grupo)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => abrirDialogDeletar(grupo)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Deletar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Membros:</span>
                    <span className="font-semibold text-white">{grupo.usuarios.length}</span>
                  </div>
                  {grupo.usuarios.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {grupo.usuarios.slice(0, 3).map((usuario) => (
                        <div key={usuario.id} className="text-xs text-gray-400 flex items-center gap-1">
                          <span>•</span>
                          <span>{usuario.nome || `Usuário #${usuario.id}`}</span>
                          {usuario.telefone && (
                            <span className="text-gray-500">({usuario.telefone})</span>
                          )}
                        </div>
                      ))}
                      {grupo.usuarios.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{grupo.usuarios.length - 3} mais...
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Tem certeza que deseja deletar o grupo{' '}
              <span className="font-semibold text-white">{grupoParaDeletar?.nome}</span>? Esta
              ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setDeleteDialogOpen(false)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={deletarGrupo}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Deletar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
