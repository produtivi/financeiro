import { prisma } from '@/lib/prisma';
import { uploadToSpaces } from '@/lib/spaces';
import {
  gerarDashboardGeral,
  gerarGraficoPizza,
  gerarGraficoBarras,
  gerarGraficoComparativo,
  DadosGrafico,
  DadosRelatorio
} from '@/lib/chart-generator';
import { Decimal } from '@prisma/client/runtime/library';

interface FiltrosRelatorio {
  usuario_id: number;
  data_inicio: string;
  data_fim: string;
  tipo_grafico: 'geral' | 'pizza_receitas' | 'pizza_despesas' | 'barras_despesas' | 'comparativo' | 'categorias_especificas';
  categorias_ids?: number[];
  titulo?: string;
  formato?: 'png' | 'jpg';
}

interface TransacaoAgrupada {
  categoria: {
    nome: string;
  };
  _sum: {
    valor: Decimal | null;
  };
}

export const relatorioService = {
  async gerarRelatorio(filtros: FiltrosRelatorio) {
    const {
      usuario_id,
      data_inicio,
      data_fim,
      tipo_grafico,
      categorias_ids,
      titulo,
      formato = 'png'
    } = filtros;

    const whereBase = {
      usuario_id,
      data_transacao: {
        gte: new Date(data_inicio),
        lte: new Date(data_fim)
      },
      deletado_em: null,
      ...(categorias_ids && categorias_ids.length > 0 && {
        categoria_id: { in: categorias_ids }
      })
    };

    const receitas = await prisma.transacao.groupBy({
      by: ['categoria_id'],
      where: { ...whereBase, tipo: 'receita' },
      _sum: { valor: true }
    });

    const despesas = await prisma.transacao.groupBy({
      by: ['categoria_id'],
      where: { ...whereBase, tipo: 'despesa' },
      _sum: { valor: true }
    });

    const categoriasMap = await this.buscarCategorias([
      ...receitas.map(r => r.categoria_id),
      ...despesas.map(d => d.categoria_id)
    ]);

    const receitasComNome: TransacaoAgrupada[] = receitas.map(r => ({
      categoria: { nome: categoriasMap[r.categoria_id] || 'Sem categoria' },
      _sum: { valor: r._sum.valor }
    }));

    const despesasComNome: TransacaoAgrupada[] = despesas.map(d => ({
      categoria: { nome: categoriasMap[d.categoria_id] || 'Sem categoria' },
      _sum: { valor: d._sum.valor }
    }));

    const receitaTotal = receitasComNome.reduce(
      (acc, r) => acc + Number(r._sum.valor || 0),
      0
    );
    const despesaTotal = despesasComNome.reduce(
      (acc, d) => acc + Number(d._sum.valor || 0),
      0
    );
    const saldo = receitaTotal - despesaTotal;

    const periodo = this.formatarPeriodo(data_inicio, data_fim);

    let buffer: Buffer;
    let tituloFinal = titulo || `Relatório Financeiro - ${periodo}`;

    switch (tipo_grafico) {
      case 'geral':
        const dadosRelatorio: DadosRelatorio = {
          receitaTotal,
          despesaTotal,
          saldo,
          receitasPorCategoria: this.montarDadosGrafico(receitasComNome),
          despesasPorCategoria: this.montarDadosGrafico(despesasComNome),
          periodo
        };
        buffer = await gerarDashboardGeral(dadosRelatorio);
        break;

      case 'pizza_receitas':
        buffer = await gerarGraficoPizza(
          this.montarDadosGrafico(receitasComNome),
          tituloFinal
        );
        break;

      case 'pizza_despesas':
        buffer = await gerarGraficoPizza(
          this.montarDadosGrafico(despesasComNome),
          tituloFinal
        );
        break;

      case 'barras_despesas':
        buffer = await gerarGraficoBarras(
          this.montarDadosGrafico(despesasComNome),
          tituloFinal
        );
        break;

      case 'comparativo':
        buffer = await gerarGraficoComparativo(receitaTotal, despesaTotal, periodo);
        break;

      case 'categorias_especificas':
        const todasTransacoes = [...receitasComNome, ...despesasComNome];
        buffer = await gerarGraficoPizza(
          this.montarDadosGrafico(todasTransacoes),
          tituloFinal
        );
        break;

      default:
        throw new Error('Tipo de gráfico inválido');
    }

    const timestamp = Date.now();
    const fileName = `relatorio_${usuario_id}_${timestamp}.${formato}`;
    const contentType = formato === 'png' ? 'image/png' : 'image/jpeg';

    const urlImagem = await uploadToSpaces(buffer, fileName, contentType);

    const tipoRelatorio = this.mapearTipoRelatorio(tipo_grafico);
    const filtroTipo = categorias_ids && categorias_ids.length > 0 ? 'ambos' : 'ambos';

    const relatorio = await prisma.relatorio.create({
      data: {
        usuario_id,
        tipo_relatorio: tipoRelatorio,
        data_inicio: new Date(data_inicio),
        data_fim: new Date(data_fim),
        filtro_tipo: filtroTipo,
        filtro_categoria_id: categorias_ids?.[0] || null,
        url_imagem: urlImagem,
        formato: formato === 'png' ? 'png' : 'jpg'
      }
    });

    return {
      relatorio,
      dados: {
        receitaTotal,
        despesaTotal,
        saldo,
        receitas: receitasComNome.map(r => ({
          categoria: r.categoria.nome,
          valor: Number(r._sum.valor || 0)
        })),
        despesas: despesasComNome.map(d => ({
          categoria: d.categoria.nome,
          valor: Number(d._sum.valor || 0)
        })),
        periodo
      }
    };
  },

  async buscarCategorias(ids: number[]): Promise<Record<number, string>> {
    const categorias = await prisma.categoria.findMany({
      where: { id: { in: ids } },
      select: { id: true, nome: true }
    });

    return categorias.reduce((acc, cat) => {
      acc[cat.id] = cat.nome;
      return acc;
    }, {} as Record<number, string>);
  },

  montarDadosGrafico(transacoes: TransacaoAgrupada[]): DadosGrafico {
    return {
      labels: transacoes.map(t => t.categoria.nome),
      values: transacoes.map(t => Number(t._sum.valor || 0))
    };
  },

  formatarPeriodo(dataInicio: string, dataFim: string): string {
    // Adiciona 'T00:00:00' para evitar problema de timezone
    const inicio = new Date(dataInicio + 'T00:00:00');
    const fim = new Date(dataFim + 'T00:00:00');

    const opcoes: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'America/Sao_Paulo'
    };

    return `${inicio.toLocaleDateString('pt-BR', opcoes)} - ${fim.toLocaleDateString('pt-BR', opcoes)}`;
  },

  mapearTipoRelatorio(tipoGrafico: string): 'geral' | 'receitas' | 'despesas' | 'por_categoria' {
    switch (tipoGrafico) {
      case 'geral':
      case 'comparativo':
        return 'geral';
      case 'pizza_receitas':
        return 'receitas';
      case 'pizza_despesas':
      case 'barras_despesas':
        return 'despesas';
      case 'categorias_especificas':
        return 'por_categoria';
      default:
        return 'geral';
    }
  },

  async listarRelatorios(usuario_id: number) {
    return await prisma.relatorio.findMany({
      where: { usuario_id },
      orderBy: { criado_em: 'desc' },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            chat_id: true
          }
        }
      }
    });
  },

  async buscarPorId(id: number, usuario_id: number) {
    const relatorio = await prisma.relatorio.findFirst({
      where: { id, usuario_id },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            chat_id: true
          }
        }
      }
    });

    if (!relatorio) {
      throw new Error('Relatório não encontrado');
    }

    return relatorio;
  }
};
