'use client';

import { useState, useEffect } from 'react';
import { FileText, Users, BarChart3, Calendar, TrendingUp, Download, Search } from 'lucide-react';

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
  resposta_13: string;
  criado_em: string;
  usuario: Usuario;
  [key: string]: string | number | Usuario | undefined;
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
  12: 'Separa dinheiro pessoal do negócio',
  13: 'Nível de confiança',
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

  const exportarDados = async () => {
    try {
      const response = await fetch('/api/v1/questionarios/exportar', {
        headers: { 'x-api-key': API_KEY },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `questionarios-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erro ao exportar questionários:', error);
      alert('Erro ao exportar questionários');
    }
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

      <div className="flex gap-4 items-center">
        <div className="flex gap-2 bg-gray-900 border border-gray-800 rounded-xl p-2">
          <button
            onClick={() => setView('lista')}
            className={`px-4 py-2 rounded-lg transition-colors ${view === 'lista'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
          >
            <Users className="w-5 h-5 inline mr-2" />
            Por Usuário
          </button>
          <button
            onClick={() => setView('metricas')}
            className={`px-4 py-2 rounded-lg transition-colors ${view === 'metricas'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
          >
            <BarChart3 className="w-5 h-5 inline mr-2" />
            Métricas Gerais
          </button>
        </div>

        <button
          onClick={exportarDados}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          Exportar Questionários
        </button>
      </div>

      {view === 'lista' ? (
        <>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou chat_id..."
                  value={usuarioFiltro}
                  onChange={(e) => setUsuarioFiltro(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
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
              <div className="space-y-6">
                {questionariosFiltrados.map((q) => (
                  <div
                    key={q.id}
                    className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-all shadow-lg"
                  >
                    <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-700">
                      <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-400" />
                          </div>
                          {q.usuario.nome || `Usuário #${q.usuario.id}`}
                        </h3>
                        <div className="flex gap-4 mt-2 text-sm text-gray-400 ml-13">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                            Chat ID: {q.usuario.chat_id}
                          </span>
                          {q.usuario.telefone && (
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                              Tel: {q.usuario.telefone}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg border border-gray-700">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          <span className="text-sm text-gray-300">{formatarData(q.criado_em)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {Object.entries(PERGUNTAS).map(([num, texto]) => {
                        const respostaValue = q[`resposta_${num}`];
                        const resposta = typeof respostaValue === 'string' ? respostaValue : '-';
                        return (
                          <div
                            key={num}
                            className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 hover:bg-gray-800/80 hover:border-blue-500/30 transition-all"
                          >
                            <div className="flex items-start gap-2">
                              <span className="flex-shrink-0 w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 text-xs font-bold">
                                {num}
                              </span>
                              <div className="flex-1">
                                <p className="text-xs text-gray-400 mb-2 font-medium">{texto}</p>
                                <p className="text-white text-sm font-medium leading-relaxed">
                                  {resposta || '-'}
                                </p>
                              </div>
                            </div>
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
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                Resumo Geral
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-blue-300 font-medium">Total de Respostas</p>
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-4xl font-bold text-white">{metricas?.total || 0}</p>
                  <p className="text-xs text-gray-400 mt-2">Questionários respondidos</p>
                </div>
              </div>
            </div>

            {metricas && metricas.total > 0 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                  Distribuição por Pergunta
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  {Object.entries(metricas.distribuicao_por_pergunta).map(
                    ([pergunta, respostas]) => {
                      const numPergunta = parseInt(pergunta.replace('pergunta_', ''), 10) as keyof typeof PERGUNTAS;
                      const totalRespostas = Object.values(respostas).reduce(
                        (a, b) => a + b,
                        0
                      );

                      return (
                        <div
                          key={pergunta}
                          className="bg-gradient-to-br from-gray-800 to-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-lg"
                        >
                          <div className="flex items-start gap-3 mb-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-400 text-sm font-bold">
                              {numPergunta}
                            </span>
                            <h4 className="text-white font-semibold text-lg">
                              {PERGUNTAS[numPergunta]}
                            </h4>
                          </div>
                          <div className="space-y-3 ml-11">
                            {Object.entries(respostas)
                              .sort(([, a], [, b]) => b - a)
                              .map(([resposta, count], index) => {
                                const percentual =
                                  totalRespostas > 0 ? (count / totalRespostas) * 100 : 0;
                                const barColors = [
                                  'bg-blue-500',
                                  'bg-purple-500',
                                  'bg-green-500',
                                  'bg-orange-500',
                                  'bg-pink-500',
                                ];
                                const barColor = barColors[index % barColors.length];

                                return (
                                  <div key={resposta} className="group">
                                    <div className="flex justify-between text-sm mb-2">
                                      <span className="text-gray-300 font-medium group-hover:text-white transition-colors">
                                        {resposta}
                                      </span>
                                      <span className="text-gray-400 font-semibold">
                                        {count} ({percentual.toFixed(1)}%)
                                      </span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                                      <div
                                        className={`${barColor} h-3 rounded-full transition-all duration-500 ease-out`}
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
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
