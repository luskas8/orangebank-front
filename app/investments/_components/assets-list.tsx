
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loading } from '@/components/ui/loading';
import { marketApi } from '@/lib/api';
import { Asset } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, TrendingDown, Calendar, Percent, ShoppingCart } from 'lucide-react';
import { BuyAssetModal } from './buy-asset-modal';

export const AssetsList: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const assetsData = await marketApi.getAssets();
        setAssets(assetsData);
      } catch (error) {
        console.error('Erro ao carregar ativos:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar lista de ativos",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [toast]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const handleBuyAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowBuyModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading size="lg" />
      </div>
    );
  }

  const stocks = assets.filter(asset => asset.type === 'stock');
  const fixedIncome = assets.filter(asset => asset.type === 'fixed_income');

  return (
    <div className="space-y-6">
      <Tabs defaultValue="stocks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stocks">Ações ({stocks.length})</TabsTrigger>
          <TabsTrigger value="fixed">Renda Fixa ({fixedIncome.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="stocks">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stocks.map((asset) => (
              <Card key={asset.id} className="banking-card hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-bold text-[#333533]">
                        {asset.symbol}
                      </CardTitle>
                      <p className="text-sm text-gray-600 truncate">
                        {asset.name}
                      </p>
                    </div>
                    <Badge variant={asset.variation >= 0 ? "default" : "destructive"}>
                      {asset.variation >= 0 ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {formatPercent(asset.variation)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Preço atual</p>
                      <p className="text-xl font-bold text-[#F18805]">
                        {formatCurrency(asset.currentPrice)}
                      </p>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Anterior:</span>
                      <span>{formatCurrency(asset.previousPrice)}</span>
                    </div>

                    <Button
                      onClick={() => handleBuyAsset(asset)}
                      className="w-full bg-[#F18805] hover:bg-[#D97706]"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Comprar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="fixed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fixedIncome.map((asset) => (
              <Card key={asset.id} className="banking-card hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-[#333533]">
                    {asset.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Investimento mínimo</p>
                        <p className="text-lg font-bold text-[#F18805]">
                          {formatCurrency(asset.minInvestment || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Taxa de juros</p>
                        <p className="text-lg font-bold text-green-600">
                          {asset.interestRate?.toFixed(2)}% a.a.
                        </p>
                      </div>
                    </div>

                    {asset.maturityDate && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        Vencimento: {new Date(asset.maturityDate).toLocaleDateString('pt-BR')}
                      </div>
                    )}

                    <Button
                      onClick={() => handleBuyAsset(asset)}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Investir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de compra */}
      {selectedAsset && (
        <BuyAssetModal
          asset={selectedAsset}
          open={showBuyModal}
          onOpenChange={setShowBuyModal}
          onSuccess={() => {
            setShowBuyModal(false);
            setSelectedAsset(null);
          }}
        />
      )}
    </div>
  );
};
