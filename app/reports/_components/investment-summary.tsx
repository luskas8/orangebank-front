
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { accountsApi, marketApi } from '@/lib/api';
import { Account, Position } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, TrendingDown, PieChart, BarChart3 } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export const InvestmentSummary: React.FC = () => {
  const [investmentAccount, setInvestmentAccount] = useState<Account | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInvestmentData = async () => {
      try {
        const accounts = await accountsApi.getAccounts();
        const investment = accounts.find(acc => acc.type === 'investment');
        setInvestmentAccount(investment || null);

        if (investment) {
          const positionsData = await marketApi.getPositions(investment.id);
          setPositions(positionsData);
        }
      } catch (error) {
        console.error('Erro ao carregar dados de investimento:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados de investimento",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvestmentData();
  }, [toast]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const calculateSummary = () => {
    const totalInvested = positions.reduce((sum, pos) => sum + (pos.quantity * pos.averagePrice), 0);
    const totalCurrent = positions.reduce((sum, pos) => sum + (pos.quantity * pos.asset.currentPrice), 0);
    const totalGainLoss = totalCurrent - totalInvested;
    const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

    const stocks = positions.filter(pos => pos.asset.type === 'stock');
    const fixedIncome = positions.filter(pos => pos.asset.type === 'fixed_income');

    const stocksValue = stocks.reduce((sum, pos) => sum + (pos.quantity * pos.asset.currentPrice), 0);
    const fixedIncomeValue = fixedIncome.reduce((sum, pos) => sum + (pos.quantity * pos.asset.currentPrice), 0);

    return {
      totalInvested,
      totalCurrent,
      totalGainLoss,
      totalGainLossPercent,
      stocksValue,
      fixedIncomeValue,
      stocksCount: stocks.length,
      fixedIncomeCount: fixedIncome.length,
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading size="lg" />
      </div>
    );
  }

  if (!investmentAccount) {
    return (
      <Card className="banking-card">
        <CardContent className="pt-6 text-center">
          <p className="text-gray-600">Conta de investimento não encontrada</p>
        </CardContent>
      </Card>
    );
  }

  const summary = calculateSummary();

  // Dados para o gráfico de pizza
  const pieData = [
    {
      name: 'Ações',
      value: summary.stocksValue,
      color: '#F18805',
    },
    {
      name: 'Renda Fixa',
      value: summary.fixedIncomeValue,
      color: '#CFDBD5',
    },
    {
      name: 'Caixa',
      value: investmentAccount.balance,
      color: '#333533',
    },
  ].filter(item => item.value > 0);

  // Dados para o gráfico de barras (top 5 posições)
  const barData = positions
    .sort((a, b) => (b.quantity * b.asset.currentPrice) - (a.quantity * a.asset.currentPrice))
    .slice(0, 5)
    .map(pos => ({
      name: pos.asset.symbol || pos.asset.name.substring(0, 10),
      investido: pos.quantity * pos.averagePrice,
      atual: pos.quantity * pos.asset.currentPrice,
    }));

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

  return (
    <div className="space-y-6">
      {/* Resumo geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="banking-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Patrimônio Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#F18805]">
              {formatCurrency(summary.totalCurrent + investmentAccount.balance)}
            </p>
          </CardContent>
        </Card>

        <Card className="banking-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Valor Investido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(summary.totalInvested)}
            </p>
          </CardContent>
        </Card>

        <Card className="banking-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Resultado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${summary.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.totalGainLoss >= 0 ? '+' : ''}{formatCurrency(summary.totalGainLoss)}
            </p>
            <p className={`text-sm ${summary.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.totalGainLoss >= 0 ? '+' : ''}{summary.totalGainLossPercent.toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card className="banking-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Posições</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#333533]">
              {positions.length}
            </p>
            <p className="text-sm text-gray-600">
              {summary.stocksCount} ações, {summary.fixedIncomeCount} RF
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por tipo */}
        <Card className="banking-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Distribuição do Patrimônio
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      wrapperStyle={{ fontSize: '12px' }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Nenhum investimento encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top 5 posições */}
        <Card className="banking-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Principais Posições
            </CardTitle>
          </CardHeader>
          <CardContent>
            {barData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 10 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      labelStyle={{ color: '#333533' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="investido" fill="#CFDBD5" name="Investido" />
                    <Bar dataKey="atual" fill="#F18805" name="Valor Atual" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Nenhuma posição encontrada</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detalhamento por categoria */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="banking-card">
          <CardHeader>
            <CardTitle className="text-lg">Ações ({summary.stocksCount})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Valor investido:</span>
                <span className="font-medium">
                  {formatCurrency(positions.filter(p => p.asset.type === 'stock').reduce((sum, p) => sum + (p.quantity * p.averagePrice), 0))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Valor atual:</span>
                <span className="font-medium">{formatCurrency(summary.stocksValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Participação:</span>
                <span className="font-medium">
                  {summary.totalCurrent > 0 ? ((summary.stocksValue / summary.totalCurrent) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="banking-card">
          <CardHeader>
            <CardTitle className="text-lg">Renda Fixa ({summary.fixedIncomeCount})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Valor investido:</span>
                <span className="font-medium">
                  {formatCurrency(positions.filter(p => p.asset.type === 'fixed_income').reduce((sum, p) => sum + (p.quantity * p.averagePrice), 0))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Valor atual:</span>
                <span className="font-medium">{formatCurrency(summary.fixedIncomeValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Participação:</span>
                <span className="font-medium">
                  {summary.totalCurrent > 0 ? ((summary.fixedIncomeValue / summary.totalCurrent) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
