import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const registerSchema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  senha: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nome, email, senha } = registerSchema.parse(body);

    const adminExistente = await prisma.admin.findUnique({
      where: { email },
    });

    if (adminExistente) {
      return NextResponse.json(
        { success: false, error: 'Email já cadastrado' },
        { status: 400 }
      );
    }

    const senha_hash = await bcrypt.hash(senha, 10);

    const admin = await prisma.admin.create({
      data: {
        nome,
        email,
        senha_hash,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: admin.id,
        nome: admin.nome,
        email: admin.email,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Erro ao criar admin' },
      { status: 500 }
    );
  }
}
