import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function requireRole(allowedRoles: string[]) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      {
        success: false,
        message: 'Não autenticado',
      },
      { status: 401 }
    );
  }

  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json(
      {
        success: false,
        message: 'Acesso negado',
      },
      { status: 403 }
    );
  }

  return null;
}

export async function getSession() {
  return await getServerSession(authOptions);
}
