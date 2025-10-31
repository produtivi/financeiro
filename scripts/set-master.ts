import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.admin.findUnique({
    where: { id: 1 },
  });

  if (!admin) {
    console.log('❌ Admin com ID 1 não encontrado!');
    return;
  }

  await prisma.admin.update({
    where: { id: 1 },
    data: {
      role: 'master',
      ativo: true,
      deletado_em: null,
    },
  });

  console.log('✅ Admin ID 1 atualizado para role MASTER com sucesso!');
  console.log(`Nome: ${admin.nome}`);
  console.log(`Email: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
