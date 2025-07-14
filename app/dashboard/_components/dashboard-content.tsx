
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { MainLayout } from '@/components/layout/main-layout';
import { AccountCards } from './account-cards';
import { ActionButtons } from './action-buttons';
import { RecentTransactions } from './recent-transactions';
import { BalanceChart } from './balance-chart';
import { Loading } from '@/components/ui/loading';
import { accountsApi } from '@/lib/api';
import { Account, Transaction } from '@/lib/types';

export const DashboardContent: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Buscar contas diretamente da API externa
        const accountsData = await accountsApi.getAccounts();
        setAccounts(accountsData);

        // Buscar transações recentes da conta corrente
        const currentAccount = accountsData.find(acc => acc.type === 'current');
        if (currentAccount) {
          try {
            const transactions = await accountsApi.getTransactions(currentAccount.id);
            setRecentTransactions(transactions.slice(0, 5));
          } catch (transactionError) {
            console.error('Erro ao carregar transações:', transactionError);
            // Continua sem as transações se houver erro
            setRecentTransactions([]);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        setAccounts([]);
        setRecentTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    // Só busca dados se o usuário estiver logado
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <Loading size="lg" />
        </div>
      </MainLayout>
    );
  }

  const currentAccount = accounts.find(acc => acc.type === 'current');
  const investmentAccount = accounts.find(acc => acc.type === 'investment');

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header de boas-vindas */}
        <div className="bg-gradient-to-r from-[#F18805] to-[#D97706] rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Olá, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-white/90">
            Bem-vindo de volta ao seu OrangeBank
          </p>
        </div>

        {/* Cards das contas */}
        <AccountCards 
          currentAccount={currentAccount}
          investmentAccount={investmentAccount}
        />

        {/* Botões de ação */}
        <ActionButtons 
          currentAccount={currentAccount}
          investmentAccount={investmentAccount}
        />

        {/* Gráficos e transações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <BalanceChart accounts={accounts} />
          <RecentTransactions transactions={recentTransactions} />
        </div>
      </div>
    </MainLayout>
  );
};
