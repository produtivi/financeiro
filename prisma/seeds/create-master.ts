import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'master@admin.com';
  const senha = 'master123';
  const nome = 'Master Admin';

  const adminExistente = await prisma.admin.findUnique({
    where: { email },
  });

  if (adminExistente) {
    console.log('❌ Admin master já existe!');
    console.log(`Email: ${email}`);
    return;
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  const admin = await prisma.admin.create({
    data: {
      nome,
      email,
      senha_hash: senhaHash,
      role: 'master',
      ativo: true,
    },
  });

  console.log('✅ Admin master criado com sucesso!');
  console.log(`Email: ${email}`);
  console.log(`Senha: ${senha}`);
  console.log(`ID: ${admin.id}`);
  console.log('\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
}

main()
  .catch((e) => {
    console.error('Erro ao criar admin master:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
