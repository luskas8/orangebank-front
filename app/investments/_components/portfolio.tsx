
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import { accountsApi, marketApi } from '@/lib/api';
import { Account, Position } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, TrendingDown, DollarSign, Percent, Minus } from 'lucide-react';
import { SellAssetModal } from './sell-asset-modal';

export const Portfolio: React.FC = () => {
  const [investmentAccount, setInvestmentAccount] = useState<Account | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [showSellModal, setShowSellModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const accounts = await accountsApi.getAccounts();
        const investment = accounts.find(acc => acc.type === 'investment');
        setInvestmentAccount(investment || null);

        if (investment) {
          const positionsData = await marketApi.getPositions(investment.id);
          setPositions(positionsData);
        }
      } catch (error) {
        console.error('Erro ao carregar portfólio:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar portfólio",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [toast]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const calculateGainLoss = (position: Position) => {
    const currentValue = position.quantity * position.asset.currentPrice;
    const investedValue = position.quantity * position.averagePrice;
    const gainLoss = currentValue - investedValue;
    const gainLossPercent = (gainLoss / investedValue) * 100;
    
    return {
      absolute: gainLoss,
      percent: gainLossPercent,
      isPositive: gainLoss >= 0
    };
  };

  const handleSellAsset = (position: Position) => {
    setSelectedPosition(position);
    setShowSellModal(true);
  };

  const refreshPortfolio = async () => {
    if (investmentAccount) {
      try {
        const positionsData = await marketApi.getPositions(investmentAccount.id);
        setPositions(positionsData);
        
        const accounts = await accountsApi.getAccounts();
        const investment = accounts.find(acc => acc.type === 'investment');
        setInvestmentAccount(investment || null);
      } catch (error) {
        console.error('Erro ao atualizar portfólio:', error);
      }
    }
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

  const totalInvested = positions.reduce((sum, pos) => sum + (pos.quantity * pos.averagePrice), 0);
  const totalCurrent = positions.reduce((sum, pos) => sum + (pos.quantity * pos.asset.currentPrice), 0);
  const totalGainLoss = totalCurrent - totalInvested;
  const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Resumo do portfólio */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="banking-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Saldo em Conta</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#F18805]">
              {formatCurrency(investmentAccount.balance)}
            </p>
          </CardContent>
        </Card>

        <Card className="banking-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Valor Investido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalInvested)}
            </p>
          </CardContent>
        </Card>

        <Card className="banking-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Resultado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalGainLoss >= 0 ? '+' : ''}{formatCurrency(totalGainLoss)}
            </p>
            <p className={`text-sm ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalGainLoss >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de posições */}
      <Card className="banking-card">
        <CardHeader>
          <CardTitle className="text-lg">Minhas Posições</CardTitle>
        </CardHeader>
        <CardContent>
          {positions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Você ainda não possui investimentos</p>
            </div>
          ) : (
            <div className="space-y-4">
              {positions.map((position) => {
                const gainLoss = calculateGainLoss(position);
                return (
                  <div
                    key={position.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h3 className="font-medium text-[#333533]">
                            {position.asset.symbol || position.asset.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {position.quantity} {position.asset.type === 'stock' ? 'ações' : 'unidades'}
                          </p>
                        </div>
                        <Badge variant={gainLoss.isPositive ? "default" : "destructive"}>
                          {gainLoss.isPositive ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {gainLoss.isPositive ? '+' : ''}{gainLoss.percent.toFixed(2)}%
                        </Badge>
                      </div>
                      
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Preço médio:</span>
                          <p className="font-medium">{formatCurrency(position.averagePrice)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Preço atual:</span>
                          <p className="font-medium">{formatCurrency(position.asset.currentPrice)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Valor atual:</span>
                          <p className="font-medium">{formatCurrency(position.currentValue)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Resultado:</span>
                          <p className={`font-medium ${gainLoss.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {gainLoss.isPositive ? '+' : ''}{formatCurrency(gainLoss.absolute)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4">
                      <Button
                        onClick={() => handleSellAsset(position)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <Minus className="w-4 h-4 mr-1" />
                        Vender
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de venda */}
      {selectedPosition && (
        <SellAssetModal
          position={selectedPosition}
          open={showSellModal}
          onOpenChange={setShowSellModal}
          onSuccess={() => {
            setShowSellModal(false);
            setSelectedPosition(null);
            refreshPortfolio();
          }}
        />
      )}
    </div>
  );
};
