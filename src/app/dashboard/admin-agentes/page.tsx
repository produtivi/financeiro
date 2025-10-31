'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Link as LinkIcon, Plus, Trash2, Shield } from 'lucide-react';
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
  agentes: Vinculo[];
}

interface Vinculo {
  id: number;
  agent_id: number;
  criado_em: string;
}

export default function AdminAgentesPage() {
  const { data: session } = useSession();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [adminSelecionado, setAdminSelecionado] = useState<number | null>(null);
  const [agentId, setAgentId] = useState('');

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
        setAdmins(data.data.filter((a: Admin) => a.role !== 'master'));
      }
    } catch (error) {
      console.error('Erro ao carregar admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirDialog = (adminId: number) => {
    setAdminSelecionado(adminId);
    setAgentId('');
    setDialogOpen(true);
  };

  const salvar = async () => {
    if (!adminSelecionado || !agentId) return;

    try {
      const res = await fetch('/api/v1/admin-agentes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_id: adminSelecionado,
          agent_id: parseInt(agentId),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || 'Erro ao criar vínculo');
        return;
      }

      setDialogOpen(false);
      carregarAdmins();
    } catch (error) {
      alert('Erro ao criar vínculo');
    }
  };

  const deletarVinculo = async (vinculoId: number) => {
    if (!confirm('Tem certeza que deseja remover este vínculo?')) return;

    try {
      const res = await fetch(`/api/v1/admin-agentes/${vinculoId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error();
      carregarAdmins();
    } catch (error) {
      alert('Erro ao deletar vínculo');
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
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <LinkIcon className="w-8 h-8" />
          Vínculos Admin-Agente
        </h1>
        <p className="text-gray-400">Gerencie quais agentes cada admin pode acessar</p>
      </div>

      <div className="grid gap-4">
        {admins.map((admin) => (
          <div key={admin.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{admin.nome}</h3>
                <p className="text-gray-400 text-sm">{admin.email}</p>
                <span
                  className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                    admin.role === 'admin'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {admin.role.toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => abrirDialog(admin.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar Agente
              </button>
            </div>

            {admin.agentes.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhum agente vinculado</p>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-300 font-semibold text-sm mb-2">
                  Agentes vinculados ({admin.agentes.length}):
                </p>
                {admin.agentes.map((vinculo) => (
                  <div
                    key={vinculo.id}
                    className="flex justify-between items-center bg-gray-800/50 rounded-lg px-4 py-3"
                  >
                    <div>
                      <p className="text-white font-medium">Agent ID: {vinculo.agent_id}</p>
                      <p className="text-gray-400 text-xs">
                        Vinculado em {new Date(vinculo.criado_em).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <button
                      onClick={() => deletarVinculo(vinculo.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {admins.length === 0 && (
          <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-xl">
            <p className="text-gray-400">Nenhum admin encontrado (exceto masters)</p>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Adicionar Vínculo</DialogTitle>
            <DialogDescription className="text-gray-400">
              Vincule um agente a este admin
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Agent ID</label>
              <input
                type="number"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                placeholder="Ex: 123"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
              />
              <p className="text-gray-500 text-xs mt-1">
                Informe o ID do agente que deseja vincular
              </p>
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
              Vincular
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
