'use client';

import { useState, useEffect } from 'react';
import { FileText, Users, BarChart3, Calendar, TrendingUp } from 'lucide-react';

interface Usuario {
  id: number;
  nome: string;
  chat_id: number;
  telefone?: string;
}

interface Questionario {
  id: number;
  usuario_id: number;
  resposta_1: string;
  resposta_2: string;
  resposta_3: string;
  resposta_4: string;
  resposta_5: string;
  resposta_6: string;
  resposta_7: string;
  resposta_8: string;
  resposta_9: string;
  resposta_10: string;
  resposta_11?: string;
  resposta_12: string;
  criado_em: string;
  usuario: Usuario;
}

interface Metricas {
  total: number;
  distribuicao_por_pergunta: Record<string, Record<string, number>>;
}

const PERGUNTAS = {
  1: 'Comparação renda/gastos',
  2: 'Estresse financeiro',
  3: 'Redução padrão de vida',
  4: 'Aperto financeiro',
  5: 'Controle de gastos',
  6: 'Capacidade de poupar',
  7: 'Cumprimento de metas',
  8: 'Anota receitas/despesas',
  9: 'Frequência de registro',
  10: 'Estabelece metas',
  11: 'Acompanhamento de metas (aberta)',
  12: 'Nível de confiança',
};

export default function QuestionariosPage() {
  const [questionarios, setQuestionarios] = useState<Questionario[]>([]);
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'lista' | 'metricas'>('lista');
  const [usuarioFiltro, setUsuarioFiltro] = useState('');

  const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'hkjsaDFSkjSDF39847sfkjdWr23';

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [resQuestionarios, resMetricas] = await Promise.all([
        fetch('/api/v1/questionarios', {
          headers: { 'x-api-key': API_KEY },
        }),
        fetch('/api/v1/questionarios/metricas', {
          headers: { 'x-api-key': API_KEY },
        }),
      ]);

      const dataQuestionarios = await resQuestionarios.json();
      const dataMetricas = await resMetricas.json();

      if (dataQuestionarios.success) {
        setQuestionarios(dataQuestionarios.data);
      }
      if (dataMetricas.success) {
        setMetricas(dataMetricas.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const questionariosFiltrados = questionarios.filter((q) =>
    usuarioFiltro
      ? q.usuario.nome?.toLowerCase().includes(usuarioFiltro.toLowerCase()) ||
        q.usuario.chat_id.toString().includes(usuarioFiltro)
      : true
  );

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Carregando questionários...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <FileText className="w-8 h-8" />
          Questionários
        </h1>
        <p className="text-gray-400">Acompanhe as respostas dos usuários</p>
      </div>

      <div className="flex gap-2 bg-gray-900 border border-gray-800 rounded-xl p-2 w-fit">
        <button
          onClick={() => setView('lista')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === 'lista'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <Users className="w-5 h-5 inline mr-2" />
          Por Usuário
        </button>
        <button
          onClick={() => setView('metricas')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === 'metricas'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          <BarChart3 className="w-5 h-5 inline mr-2" />
          Métricas Gerais
        </button>
      </div>

      {view === 'lista' ? (
        <>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Buscar por nome ou chat_id..."
                value={usuarioFiltro}
                onChange={(e) => setUsuarioFiltro(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {questionariosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  {usuarioFiltro
                    ? 'Nenhum questionário encontrado'
                    : 'Nenhum questionário respondido ainda'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {questionariosFiltrados.map((q) => (
                  <div
                    key={q.id}
                    className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue-400" />
                          {q.usuario.nome || `Usuário #${q.usuario.id}`}
                        </h3>
                        <div className="flex gap-4 mt-1 text-sm text-gray-400">
                          <span>Chat ID: {q.usuario.chat_id}</span>
                          {q.usuario.telefone && <span>Tel: {q.usuario.telefone}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Calendar className="w-4 h-4" />
                          {formatarData(q.criado_em)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                      {Object.entries(PERGUNTAS).map(([num, texto]) => {
                        const resposta = (q as Record<string, string | null>)[`resposta_${num}`];
                        return (
                          <div key={num} className="bg-gray-900/50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">{texto}</p>
                            <p className="text-white text-sm">{resposta || '-'}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-400" />
                Resumo Geral
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Total de Respostas</p>
                  <p className="text-3xl font-bold text-white">{metricas?.total || 0}</p>
                </div>
              </div>
            </div>

            {metricas && metricas.total > 0 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Distribuição por Pergunta
                </h3>
                {Object.entries(metricas.distribuicao_por_pergunta).map(
                  ([pergunta, respostas]) => {
                    const numPergunta = parseInt(pergunta.replace('pergunta_', ''), 10) as keyof typeof PERGUNTAS;
                    const totalRespostas = Object.values(respostas).reduce(
                      (a, b) => a + b,
                      0
                    );

                    return (
                      <div key={pergunta} className="bg-gray-800/50 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-3">
                          {numPergunta}. {PERGUNTAS[numPergunta]}
                        </h4>
                        <div className="space-y-2">
                          {Object.entries(respostas)
                            .sort(([, a], [, b]) => b - a)
                            .map(([resposta, count]) => {
                              const percentual =
                                totalRespostas > 0 ? (count / totalRespostas) * 100 : 0;

                              return (
                                <div key={resposta}>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-300">{resposta}</span>
                                    <span className="text-gray-400">
                                      {count} ({percentual.toFixed(1)}%)
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                      className="bg-blue-500 h-2 rounded-full"
                                      style={{ width: `${percentual}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
