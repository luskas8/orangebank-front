
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { accountsApi } from '@/lib/api';
import { Account } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Wallet, DollarSign, ArrowLeft, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const withdrawSchema = z.object({
  amount: z.string()
    .min(1, 'Valor é obrigatório')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Valor deve ser maior que zero'),
});

type WithdrawForm = z.infer<typeof withdrawSchema>;

export const WithdrawContent: React.FC = () => {
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<WithdrawForm>({
    resolver: zodResolver(withdrawSchema),
  });

  const watchedAmount = watch('amount');
  const numericAmount = watchedAmount ? Number(watchedAmount) : 0;

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const accounts = await accountsApi.getAccounts();
        const current = accounts.find(acc => acc.type === 'current');
        setCurrentAccount(current || null);
      } catch (error) {
        console.error('Erro ao carregar conta:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar informações da conta",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, [toast]);

  const onSubmit = async (data: WithdrawForm) => {
    if (!currentAccount) return;

    const amount = Number(data.amount);
    
    if (amount > currentAccount.balance) {
      toast({
        title: "Saldo insuficiente",
        description: "O valor do saque não pode ser maior que o saldo disponível",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await accountsApi.withdraw({
        amount,
      });

      toast({
        title: "Saque realizado!",
        description: `R$ ${amount.toFixed(2)} sacado com sucesso`,
      });

      reset();
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: "Erro no saque",
        description: error.response?.data?.message || "Erro ao processar saque",
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

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <Loading size="lg" />
        </div>
      </MainLayout>
    );
  }

  if (!currentAccount) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto">
          <Card className="banking-card">
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600 mb-4">
                Conta corrente não encontrada
              </p>
              <Link href="/dashboard">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const hasInsufficientBalance = numericAmount > currentAccount.balance;

  return (
    <MainLayout>
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#333533] mb-2">Saque</h1>
          <p className="text-gray-600">Retire dinheiro da sua conta corrente</p>
        </div>

        {/* Informações da conta */}
        <Card className="banking-card">
          <CardHeader>
            <CardTitle className="text-lg">Saldo Disponível</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conta Corrente</p>
                <p className="font-medium">Saldo atual</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-[#F18805]">
                  {formatCurrency(currentAccount.balance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulário de saque */}
        <Card className="banking-card">
          <CardHeader>
            <CardTitle className="text-lg">Valor do Saque</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={currentAccount.balance}
                    placeholder="0,00"
                    className="pl-10"
                    {...register('amount')}
                  />
                </div>
                {errors.amount && (
                  <p className="text-sm text-red-600">{errors.amount.message}</p>
                )}
                {hasInsufficientBalance && numericAmount > 0 && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <p className="text-sm">Saldo insuficiente</p>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Valor máximo: {formatCurrency(currentAccount.balance)}
                </p>
              </div>

              {/* Botões de valores rápidos */}
              <div className="grid grid-cols-3 gap-2">
                {[50, 100, 200].filter(value => value <= currentAccount.balance).map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const form = document.getElementById('amount') as HTMLInputElement;
                      if (form) form.value = value.toString();
                    }}
                  >
                    R$ {value}
                  </Button>
                ))}
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={submitting || hasInsufficientBalance || numericAmount <= 0}
                >
                  {submitting ? <Loading size="sm" /> : 'Confirmar Saque'}
                </Button>

                <Link href="/dashboard" className="block">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar ao Dashboard
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Informações sobre o saque */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <h3 className="font-medium text-yellow-900 mb-2">⚠️ Importante</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Saques são processados instantaneamente</li>
              <li>• Verifique se possui saldo suficiente</li>
              <li>• Não há taxa para saques</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};
