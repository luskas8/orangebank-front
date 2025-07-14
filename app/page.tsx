
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Loading } from '@/components/ui/loading';

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, loading, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F18805] to-[#D97706] flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-[#F18805] font-bold text-3xl">OB</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">OrangeBank</h1>
        <p className="text-white/80 mb-8">Carregando...</p>
        <Loading size="lg" className="text-white" />
      </div>
    </div>
  );
}
