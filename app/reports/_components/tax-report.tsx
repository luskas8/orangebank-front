
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { accountsApi, marketApi } from '@/lib/api';
import { Account, Position, Transaction } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Calculator, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { format, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { parseApiDate } from '@/lib/utils';

export const TaxReport: React.FC = () => {
  const [investmentAccount, setInvestmentAccount] = useState<Account | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTaxData = async () => {
      try {
        const accounts = await accountsApi.getAccounts();
        const investment = accounts.find(acc => acc.type === 'investment');
        setInvestmentAccount(investment || null);

        if (investment) {
          const [positionsData, transactionsData] = await Promise.all([
            marketApi.getPositions(investment.id),
            accountsApi.getTransactions(investment.id)
          ]);
          
          setPositions(positionsData);
          setTransactions(transactionsData);
        }
      } catch (error) {
        console.error('Erro ao carregar dados de IR:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados de IR",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTaxData();
  }, [toast]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const calculateTaxes = () => {
    const currentYear = new Date().getFullYear();
    const yearStart = startOfYear(new Date(currentYear, 0, 1));
    const yearEnd = endOfYear(new Date(currentYear, 11, 31));

    // Filtrar transações de venda do ano atual
    const salesThisYear = transactions.filter(t => 
      t.type === 'sell' && 
      parseApiDate(t.date) >= yearStart && 
      parseApiDate(t.date) <= yearEnd
    );

    // Calcular ganhos e impostos por tipo de ativo
    let stockGains = 0;
    let stockTaxes = 0;
    let fixedIncomeGains = 0;
    let fixedIncomeTaxes = 0;

    // Simular cálculo de ganhos (em um sistema real, isso viria da API)
    salesThisYear.forEach(sale => {
      // Para ações: assumir 15% de IR sobre ganho simulado
      // Para renda fixa: assumir 22% de IR sobre ganho simulado
      const simulatedGain = sale.amount * 0.1; // 10% de ganho simulado
      
      if (sale.description?.includes('stock') || sale.description?.includes('ação')) {
        stockGains += simulatedGain;
        stockTaxes += simulatedGain * 0.15; // 15% IR
      } else {
        fixedIncomeGains += simulatedGain;
        fixedIncomeTaxes += simulatedGain * 0.22; // 22% IR
      }
    });

    // Ganhos não realizados (posições atuais)
    let unrealizedStockGains = 0;
    let unrealizedFixedGains = 0;

    positions.forEach(position => {
      const currentValue = position.quantity * position.asset.currentPrice;
      const investedValue = position.quantity * position.averagePrice;
      const gain = currentValue - investedValue;
      
      if (gain > 0) {
        if (position.asset.type === 'stock') {
          unrealizedStockGains += gain;
        } else {
          unrealizedFixedGains += gain;
        }
      }
    });

    return {
      currentYear,
      stockGains,
      stockTaxes,
      fixedIncomeGains,
      fixedIncomeTaxes,
      totalGains: stockGains + fixedIncomeGains,
      totalTaxes: stockTaxes + fixedIncomeTaxes,
      unrealizedStockGains,
      unrealizedFixedGains,
      totalUnrealized: unrealizedStockGains + unrealizedFixedGains,
      salesCount: salesThisYear.length,
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

  const taxData = calculateTaxes();

  return (
    <div className="space-y-6">
      {/* Resumo do ano atual */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900 flex items-center">
            <Calculator className="w-5 h-5 mr-2" />
            Relatório de IR {taxData.currentYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-blue-700">Ganhos realizados:</p>
              <p className="text-xl font-bold text-blue-900">
                {formatCurrency(taxData.totalGains)}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-700">IR a pagar:</p>
              <p className="text-xl font-bold text-red-600">
                {formatCurrency(taxData.totalTaxes)}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Vendas realizadas:</p>
              <p className="text-xl font-bold text-blue-900">
                {taxData.salesCount}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalhamento por tipo de ativo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="banking-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-[#F18805]" />
              Ações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Ganhos Realizados</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lucro em vendas:</span>
                    <span className="font-medium">{formatCurrency(taxData.stockGains)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">IR devido (15%):</span>
                    <span className="font-medium text-red-600">{formatCurrency(taxData.stockTaxes)}</span>
                  </div>
                </div>
              </div>
              
              <hr />
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Ganhos Não Realizados</h4>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lucro em posições:</span>
                  <span className="font-medium">{formatCurrency(taxData.unrealizedStockGains)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  IR estimado: {formatCurrency(taxData.unrealizedStockGains * 0.15)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="banking-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <TrendingDown className="w-5 h-5 mr-2 text-green-600" />
              Renda Fixa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Ganhos Realizados</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lucro em resgates:</span>
                    <span className="font-medium">{formatCurrency(taxData.fixedIncomeGains)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">IR devido (22%):</span>
                    <span className="font-medium text-red-600">{formatCurrency(taxData.fixedIncomeTaxes)}</span>
                  </div>
                </div>
              </div>
              
              <hr />
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Ganhos Não Realizados</h4>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lucro em posições:</span>
                  <span className="font-medium">{formatCurrency(taxData.unrealizedFixedGains)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  IR estimado: {formatCurrency(taxData.unrealizedFixedGains * 0.22)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações importantes */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-lg text-yellow-900 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Informações Importantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-yellow-800">
            <div>
              <h4 className="font-medium">Tributação de Ações:</h4>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Imposto de Renda: 15% sobre o lucro nas operações</li>
                <li>Taxa de corretagem: 1% sobre o valor da operação</li>
                <li>Isenção para vendas até R$ 20.000,00 por mês</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium">Tributação de Renda Fixa:</h4>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Imposto de Renda: 22% sobre o rendimento</li>
                <li>Retenção na fonte no momento do resgate</li>
                <li>Não há taxa de corretagem</li>
              </ul>
            </div>
            
            <div className="bg-yellow-100 p-3 rounded">
              <p className="font-medium">⚠️ Aviso:</p>
              <p>Este é um relatório informativo. Consulte sempre um contador ou especialista em IR para orientações específicas sobre suas obrigações fiscais.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
