'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Shield, Plus, Edit2, Trash2, UserCheck, UserX } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Admin {
  id: number;
  nome: string;
  email: string;
  role: string;
  ativo: boolean;
  criado_em: string;
  agentes: { id: number; agent_id: number }[];
}

export default function AdminsPage() {
  const { data: session } = useSession();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<Admin | null>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [role, setRole] = useState<'master' | 'admin' | 'user'>('user');

  useEffect(() => {
    if (session?.user?.role === 'master') {
      carregarAdmins();
    }
  }, [session]);

  const carregarAdmins = async () => {
    try {
      const res = await fetch('/api/v1/admins');
      const data = await res.json();
      if (data.success) {
        setAdmins(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirDialogNovo = () => {
    setEditando(null);
    setNome('');
    setEmail('');
    setSenha('');
    setRole('user');
    setDialogOpen(true);
  };

  const abrirDialogEditar = (admin: Admin) => {
    setEditando(admin);
    setNome(admin.nome);
    setEmail(admin.email);
    setSenha('');
    setRole(admin.role as 'master' | 'admin' | 'user');
    setDialogOpen(true);
  };

  const salvar = async () => {
    try {
      const payload: any = { nome, email, role };
      if (senha) payload.senha = senha;

      if (editando) {
        const res = await fetch(`/api/v1/admins/${editando.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
      } else {
        if (!senha) {
          alert('Senha é obrigatória para novos admins');
          return;
        }
        const res = await fetch('/api/v1/admins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
      }

      setDialogOpen(false);
      carregarAdmins();
    } catch (error) {
      alert('Erro ao salvar admin');
    }
  };

  const deletar = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar este admin?')) return;

    try {
      const res = await fetch(`/api/v1/admins/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error();
      carregarAdmins();
    } catch (error) {
      alert('Erro ao deletar admin');
    }
  };

  if (session?.user?.role !== 'master') {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <p className="text-gray-400 text-lg">Acesso negado. Apenas masters podem acessar esta página.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8" />
            Gerenciar Admins
          </h1>
          <p className="text-gray-400">Crie e gerencie administradores do sistema</p>
        </div>
        <button
          onClick={abrirDialogNovo}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Admin
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="text-left px-6 py-3 text-gray-300 font-semibold">Nome</th>
              <th className="text-left px-6 py-3 text-gray-300 font-semibold">Email</th>
              <th className="text-left px-6 py-3 text-gray-300 font-semibold">Role</th>
              <th className="text-left px-6 py-3 text-gray-300 font-semibold">Status</th>
              <th className="text-left px-6 py-3 text-gray-300 font-semibold">Agentes</th>
              <th className="text-right px-6 py-3 text-gray-300 font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                <td className="px-6 py-4 text-white">{admin.nome}</td>
                <td className="px-6 py-4 text-gray-400">{admin.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      admin.role === 'master'
                        ? 'bg-purple-500/20 text-purple-400'
                        : admin.role === 'admin'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {admin.role.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {admin.ativo ? (
                    <UserCheck className="w-5 h-5 text-green-400" />
                  ) : (
                    <UserX className="w-5 h-5 text-red-400" />
                  )}
                </td>
                <td className="px-6 py-4 text-gray-400">
                  {admin.agentes.length} vínculo(s)
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => abrirDialogEditar(admin)}
                    className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deletar(admin.id)}
                    className="text-red-400 hover:text-red-300 inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar Admin' : 'Novo Admin'}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {editando ? 'Atualize os dados do admin' : 'Crie um novo administrador'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nome</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Senha {editando && '(deixe vazio para não alterar)'}
              </label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'master' | 'admin' | 'user')}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="master">Master</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => setDialogOpen(false)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={salvar}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Salvar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
