import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const novaSenha = 'Duduborges22';

  const admin = await prisma.admin.findUnique({
    where: { id: 1 },
  });

  if (!admin) {
    console.log('❌ Admin com ID 1 não encontrado!');
    return;
  }

  const senhaHash = await bcrypt.hash(novaSenha, 10);

  await prisma.admin.update({
    where: { id: 1 },
    data: {
      senha_hash: senhaHash,
    },
  });

  console.log('✅ Senha resetada com sucesso!');
  console.log(`Email: ${admin.email}`);
  console.log(`Nova senha: ${novaSenha}`);
  console.log('\n⚠️  Use essa senha para fazer login!');
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
