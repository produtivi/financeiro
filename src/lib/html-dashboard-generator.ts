import { DadosRelatorio } from './chart-generator';

function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function gerarHTMLDashboard(dados: DadosRelatorio): string {
  const { receitaTotal, despesaTotal, saldo, receitasPorCategoria, despesasPorCategoria, periodo } = dados;

  const percentualReceitas = receitaTotal > 0 ? ((receitaTotal / (receitaTotal + despesaTotal)) * 100).toFixed(1) : '0';
  const percentualDespesas = despesaTotal > 0 ? ((despesaTotal / (receitaTotal + despesaTotal)) * 100).toFixed(1) : '0';

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard Financeiro</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: white;
      margin: 0;
      padding: 0;
      width: 1200px;
      height: auto;
    }

    .dashboard {
      background: white;
      padding: 40px;
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 30px;
      border-bottom: 3px solid #f0f0f0;
    }

    .header h1 {
      font-size: 36px;
      color: #1f2937;
      margin-bottom: 10px;
      font-weight: 700;
    }

    .header p {
      font-size: 18px;
      color: #6b7280;
      font-weight: 500;
    }

    .cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 40px;
    }

    .card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 25px;
      border-radius: 15px;
      color: white;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .card.receita {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }

    .card.despesa {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    }

    .card.saldo {
      background: linear-gradient(135deg, ${saldo >= 0 ? '#10b981 0%, #059669' : '#ef4444 0%, #dc2626'} 100%);
    }

    .card.investimento {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    }

    .card-title {
      font-size: 14px;
      opacity: 0.9;
      margin-bottom: 10px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .card-value {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 5px;
    }

    .card-subtitle {
      font-size: 13px;
      opacity: 0.8;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 30px;
    }

    .chart-container {
      background: #f9fafb;
      padding: 25px;
      border-radius: 15px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .chart-container.full {
      grid-column: 1 / -1;
    }

    .chart-title {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 20px;
      text-align: center;
    }

    .chart-wrapper {
      position: relative;
      height: 300px;
    }

    .chart-wrapper.small {
      height: 250px;
    }

    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 2px solid #f0f0f0;
      color: #6b7280;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="dashboard">
    <div class="header">
      <h1> Dashboard Financeiro</h1>
      <p>${periodo}</p>
    </div>

    <div class="cards">
      <div class="card receita">
        <div class="card-title">💰 Receita Total</div>
        <div class="card-value">${formatarMoeda(receitaTotal)}</div>
        <div class="card-subtitle">${percentualReceitas}% do total</div>
      </div>

      <div class="card despesa">
        <div class="card-title">💸 Despesa Total</div>
        <div class="card-value">${formatarMoeda(despesaTotal)}</div>
        <div class="card-subtitle">${percentualDespesas}% do total</div>
      </div>

      <div class="card saldo">
        <div class="card-title">💵 Saldo</div>
        <div class="card-value">${formatarMoeda(saldo)}</div>
        <div class="card-subtitle">${saldo >= 0 ? 'Positivo' : 'Negativo'}</div>
      </div>

      <div class="card investimento">
        <div class="card-title">📈 Resultado</div>
        <div class="card-value">${saldo >= 0 ? '+' : ''}${((saldo / (receitaTotal || 1)) * 100).toFixed(1)}%</div>
        <div class="card-subtitle">Margem líquida</div>
      </div>
    </div>

    <div class="charts-grid">
      <div class="chart-container">
        <div class="chart-title">Receitas por Categoria</div>
        <div class="chart-wrapper small">
          <canvas id="receitasChart"></canvas>
        </div>
      </div>

      <div class="chart-container">
        <div class="chart-title">Despesas por Categoria</div>
        <div class="chart-wrapper small">
          <canvas id="despesasChart"></canvas>
        </div>
      </div>

      <div class="chart-container full">
        <div class="chart-title">Comparativo: Receitas vs Despesas</div>
        <div class="chart-wrapper">
          <canvas id="comparativoChart"></canvas>
        </div>
      </div>
    </div>

    <div class="footer">
      Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
    </div>
  </div>

  <script>
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];

    // Receitas Chart
    new Chart(document.getElementById('receitasChart'), {
      type: 'doughnut',
      data: {
        labels: ${JSON.stringify(receitasPorCategoria.labels)},
        datasets: [{
          data: ${JSON.stringify(receitasPorCategoria.values)},
          backgroundColor: COLORS,
          borderWidth: 3,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 15,
              font: { size: 12 }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return context.label + ': R$ ' + value.toLocaleString('pt-BR', {minimumFractionDigits: 2}) + ' (' + percentage + '%)';
              }
            }
          }
        }
      }
    });

    // Despesas Chart
    new Chart(document.getElementById('despesasChart'), {
      type: 'doughnut',
      data: {
        labels: ${JSON.stringify(despesasPorCategoria.labels)},
        datasets: [{
          data: ${JSON.stringify(despesasPorCategoria.values)},
          backgroundColor: COLORS,
          borderWidth: 3,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 15,
              font: { size: 12 }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return context.label + ': R$ ' + value.toLocaleString('pt-BR', {minimumFractionDigits: 2}) + ' (' + percentage + '%)';
              }
            }
          }
        }
      }
    });

    // Comparativo Chart
    new Chart(document.getElementById('comparativoChart'), {
      type: 'bar',
      data: {
        labels: ['💰 Receitas', '💸 Despesas'],
        datasets: [{
          data: [${receitaTotal}, ${despesaTotal}],
          backgroundColor: ['#10b981', '#ef4444'],
          borderRadius: 10,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return 'R$ ' + context.parsed.y.toLocaleString('pt-BR', {minimumFractionDigits: 2});
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return 'R$ ' + value.toLocaleString('pt-BR');
              }
            }
          }
        }
      }
    });
  </script>
</body>
</html>
  `.trim();
}
