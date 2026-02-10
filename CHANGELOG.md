# RESUMO DAS ATUALIZAÇÕES DO COMMIT

## 📊 MELHORIAS NAS EXPORTAÇÕES EM CSV

### Todas as telas agora exportam dados mais completos:
- Os arquivos baixados agora incluem **todos os dados individuais**, não só os resumos
- Adicionada coluna "**Semana do Usuário**" que mostra em qual semana da jornada o usuário estava quando fez cada ação (calculada desde quando começou a usar o sistema)
- Melhor formatação dos arquivos com encoding UTF-8 para não aparecer caracteres estranhos no Excel

**Nas Transações:**
- Adicionado grupo do usuário, identificador único e semana da jornada

**Nas Metas:**
- Adicionado grupo do usuário, identificador único e semana da jornada

**Nas Latências:**
- Agora exporta duas seções: estatísticas resumidas + dados individuais completos de cada latência
- Mostra horário exato de quando foi enviado o lembrete e quando foi respondido
- Converte a latência em segundos, minutos e horas

**No Dashboard Geral:**
- Exporta TUDO: transações, metas, latências, pílulas de conhecimento, solicitações ativas e visualizações de painel
- Cada seção separada e organizada

---

## 🔍 FILTROS NOVOS

### Agora é possível filtrar por:
- **Período rápido**: última semana, último mês, último ano ou personalizado
- **Grupo de usuários**: ver só dados de um time específico
- **Semana específica**: filtrar dados de uma semana específica da jornada do usuário
- **Intervalo de datas personalizado**: escolher início e fim manualmente

Esses filtros foram adicionados em:
- Tela de Metas
- Tela de Transações
- Tela de Latências

---

## 📈 NOVAS MÉTRICAS NO DASHBOARD

Foram adicionadas 3 novas seções de métricas:

### 1. Solicitações Ativas
- Quantas pessoas pediram ajuda/suporte e ainda não receberam resposta
- Dividido por tipo de pedido (resumo, ajuda, suporte)
- Mostra quantas pessoas únicas pediram ajuda

### 2. Visualizações de Painel
- Quantas vezes os usuários abriram o painel financeiro
- Diferencia se abriu clicando no botão ou pedindo diretamente
- Mostra quantas pessoas diferentes visualizaram

### 3. Frequência de Metas
- Total de metas cadastradas
- Quantas foram cumpridas vs não cumpridas
- Taxa de sucesso no cumprimento das metas
- Quantas pessoas diferentes cadastraram metas

---

## 🎯 MELHORIAS NA TELA DE LATÊNCIAS

- Melhor tratamento de erros quando não há dados
- Correção na exibição de pílulas de conhecimento quando não há dados

---

## 🎯 MELHORIAS NA TELA DE TRANSAÇÕES

- Tabela agora pode ser expandida/recolhida (mais compacta na tela)
- Filtros por grupo carregam automaticamente os usuários daquele grupo
- Filtro por semana do usuário (mostra transações da semana 1, 2, 3, etc. da jornada)

---

## 🎯 MELHORIAS NA TELA DE METAS

- Filtros por data, tipo de meta e status funcionando corretamente
- Cálculo automático da semana da jornada do usuário
- Melhor organização das informações do usuário e grupo


---
