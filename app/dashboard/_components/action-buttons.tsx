
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Account } from '@/lib/types';
import { Plus, Minus, ArrowRightLeft, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface ActionButtonsProps {
  currentAccount?: Account;
  investmentAccount?: Account;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  currentAccount,
  investmentAccount,
}) => {
  return (
    <Card className="banking-card">
      <CardHeader>
        <CardTitle className="text-lg">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/deposit" className="block">
            <Button 
              className="w-full h-20 flex-col space-y-2 bg-green-600 hover:bg-green-700"
              disabled={!currentAccount}
            >
              <Plus className="h-6 w-6" />
              <span className="text-sm">Depositar</span>
            </Button>
          </Link>

          <Link href="/withdraw" className="block">
            <Button 
              className="w-full h-20 flex-col space-y-2 bg-red-600 hover:bg-red-700"
              disabled={!currentAccount}
            >
              <Minus className="h-6 w-6" />
              <span className="text-sm">Sacar</span>
            </Button>
          </Link>

          <Link href="/transfer" className="block">
            <Button 
              className="w-full h-20 flex-col space-y-2 bg-blue-600 hover:bg-blue-700"
              disabled={!currentAccount || !investmentAccount}
            >
              <ArrowRightLeft className="h-6 w-6" />
              <span className="text-sm">Transferir</span>
            </Button>
          </Link>

          <Link href="/investments" className="block">
            <Button 
              className="w-full h-20 flex-col space-y-2 bg-[#F18805] hover:bg-[#D97706]"
              disabled={!investmentAccount}
            >
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">Investir</span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
