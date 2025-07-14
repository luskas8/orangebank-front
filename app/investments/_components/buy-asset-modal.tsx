
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loading } from '@/components/ui/loading';
import { accountsApi, marketApi } from '@/lib/api';
import { Asset, Account } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Calculator, DollarSign, AlertTriangle } from 'lucide-react';

const buyAssetSchema = z.object({
  quantity: z.string()
    .min(1, 'Quantidade é obrigatória')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Quantidade deve ser maior que zero'),
});

type BuyAssetForm = z.infer<typeof buyAssetSchema>;

interface BuyAssetModalProps {
  asset: Asset;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const BuyAssetModal: React.FC<BuyAssetModalProps> = ({
  asset,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [investmentAccount, setInvestmentAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<BuyAssetForm>({
    resolver: zodResolver(buyAssetSchema),
  });

  const watchedQuantity = watch('quantity');
  const quantity = watchedQuantity ? Number(watchedQuantity) : 0;
  
  // Calcular valores
  const totalValue = quantity * asset.currentPrice;
  const brokerageFee = asset.type === 'stock' ? totalValue * 0.01 : 0; // 1% para ações
  const finalValue = totalValue + brokerageFee;

  useEffect(() => {
    const fetchInvestmentAccount = async () => {
      if (!open) return;
      
      setLoading(true);
      try {
        const accounts = await accountsApi.getAccounts();
        const investment = accounts.find(acc => acc.type === 'investment');
        setInvestmentAccount(investment || null);
      } catch (error) {
        console.error('Erro ao carregar conta de investimento:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar conta de investimento",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvestmentAccount();
  }, [open, toast]);

  const onSubmit = async (data: BuyAssetForm) => {
    if (!investmentAccount) return;

    const quantity = Number(data.quantity);
    
    if (finalValue > investmentAccount.balance) {
      toast({
        title: "Saldo insuficiente",
        description: "Saldo insuficiente na conta de investimento",
        variant: "destructive",
      });
      return;
    }

    // Verificar investimento mínimo para renda fixa
    if (asset.type === 'fixed_income' && asset.minInvestment && totalValue < asset.minInvestment) {
      toast({
        title: "Valor mínimo não atingido",
        description: `Investimento mínimo: ${formatCurrency(asset.minInvestment)}`,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await marketApi.buyAsset({
        assetSymbol: asset.symbol || asset.id,
        quantity,
      }, asset.type || 'stock');

      toast({
        title: "Compra realizada!",
        description: `${quantity} ${asset.type === 'stock' ? 'ações' : 'unidades'} de ${asset.symbol || asset.name} compradas`,
      });

      reset();
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erro na compra",
        description: error.response?.data?.message || "Erro ao processar compra",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const hasInsufficientBalance = investmentAccount && finalValue > investmentAccount.balance;
  const hasMinimumInvestment = asset.type === 'fixed_income' && 
    asset.minInvestment !== undefined && 
    totalValue > 0 && 
    totalValue < asset.minInvestment;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5 text-[#F18805]" />
            <span>Comprar {asset.symbol || asset.name}</span>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loading size="lg" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Informações do ativo */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">{asset.name}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Preço unitário:</span>
                  <p className="font-medium">{formatCurrency(asset.currentPrice)}</p>
                </div>
                {asset.type === 'fixed_income' && asset.interestRate && (
                  <div>
                    <span className="text-gray-600">Taxa:</span>
                    <p className="font-medium">{asset.interestRate.toFixed(2)}% a.a.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Saldo disponível */}
            {investmentAccount && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">Saldo na conta investimento:</p>
                <p className="text-lg font-bold text-blue-900">
                  {formatCurrency(investmentAccount.balance)}
                </p>
              </div>
            )}

            {/* Formulário */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">
                  {asset.type === 'stock' ? 'Quantidade de ações' : 'Quantidade'}
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  step={asset.type === 'stock' ? '1' : '0.01'}
                  placeholder="0"
                  {...register('quantity')}
                />
                {errors.quantity && (
                  <p className="text-sm text-red-600">{errors.quantity.message}</p>
                )}
              </div>

              {/* Resumo da compra */}
              {quantity > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <h4 className="font-medium">Resumo da operação:</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Valor dos ativos:</span>
                      <span>{formatCurrency(totalValue)}</span>
                    </div>
                    {brokerageFee > 0 && (
                      <div className="flex justify-between text-orange-600">
                        <span>Taxa de corretagem (1%):</span>
                        <span>{formatCurrency(brokerageFee)}</span>
                      </div>
                    )}
                    <hr className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>Total a ser debitado:</span>
                      <span className="text-[#F18805]">{formatCurrency(finalValue)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Alertas */}
              {hasInsufficientBalance && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertTriangle className="h-4 w-4" />
                  <p className="text-sm">Saldo insuficiente na conta de investimento</p>
                </div>
              )}

              {hasMinimumInvestment && (
                <div className="flex items-center space-x-2 text-yellow-600 bg-yellow-50 p-3 rounded-lg">
                  <AlertTriangle className="h-4 w-4" />
                  <p className="text-sm">
                    Investimento mínimo: {formatCurrency(asset.minInvestment!)}
                  </p>
                </div>
              )}

              {/* Botões */}
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#F18805] hover:bg-[#D97706]"
                  disabled={submitting || quantity <= 0 || hasInsufficientBalance || hasMinimumInvestment}
                >
                  {submitting ? <Loading size="sm" /> : 'Confirmar Compra'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
