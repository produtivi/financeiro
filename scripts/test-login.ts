import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'eduardo@produtive.ai';
  const senha = 'Duduborges22';

  console.log('\n🔐 Testando login...\n');
  console.log(`Email: ${email}`);
  console.log(`Senha: ${senha}\n`);

  console.log('1️⃣ Buscando admin no banco...');
  const admin = await prisma.admin.findUnique({
    where: {
      email: email,
    },
    include: {
      agentes: {
        select: { agent_id: true }
      }
    }
  });

  if (!admin) {
    console.log('❌ Admin não encontrado!');
    return;
  }
  console.log('✅ Admin encontrado!');

  console.log('\n2️⃣ Verificando se está ativo...');
  if (admin.deletado_em !== null) {
    console.log(`❌ Admin deletado em: ${admin.deletado_em}`);
    return;
  }
  if (!admin.ativo) {
    console.log(`❌ Admin inativo: ${admin.ativo}`);
    return;
  }
  console.log('✅ Admin está ativo!');

  console.log('\n3️⃣ Comparando senha...');
  console.log(`Senha digitada: ${senha}`);
  console.log(`Hash no banco: ${admin.senha_hash.substring(0, 20)}...`);

  const senhaValida = await bcrypt.compare(senha, admin.senha_hash);

  if (!senhaValida) {
    console.log('❌ Senha inválida!');
    return;
  }
  console.log('✅ Senha válida!');

  console.log('\n4️⃣ Montando objeto de retorno...');
  const user = {
    id: admin.id.toString(),
    email: admin.email,
    name: admin.nome,
    role: admin.role,
    agentIds: admin.agentes.map(a => a.agent_id),
  };
  console.log('✅ User:', JSON.stringify(user, null, 2));

  console.log('\n✅✅✅ LOGIN SERIA APROVADO! ✅✅✅');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
