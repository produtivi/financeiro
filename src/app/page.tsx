import Link from 'next/link';
import { Folder, Users, TrendingUp, BookOpen } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4">Sistema Financeiro</h1>
          <p className="text-gray-400 text-lg">
            Gerenciamento financeiro simples e eficiente
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/categorias"
            className="bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-blue-500 rounded-lg p-8 transition-all"
          >
            <Folder className="w-10 h-10 mb-4 text-blue-400" />
            <h2 className="text-2xl font-bold mb-2">Categorias</h2>
            <p className="text-gray-400">Gerenciar categorias de receitas e despesas</p>
          </Link>

          <Link
            href="/usuarios"
            className="bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-green-500 rounded-lg p-8 transition-all"
          >
            <Users className="w-10 h-10 mb-4 text-green-400" />
            <h2 className="text-2xl font-bold mb-2">Usuários</h2>
            <p className="text-gray-400">Gerenciar usuários do sistema</p>
          </Link>

          <Link
            href="/transacoes"
            className="bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-yellow-500 rounded-lg p-8 transition-all"
          >
            <TrendingUp className="w-10 h-10 mb-4 text-yellow-400" />
            <h2 className="text-2xl font-bold mb-2">Transações</h2>
            <p className="text-gray-400">Registrar receitas e despesas</p>
          </Link>

          <Link
            href="/api-docs"
            className="bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-purple-500 rounded-lg p-8 transition-all"
          >
            <BookOpen className="w-10 h-10 mb-4 text-purple-400" />
            <h2 className="text-2xl font-bold mb-2">API Docs</h2>
            <p className="text-gray-400">Documentação Swagger da API</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
