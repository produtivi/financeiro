import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.admin.findUnique({
    where: { id: 1 },
    include: {
      agentes: true,
    },
  });

  if (!admin) {
    console.log('❌ Admin não encontrado!');
    return;
  }

  console.log('\n📋 Dados do Admin:');
  console.log(`ID: ${admin.id}`);
  console.log(`Nome: ${admin.nome}`);
  console.log(`Email: ${admin.email}`);
  console.log(`Role: ${admin.role}`);
  console.log(`Ativo: ${admin.ativo}`);
  console.log(`Deletado em: ${admin.deletado_em}`);
  console.log(`Agentes vinculados: ${admin.agentes.length}`);

  const senhaCorreta = 'Duduborges22';
  const senhaValida = await bcrypt.compare(senhaCorreta, admin.senha_hash);
  console.log(`\n🔐 Senha "${senhaCorreta}" válida: ${senhaValida ? '✅ SIM' : '❌ NÃO'}`);

  const adminPorEmail = await prisma.admin.findUnique({
    where: { email: admin.email },
  });

  console.log(`\n🔍 Busca por email funcionando: ${adminPorEmail ? '✅ SIM' : '❌ NÃO'}`);
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
