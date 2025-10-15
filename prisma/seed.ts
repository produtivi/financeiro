import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  const categorias = [
    { nome: 'Vendas', tipo: 'receita' as const },
    { nome: 'Serviços', tipo: 'receita' as const },
    { nome: 'Outras Receitas', tipo: 'receita' as const },
    { nome: 'Matéria Prima', tipo: 'despesa' as const },
    { nome: 'Aluguel', tipo: 'despesa' as const },
    { nome: 'Transporte', tipo: 'despesa' as const },
    { nome: 'Alimentação', tipo: 'despesa' as const },
    { nome: 'Saúde', tipo: 'despesa' as const },
    { nome: 'Cartão de Crédito', tipo: 'despesa' as const },
    { nome: 'Lazer/Informação', tipo: 'despesa' as const },
    { nome: 'Outras Despesas', tipo: 'despesa' as const },
  ];

  for (const categoria of categorias) {
    await prisma.categoria.upsert({
      where: { id: categorias.indexOf(categoria) + 1 },
      update: {},
      create: categoria,
    });
  }

  console.log('✅ Seed concluído com sucesso!');
  console.log(`📊 ${categorias.length} categorias criadas`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
