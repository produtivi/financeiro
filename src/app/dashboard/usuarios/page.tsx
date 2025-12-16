'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Search, Filter, UserCheck, UserX, Eye, Edit2, Upload, FileSpreadsheet, Download, MessageSquare, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { read, utils, write } from 'xlsx';

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
  respondeu_questionario: boolean;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroQuestionario, setFiltroQuestionario] = useState('todos');
  const [filtroChatId, setFiltroChatId] = useState('todos');
  const [busca, setBusca] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [telefoneEdit, setTelefoneEdit] = useState('');
  const [grupoIdEdit, setGrupoIdEdit] = useState<number | null>(null);

  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [resultadoDialogOpen, setResultadoDialogOpen] = useState(false);
  const [dadosPreview, setDadosPreview] = useState<any[]>([]);
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const [importando, setImportando] = useState(false);
  const [resultadoImportacao, setResultadoImportacao] = useState<any>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [usuarioDeletando, setUsuarioDeletando] = useState<Usuario | null>(null);
  const [deletando, setDeletando] = useState(false);

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
    const matchQuestionario =
      filtroQuestionario === 'todos' ||
      (filtroQuestionario === 'respondidas' && usuario.respondeu_questionario) ||
      (filtroQuestionario === 'nao_respondidas' && !usuario.respondeu_questionario);
    const matchChatId =
      filtroChatId === 'todos' ||
      (filtroChatId === 'com_chat' && usuario.chat_id !== null) ||
      (filtroChatId === 'sem_chat' && usuario.chat_id === null);
    const matchBusca =
      busca === '' ||
      usuario.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      usuario.telefone?.toLowerCase().includes(busca.toLowerCase()) ||
      usuario.id.toString().includes(busca);

    return matchStatus && matchQuestionario && matchChatId && matchBusca;
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

  const converterGrupoIdParaNome = (grupoId: number): string => {
    const mapa: { [key: number]: string } = {
      1: 'Controle',
      2: 'Informativo/Formal',
      3: 'Padrão/Acolhedor',
    };
    return mapa[grupoId] || `Grupo ${grupoId}`;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setArquivoSelecionado(file);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = read(arrayBuffer);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const dados = utils.sheet_to_json(worksheet);

      setDadosPreview(dados);
      setImportDialogOpen(false);
      setPreviewDialogOpen(true);
    } catch (error) {
      console.error('Erro ao ler arquivo:', error);
      alert('Erro ao ler o arquivo. Verifique se é um arquivo CSV ou Excel válido.');
    }
  };

  const confirmarImportacao = async () => {
    if (!arquivoSelecionado) return;

    setImportando(true);
    try {
      const formData = new FormData();
      formData.append('file', arquivoSelecionado);

      const res = await fetch('/api/v1/usuarios/importar', {
        method: 'POST',
        headers: { 'x-api-key': API_KEY },
        body: formData,
      });

      const data = await res.json();
      setResultadoImportacao(data);
      setPreviewDialogOpen(false);
      setResultadoDialogOpen(true);

      if (data.success) {
        carregarUsuarios();
      }
    } catch (error) {
      console.error('Erro ao importar:', error);
      alert('Erro ao importar usuários');
    } finally {
      setImportando(false);
      setArquivoSelecionado(null);
    }
  };

  const baixarModeloCSV = () => {
    const csvContent = 'nome,telefone,grupo_id,agent_id\nJoão Silva,11999999999,1,1\nMaria Santos,11988888888,,1\nPedro Costa,11977777777,3,1\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'modelo-importacao-usuarios.csv';
    link.click();
  };

  const exportarTabela = () => {
    const dadosExportacao = usuariosFiltrados.map((usuario) => ({
      ID: usuario.id,
      Nome: usuario.nome || `Usuário #${usuario.id}`,
      Telefone: usuario.telefone || '-',
      Grupo: usuario.grupo ? usuario.grupo.nome : 'Sem grupo',
      'Respondeu Questionário': usuario.respondeu_questionario ? 'Sim' : 'Não',
      Status: usuario.status === 'active' ? 'Ativo' : 'Inativo',
      'Chat ID': usuario.chat_id || '-',
      'Agent ID': usuario.agent_id || '-',
      'Criado em': formatarData(usuario.criado_em),
    }));

    const worksheet = utils.json_to_sheet(dadosExportacao);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Usuários');

    const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const dataAtual = new Date().toISOString().split('T')[0];
    link.download = `usuarios-${dataAtual}.xlsx`;
    link.click();
  };

  const abrirDialogDeletar = (usuario: Usuario) => {
    setUsuarioDeletando(usuario);
    setDeleteDialogOpen(true);
  };

  const confirmarDelecao = async () => {
    if (!usuarioDeletando) return;

    setDeletando(true);
    try {
      const res = await fetch(`/api/v1/usuarios/${usuarioDeletando.id}`, {
        method: 'DELETE',
        headers: {
          'x-api-key': API_KEY,
        },
      });

      const data = await res.json();

      if (data.success) {
        carregarUsuarios();
        setDeleteDialogOpen(false);
        setUsuarioDeletando(null);
      } else {
        alert('Erro ao deletar usuário: ' + (data.message || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      alert('Erro ao deletar usuário');
    } finally {
      setDeletando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Users className="w-8 h-8" />
            Usuários
          </h1>
          <p className="text-gray-400">Gerenciar usuários do sistema Impact Hub</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportarTabela}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
          <button
            onClick={() => setImportDialogOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Upload className="w-4 h-4" />
            Importar Usuários
          </button>
        </div>
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
              placeholder="Buscar por nome, telefone ou ID..."
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
            <select
              value={filtroQuestionario}
              onChange={(e) => setFiltroQuestionario(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="todos">Todos questionários</option>
              <option value="respondidas">Apenas respondidas</option>
              <option value="nao_respondidas">Apenas não respondidas</option>
            </select>
            <select
              value={filtroChatId}
              onChange={(e) => setFiltroChatId(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="todos">Todos chats</option>
              <option value="com_chat">Apenas com chat</option>
              <option value="sem_chat">Apenas sem chat</option>
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
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Questionário</th>
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
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${usuario.respondeu_questionario
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-gray-500/20 text-gray-300'
                          }`}
                      >
                        {usuario.respondeu_questionario ? 'Sim' : 'Não'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${usuario.status === 'active'
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
                        {usuario.chat_id && (
                          <a
                            href={`https://app.produtive.ai/agent/437/chat/${usuario.chat_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => abrirDialogDeletar(usuario)}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Importar Usuários
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Faça upload de um arquivo CSV ou Excel com os dados dos usuários
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-300 mb-2">Formato do arquivo</h4>
              <p className="text-xs text-gray-400 mb-2">
                O arquivo deve conter as colunas: <span className="font-mono text-white">nome</span>,{' '}
                <span className="font-mono text-white">telefone</span>,{' '}
                <span className="font-mono text-white">grupo_id</span> (opcional),{' '}
                <span className="font-mono text-white">agent_id</span>
              </p>
              <p className="text-xs text-gray-400 mb-2">
                <strong className="text-blue-300">IDs dos grupos:</strong> 1 = Controle, 2 = Informativo/Formal, 3 = Padrão/Acolhedor
              </p>
              <p className="text-xs text-gray-400 mb-3">
                <strong className="text-blue-300">Nota:</strong> Deixe o grupo_id vazio para criar usuários sem grupo. Se um usuário já existir e o grupo_id vier vazio, o grupo será removido.
              </p>
              <button
                onClick={baixarModeloCSV}
                className="inline-flex items-center gap-2 text-xs bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded transition-colors"
              >
                <Download className="w-3 h-3" />
                Baixar modelo CSV
              </button>
            </div>

            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <Upload className="w-12 h-12 text-gray-500" />
                <div>
                  <p className="text-white font-medium">Clique para selecionar arquivo</p>
                  <p className="text-xs text-gray-500 mt-1">CSV ou Excel (.xlsx, .xls)</p>
                </div>
              </label>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen} >
        <DialogContent className="bg-gray-900  border-gray-800 min-w-[80vw] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-white">Preview da Importação</DialogTitle>
            <DialogDescription className="text-gray-400">
              Revise os dados antes de confirmar a importação ({dadosPreview.length} registros)
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto flex-1 py-4">
            <table className="w-full text-sm">
              <thead className="sticky -top-4 bg-gray-900">
                <tr className="border-b border-gray-800">
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Nome</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Telefone</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Grupo</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Agent ID</th>
                </tr>
              </thead>
              <tbody>
                {dadosPreview.map((item: any, index: number) => (
                  <tr key={index} className="border-b border-gray-800/50">
                    <td className="py-2 px-3 text-white">{item.nome}</td>
                    <td className="py-2 px-3 text-gray-300">{item.telefone}</td>
                    <td className="py-2 px-3 text-gray-300">
                      {item.grupo_id ? converterGrupoIdParaNome(Number(item.grupo_id)) : '-'}
                    </td>
                    <td className="py-2 px-3 text-gray-300">{item.agent_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DialogFooter>
            <button
              onClick={() => setPreviewDialogOpen(false)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              disabled={importando}
            >
              Cancelar
            </button>
            <button
              onClick={confirmarImportacao}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              disabled={importando}
            >
              {importando ? 'Importando...' : 'Confirmar Importação'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resultadoDialogOpen} onOpenChange={setResultadoDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Resultado da Importação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {resultadoImportacao?.success ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <p className="text-xs text-gray-400 mb-1">Criados</p>
                    <p className="text-2xl font-bold text-green-400">{resultadoImportacao.data.criados}</p>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-xs text-gray-400 mb-1">Atualizados</p>
                    <p className="text-2xl font-bold text-blue-400">{resultadoImportacao.data.atualizados}</p>
                  </div>
                </div>

                {resultadoImportacao.data.erros.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-red-300 mb-2">
                      Erros ({resultadoImportacao.data.erros.length})
                    </h4>
                    <div className="max-h-40 overflow-auto space-y-2">
                      {resultadoImportacao.data.erros.map((erro: any, index: number) => (
                        <div key={index} className="text-xs text-gray-300">
                          <span className="font-mono text-red-400">Linha {erro.linha}:</span> {erro.erro}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-300">{resultadoImportacao?.message}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <button
              onClick={() => setResultadoDialogOpen(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Fechar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Você está prestes a deletar o usuário{' '}
              <span className="font-semibold text-white">
                {usuarioDeletando?.nome || `#${usuarioDeletando?.id}`}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-sm text-red-300 font-medium mb-2">⚠️ Atenção</p>
              <p className="text-sm text-gray-300">
                Esta ação não pode ser desfeita. Todos os dados do usuário serão permanentemente removidos do sistema.
              </p>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setDeleteDialogOpen(false)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              disabled={deletando}
            >
              Cancelar
            </button>
            <button
              onClick={confirmarDelecao}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              disabled={deletando}
            >
              {deletando ? 'Deletando...' : 'Confirmar Exclusão'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
