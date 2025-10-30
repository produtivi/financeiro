'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400">Carregando...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Sidebar />
      <div className="lg:pl-64">
        <header className="fixed top-0 right-0 left-0 lg:left-64 bg-gray-900 border-b border-gray-800 px-8 py-4 z-30">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Bem-vindo, {session.user?.name}
            </h2>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{session.user?.name}</p>
                <p className="text-xs text-gray-400">{session.user?.email}</p>
              </div>
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {session.user?.name?.[0]?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="pt-24 p-8">{children}</main>
      </div>
    </div>
  );
}
