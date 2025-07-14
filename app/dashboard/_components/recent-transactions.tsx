'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/lib/types';
import { ArrowUpRight, ArrowDownRight, ArrowRightLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { formatDateToBrazilian } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
}) => {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownRight className="h-4 w-4 text-green-600" />;
      case 'withdraw':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case 'transfer':
        return <ArrowRightLeft className="h-4 w-4 text-blue-600" />;
      case 'buy':
        return <TrendingUp className="h-4 w-4 text-[#F18805]" />;
      case 'sell':
        return <TrendingDown className="h-4 w-4 text-purple-600" />;
      default:
        return <ArrowRightLeft className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionType = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Depósito';
      case 'withdraw':
        return 'Saque';
      case 'transfer':
        return 'Transferência';
      case 'buy':
        return 'Compra';
      case 'sell':
        return 'Venda';
      default:
        return 'Transação';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'sell':
        return 'text-green-600';
      case 'withdraw':
      case 'buy':
        return 'text-red-600';
      default:
        return 'text-gray-900';
    }
  };

  return (
    <Card className="banking-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Transações Recentes</CardTitle>
        <Link href="/reports">
          <Button variant="outline" size="sm">
            Ver todas
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhuma transação encontrada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {getTransactionType(transaction.type)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDateToBrazilian(transaction.date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${getAmountColor(transaction.type)}`}>
                    {transaction.type === 'withdraw' || transaction.type === 'buy' ? '-' : '+'}
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
