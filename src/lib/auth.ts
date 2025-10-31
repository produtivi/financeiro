import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      agentIds: number[];
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const admin = await prisma.admin.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            agentes: {
              select: { agent_id: true }
            }
          }
        });

        if (!admin || admin.deletado_em !== null || !admin.ativo) {
          return null;
        }

        const senhaValida = await bcrypt.compare(
          credentials.password,
          admin.senha_hash
        );

        if (!senhaValida) {
          return null;
        }

        return {
          id: admin.id.toString(),
          email: admin.email,
          name: admin.nome,
          role: admin.role,
          agentIds: admin.agentes.map(a => a.agent_id),
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        const admin = await prisma.admin.findUnique({
          where: { id: parseInt(token.id as string) },
          include: {
            agentes: {
              select: { agent_id: true }
            }
          }
        });

        if (admin && admin.deletado_em === null && admin.ativo) {
          session.user.id = admin.id.toString();
          session.user.name = admin.nome;
          session.user.email = admin.email;
          session.user.role = admin.role;
          session.user.agentIds = admin.agentes.map(a => a.agent_id);
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
