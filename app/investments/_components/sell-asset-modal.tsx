
'use client';

import { useState } from 'react';
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
import { marketApi } from '@/lib/api';
import { Position } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Calculator, AlertTriangle, TrendingDown } from 'lucide-react';

const sellAssetSchema = z.object({
  quantity: z.string()
    .min(1, 'Quantidade é obrigatória')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Quantidade deve ser maior que zero'),
});

type SellAssetForm = z.infer<typeof sellAssetSchema>;

interface SellAssetModalProps {
  position: Position;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const SellAssetModal: React.FC<SellAssetModalProps> = ({
  position,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<SellAssetForm>({
    resolver: zodResolver(sellAssetSchema),
  });

  const watchedQuantity = watch('quantity');
  const quantity = watchedQuantity ? Number(watchedQuantity) : 0;
  
  // Calcular valores
  const saleValue = quantity * position.asset.currentPrice;
  const brokerageFee = position.asset.type === 'stock' ? saleValue * 0.01 : 0; // 1% para ações
  
  // Calcular ganho/perda para tributação
  const averageCostPerUnit = position.averagePrice;
  const gainPerUnit = position.asset.currentPrice - averageCostPerUnit;
  const totalGain = gainPerUnit * quantity;
  
  // Calcular IR (15% para ações, 22% para renda fixa) sobre o lucro
  let irTax = 0;
  if (totalGain > 0) {
    if (position.asset.type === 'stock') {
      irTax = totalGain * 0.15; // 15% IR sobre lucro de ações
    } else {
      irTax = totalGain * 0.22; // 22% IR sobre lucro de renda fixa
    }
  }
  
  const netValue = saleValue - brokerageFee - irTax;

  const onSubmit = async (data: SellAssetForm) => {
    const quantity = Number(data.quantity);
    
    if (quantity > position.quantity) {
      toast({
        title: "Quantidade inválida",
        description: "Quantidade não pode ser maior que a posição atual",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await marketApi.sellAsset({
        assetSymbol: position.asset.symbol || position.asset.id,
        quantity,
      }, position.asset.type || 'stock');

      toast({
        title: "Venda realizada!",
        description: `${quantity} ${position.asset.type === 'stock' ? 'ações' : 'unidades'} de ${position.asset.symbol || position.asset.name} vendidas`,
      });

      reset();
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erro na venda",
        description: error.response?.data?.message || "Erro ao processar venda",
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

  const exceedsQuantity = quantity > position.quantity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            <span>Vender {position.asset.symbol || position.asset.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações da posição */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">{position.asset.name}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Quantidade atual:</span>
                <p className="font-medium">{position.quantity}</p>
              </div>
              <div>
                <span className="text-gray-600">Preço atual:</span>
                <p className="font-medium">{formatCurrency(position.asset.currentPrice)}</p>
              </div>
              <div>
                <span className="text-gray-600">Preço médio:</span>
                <p className="font-medium">{formatCurrency(position.averagePrice)}</p>
              </div>
              <div>
                <span className="text-gray-600">Valor da posição:</span>
                <p className="font-medium">{formatCurrency(position.currentValue)}</p>
              </div>
            </div>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">
                Quantidade a vender (máx: {position.quantity})
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={position.quantity}
                step={position.asset.type === 'stock' ? '1' : '0.01'}
                placeholder="0"
                {...register('quantity')}
              />
              {errors.quantity && (
                <p className="text-sm text-red-600">{errors.quantity.message}</p>
              )}
              {exceedsQuantity && (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  <p className="text-sm">Quantidade excede a posição atual</p>
                </div>
              )}
            </div>

            {/* Resumo da venda */}
            {quantity > 0 && !exceedsQuantity && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h4 className="font-medium">Resumo da operação:</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Valor bruto da venda:</span>
                    <span>{formatCurrency(saleValue)}</span>
                  </div>
                  
                  {brokerageFee > 0 && (
                    <div className="flex justify-between text-orange-600">
                      <span>Taxa de corretagem (1%):</span>
                      <span>-{formatCurrency(brokerageFee)}</span>
                    </div>
                  )}
                  
                  {irTax > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>IR sobre lucro ({position.asset.type === 'stock' ? '15%' : '22%'}):</span>
                      <span>-{formatCurrency(irTax)}</span>
                    </div>
                  )}
                  
                  <hr className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Valor líquido a receber:</span>
                    <span className="text-green-600">{formatCurrency(netValue)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Resultado da operação:</span>
                    <span className={totalGain >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {totalGain >= 0 ? '+' : ''}{formatCurrency(totalGain)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Informações sobre tributação */}
            <div className="bg-yellow-50 border-yellow-200 p-3 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-1">⚠️ Tributação</h4>
              <p className="text-sm text-yellow-800">
                {position.asset.type === 'stock' 
                  ? 'Ações: 15% de IR sobre o lucro + 1% de taxa de corretagem'
                  : 'Renda Fixa: 22% de IR sobre o lucro'
                }
              </p>
            </div>

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
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={submitting || quantity <= 0 || exceedsQuantity}
              >
                {submitting ? <Loading size="sm" /> : 'Confirmar Venda'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
