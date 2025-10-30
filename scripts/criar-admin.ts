import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function main() {
  console.log('\n🔐 Criar Novo Admin\n');

  const nome = await question('Nome completo: ');
  const email = await question('Email: ');
  const senha = await question('Senha (min 6 caracteres): ');

  if (!nome || !email || !senha) {
    console.error('❌ Todos os campos são obrigatórios!');
    process.exit(1);
  }

  if (senha.length < 6) {
    console.error('❌ A senha deve ter no mínimo 6 caracteres!');
    process.exit(1);
  }

  const adminExistente = await prisma.admin.findUnique({
    where: { email },
  });

  if (adminExistente) {
    console.error('❌ Email já cadastrado!');
    process.exit(1);
  }

  const senha_hash = await bcrypt.hash(senha, 10);

  const admin = await prisma.admin.create({
    data: {
      nome,
      email,
      senha_hash,
    },
  });

  console.log('\n✅ Admin criado com sucesso!');
  console.log(`ID: ${admin.id}`);
  console.log(`Nome: ${admin.nome}`);
  console.log(`Email: ${admin.email}\n`);
}

main()
  .catch((e) => {
    console.error('Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    rl.close();
  });
