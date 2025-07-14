
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from '@/components/ui/toaster';
import { AuthDebugPanel } from '@/components/auth-debug-panel';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OrangeBank - Seu Banco Digital',
  description: 'Sistema bancário completo com conta corrente e investimentos',
  keywords: 'banco, conta corrente, investimentos, ações, renda fixa',
  authors: [{ name: 'OrangeBank' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
          {process.env.NODE_ENV === 'development' && <AuthDebugPanel />}
        </AuthProvider>
      </body>
    </html>
  );
}
