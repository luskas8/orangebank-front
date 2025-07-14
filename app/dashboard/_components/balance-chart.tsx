'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Account } from '@/lib/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface BalanceChartProps {
  accounts: Account[];
}

export const BalanceChart: React.FC<BalanceChartProps> = ({ accounts }) => {
  const currentAccount = accounts.find(acc => acc.type === 'current');
  const investmentAccount = accounts.find(acc => acc.type === 'investment');

  const data = [
    {
      name: 'Conta Corrente',
      value: currentAccount?.balance ?? 0,
      color: '#F18805',
    },
    {
      name: 'Investimentos',
      value: investmentAccount?.balance ?? 0,
      color: '#CFDBD5',
    },
  ].filter(item => item.value > 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            {formatCurrency(data.value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (total === 0) {
    return (
      <Card className="banking-card">
        <CardHeader>
          <CardTitle className="text-lg">Distribuição de Patrimônio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Nenhum saldo disponível</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="banking-card">
      <CardHeader>
        <CardTitle className="text-lg">Distribuição de Patrimônio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                wrapperStyle={{ fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Patrimônio Total:</span>
            <span className="text-lg font-bold text-[#F18805]">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
