import QuickChart from 'quickchart-js';
import puppeteer from 'puppeteer';
import { gerarHTMLDashboard } from './html-dashboard-generator';

export interface DadosGrafico {
  labels: string[];
  values: number[];
  colors?: string[];
}

export interface DadosRelatorio {
  receitaTotal: number;
  despesaTotal: number;
  saldo: number;
  receitasPorCategoria: DadosGrafico;
  despesasPorCategoria: DadosGrafico;
  periodo: string;
}

const COLORS = {
  receita: '#10b981',
  despesa: '#ef4444',
  chart: [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#84cc16',
    '#f97316',
    '#6366f1',
  ]
};

function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export async function gerarDashboardGeral(
  dados: DadosRelatorio
): Promise<Buffer> {
  const html = gerarHTMLDashboard(dados);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1400 });
  await page.setContent(html, { waitUntil: 'networkidle0' });

  // Aguardar os gráficos renderizarem
  await new Promise(resolve => setTimeout(resolve, 2000));

  const screenshot = await page.screenshot({
    type: 'png',
    fullPage: true
  });

  await browser.close();

  return Buffer.from(screenshot);
}

export async function gerarGraficoPizza(
  dados: DadosGrafico,
  titulo: string
): Promise<Buffer> {
  const chart = new QuickChart();

  const labelsComValores = dados.labels.map((label, index) =>
    `${label}: ${formatarMoeda(dados.values[index])}`
  );

  chart.setConfig({
    type: 'outlabeledPie',
    data: {
      labels: labelsComValores,
      datasets: [{
        data: dados.values,
        backgroundColor: dados.colors || COLORS.chart,
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            font: {
              size: 14
            },
            padding: 15
          }
        },
        title: {
          display: true,
          text: titulo,
          font: {
            size: 22,
            weight: 'bold'
          },
          padding: 20
        },
        outlabels: {
          text: '%l (%p)',
          color: 'black',
          stretch: 20,
          font: {
            size: 11,
            weight: 'bold'
          }
        }
      }
    }
  });
  chart.setWidth(1200);
  chart.setHeight(800);
  chart.setBackgroundColor('white');

  const imageBuffer = await chart.toBinary();
  return Buffer.from(imageBuffer);
}

export async function gerarGraficoBarras(
  dados: DadosGrafico,
  titulo: string
): Promise<Buffer> {
  const chart = new QuickChart();

  const labelsComValores = dados.labels.map((label, index) =>
    `${label}\n${formatarMoeda(dados.values[index])}`
  );

  chart.setConfig({
    type: 'bar',
    data: {
      labels: labelsComValores,
      datasets: [{
        label: 'Valor',
        data: dados.values,
        backgroundColor: dados.colors || COLORS.chart,
        borderWidth: 1,
        borderColor: '#ffffff'
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: titulo,
          font: {
            size: 22,
            weight: 'bold'
          },
          padding: 20
        },
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            font: {
              size: 12
            }
          },
          grid: {
            color: '#e5e7eb'
          }
        },
        x: {
          ticks: {
            font: {
              size: 11
            }
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
  chart.setWidth(1200);
  chart.setHeight(800);
  chart.setBackgroundColor('white');

  const imageBuffer = await chart.toBinary();
  return Buffer.from(imageBuffer);
}

export async function gerarGraficoComparativo(
  receitaTotal: number,
  despesaTotal: number,
  periodo: string
): Promise<Buffer> {
  const receitaFormatada = formatarMoeda(receitaTotal);
  const despesaFormatada = formatarMoeda(despesaTotal);
  const saldoFormatado = formatarMoeda(receitaTotal - despesaTotal);

  const total = receitaTotal + despesaTotal;
  const percReceita = ((receitaTotal / total) * 100).toFixed(1);
  const percDespesa = ((despesaTotal / total) * 100).toFixed(1);

  const chart = new QuickChart();
  chart.setConfig({
    type: 'doughnut',
    data: {
      labels: [
        `💰 Receitas: ${receitaFormatada} (${percReceita}%)`,
        `💸 Despesas: ${despesaFormatada} (${percDespesa}%)`
      ],
      datasets: [{
        data: [receitaTotal, despesaTotal],
        backgroundColor: [COLORS.receita, COLORS.despesa],
        borderWidth: 3,
        borderColor: '#ffffff'
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: [
            '📊 Receitas vs Despesas',
            periodo,
            '',
            `Saldo: ${saldoFormatado}`
          ],
          font: {
            size: 22,
            weight: 'bold'
          },
          padding: 25
        },
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            font: {
              size: 13,
              weight: 'bold'
            },
            padding: 20
          }
        }
      },
      layout: {
        padding: 20
      }
    }
  });
  chart.setWidth(1200);
  chart.setHeight(800);
  chart.setBackgroundColor('white');

  const imageBuffer = await chart.toBinary();
  return Buffer.from(imageBuffer);
}
