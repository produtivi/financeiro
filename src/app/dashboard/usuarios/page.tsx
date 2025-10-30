'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Search, Filter, UserCheck, UserX, Eye, Edit2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Grupo {
  id: number;
  nome: string;
}

interface Usuario {
  id: number;
  chat_id: number;
  agent_id: number;
  nome?: string;
  telefone?: string;
  grupo_id?: number;
  grupo?: Grupo;
  status: string;
  criado_em: string;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [busca, setBusca] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [telefoneEdit, setTelefoneEdit] = useState('');
  const [grupoIdEdit, setGrupoIdEdit] = useState<number | null>(null);

  const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'hkjsaDFSkjSDF39847sfkjdWr23';

  useEffect(() => {
    carregarUsuarios();
    carregarGrupos();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const abrirDialogEditar = (usuario: Usuario) => {
    setUsuarioEditando(usuario);
    setTelefoneEdit(usuario.telefone || '');
    setGrupoIdEdit(usuario.grupo_id || null);
    setEditDialogOpen(true);
  };

  const salvarEdicao = async () => {
    if (!usuarioEditando) return;

    try {
      const payload: { telefone?: string | null; grupo_id?: number | null } = {};

      if (telefoneEdit !== usuarioEditando.telefone) {
        payload.telefone = telefoneEdit || null;
      }

      if (grupoIdEdit !== usuarioEditando.grupo_id) {
        payload.grupo_id = grupoIdEdit === null ? null : Number(grupoIdEdit);
      }

      const res = await fetch(`/api/v1/usuarios/${usuarioEditando.id}`, {
        method: 'PUT',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        carregarUsuarios();
        setEditDialogOpen(false);
        setUsuarioEditando(null);
      } else {
        console.error('Erro do backend:', data);
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    }
  };

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const matchStatus = filtroStatus === 'todos' || usuario.status === filtroStatus;
    const matchBusca =
      busca === '' ||
      usuario.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      usuario.id.toString().includes(busca) ||
      usuario.chat_id.toString().includes(busca);

    return matchStatus && matchBusca;
  });

  const estatisticas = {
    total: usuarios.length,
    ativos: usuarios.filter((u) => u.status === 'active').length,
    inativos: usuarios.filter((u) => u.status === 'inactive').length,
    comGrupo: usuarios.filter((u) => u.grupo_id !== null).length,
    semGrupo: usuarios.filter((u) => u.grupo_id === null).length,
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Users className="w-8 h-8" />
          Usuários
        </h1>
        <p className="text-gray-400">Gerenciar usuários do sistema Impact Hub</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total</span>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-white">{estatisticas.total}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Ativos</span>
            <UserCheck className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-500">{estatisticas.ativos}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Inativos</span>
            <UserX className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-red-500">{estatisticas.inativos}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Com Grupo</span>
              <span className="text-sm font-bold text-indigo-300">{estatisticas.comGrupo}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Sem Grupo</span>
              <span className="text-sm font-bold text-gray-300">{estatisticas.semGrupo}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, ID ou chat_id..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-11 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="todos">Todos status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Carregando usuários...</p>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Nenhum usuário encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Nome</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Telefone</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Grupo</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Chat ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((usuario) => (
                  <tr
                    key={usuario.id}
                    className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="py-4 px-4 text-white font-mono">#{usuario.id}</td>
                    <td className="py-4 px-4">
                      <p className="text-white font-medium">
                        {usuario.nome || `Usuário #${usuario.id}`}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-gray-400">
                      {usuario.telefone || '-'}
                    </td>
                    <td className="py-4 px-4">
                      {usuario.grupo ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300">
                          {usuario.grupo.nome}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">Sem grupo</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-gray-400 font-mono">{usuario.chat_id}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          usuario.status === 'active'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}
                      >
                        {usuario.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => abrirDialogEditar(usuario)}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/dashboard/usuarios/${usuario.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 text-sm text-gray-400">
              Mostrando {usuariosFiltrados.length} de {usuarios.length} usuários
            </div>
          </div>
        )}
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Usuário</DialogTitle>
            <DialogDescription className="text-gray-400">
              Atualize o telefone e grupo do usuário{' '}
              <span className="font-semibold text-white">
                {usuarioEditando?.nome || `Usuário #${usuarioEditando?.id}`}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Telefone</label>
              <input
                type="text"
                value={telefoneEdit}
                onChange={(e) => setTelefoneEdit(e.target.value)}
                placeholder="(00) 00000-0000"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Grupo</label>
              <select
                value={grupoIdEdit || ''}
                onChange={(e) => setGrupoIdEdit(e.target.value ? Number(e.target.value) : null)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Sem grupo</option>
                {grupos.map((grupo) => (
                  <option key={grupo.id} value={grupo.id}>
                    {grupo.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setEditDialogOpen(false)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={salvarEdicao}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Salvar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
