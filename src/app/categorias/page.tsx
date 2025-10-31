'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Folder, Trash2, Plus } from 'lucide-react';

interface Categoria {
  id: number;
  nome: string;
  tipo: 'receita' | 'despesa';
  ativo: boolean;
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<'receita' | 'despesa'>('receita');

  const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'hkjsaDFSkjSDF39847sfkjdWr23';

  useEffect(() => {
    carregarCategorias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        carregarCategorias();
      }
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
    }
  };

  const deletarCategoria = async (id: number) => {
    if (!confirm('Deseja deletar esta categoria?')) return;
    try {
      const res = await fetch(`/api/v1/categorias/${id}`, {
        method: 'DELETE',
        headers: { 'x-api-key': API_KEY },
      });
      const data = await res.json();
      if (data.success) {
        carregarCategorias();
      }
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
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
          <Folder className="w-8 h-8 text-blue-400" />
          <h1 className="text-4xl font-bold">Categorias</h1>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nova Categoria
          </h2>
          <form onSubmit={criarCategoria} className="space-y-4">
            <div>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome da categoria"
                required
                className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white"
              />
            </div>
            <div>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as 'receita' | 'despesa')}
                className="w-full bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white"
              >
                <option value="receita">Receita</option>
                <option value="despesa">Despesa</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-semibold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Criar
            </button>
          </form>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4">Lista de Categorias</h2>
          {loading ? (
            <p className="text-gray-400">Carregando...</p>
          ) : (
            <div className="space-y-2">
              {categorias.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between bg-gray-900/50 p-4 rounded"
                >
                  <div>
                    <span className="font-semibold">{cat.nome}</span>
                    <span
                      className={`ml-3 text-xs px-2 py-1 rounded ${
                        cat.tipo === 'receita'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {cat.tipo}
                    </span>
                  </div>
                  <button
                    onClick={() => deletarCategoria(cat.id)}
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
