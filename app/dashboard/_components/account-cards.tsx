
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Account } from '@/lib/types';
import { Wallet, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface AccountCardsProps {
  currentAccount?: Account;
  investmentAccount?: Account;
}

export const AccountCards: React.FC<AccountCardsProps> = ({
  currentAccount,
  investmentAccount,
}) => {
  const [showBalance, setShowBalance] = useState(true);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatBalanceDisplay = (value: number) => {
    return showBalance ? formatCurrency(value) : '••••••';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Conta Corrente */}
      <Card className="banking-card-primary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white/90">
            Conta Corrente
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBalance(!showBalance)}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Wallet className="h-5 w-5 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white animate-count-up">
            {formatBalanceDisplay(currentAccount?.balance ?? 0)}
          </div>
          <p className="text-xs text-white/70">
            Disponível para movimentação
          </p>
        </CardContent>
      </Card>

      {/* Conta Investimento */}
      <Card className="banking-card-secondary">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Conta Investimento
          </CardTitle>
          <TrendingUp className="h-5 w-5 text-[#F18805]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#333533] animate-count-up">
            {formatBalanceDisplay(investmentAccount?.balance ?? 0)}
          </div>
          <p className="text-xs text-[#333533]/70">
            Patrimônio em investimentos
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
