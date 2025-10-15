'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Trash2, Plus, UserPlus } from 'lucide-react';

interface Usuario {
  id: number;
  chat_id: number;
  agent_id: number;
  nome?: string;
  status: string;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatId, setChatId] = useState('');
  const [agentId, setAgentId] = useState('');
  const [nome, setNome] = useState('');

  const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'hkjsaDFSkjSDF39847sfkjdWr23';

  useEffect(() => {
    carregarUsuarios();
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

  const criarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/usuarios', {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: Number(chatId),
          agent_id: Number(agentId),
          nome: nome || undefined,
          status: 'active',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setChatId('');
        setAgentId('');
        setNome('');
        carregarUsuarios();
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
    }
  };

  const deletarUsuario = async (id: number) => {
    if (!confirm('Deseja deletar este usuário?')) return;
    try {
      const res = await fetch(`/api/v1/usuarios/${id}`, {
        method: 'DELETE',
        headers: { 'x-api-key': API_KEY },
      });
      const data = await res.json();
      if (data.success) {
        carregarUsuarios();
      }
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-400 hover:underline flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <Users className="w-8 h-8 text-green-400" />
          <h1 className="text-4xl font-bold">Usuários</h1>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Novo Usuário
          </h2>
          <form onSubmit={criarUsuario} className="space-y-4">
            <div>
              <input
                type="number"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="Chat ID"
                required
                className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white"
              />
            </div>
            <div>
              <input
                type="number"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                placeholder="Agent ID"
                required
                className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white"
              />
            </div>
            <div>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome (opcional)"
                className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white"
              />
            </div>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded font-semibold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Criar
            </button>
          </form>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4">Lista de Usuários</h2>
          {loading ? (
            <p className="text-gray-400">Carregando...</p>
          ) : (
            <div className="space-y-2">
              {usuarios.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between bg-gray-900/50 p-4 rounded"
                >
                  <div>
                    <div className="font-semibold">{user.nome || `Usuário #${user.id}`}</div>
                    <div className="text-sm text-gray-400">
                      Chat: {user.chat_id} | Agent: {user.agent_id}
                    </div>
                  </div>
                  <button
                    onClick={() => deletarUsuario(user.id)}
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
