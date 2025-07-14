
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
import { PiggyBank, DollarSign, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const depositSchema = z.object({
  amount: z.string()
    .min(1, 'Valor é obrigatório')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Valor deve ser maior que zero')
    .refine((val) => Number(val) <= 10000, 'Valor máximo de R$ 10.000,00 por depósito'),
});

type DepositForm = z.infer<typeof depositSchema>;

export const DepositContent: React.FC = () => {
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
  } = useForm<DepositForm>({
    resolver: zodResolver(depositSchema),
  });

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

  const onSubmit = async (data: DepositForm) => {
    if (!currentAccount) return;

    setSubmitting(true);
    try {
      const amount = Number(data.amount);
      await accountsApi.deposit({
        amount,
      });

      toast({
        title: "Depósito realizado!",
        description: `R$ ${amount.toFixed(2)} depositado com sucesso`,
      });

      reset();
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: "Erro no depósito",
        description: error.response?.data?.message || "Erro ao processar depósito",
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

  return (
    <MainLayout>
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PiggyBank className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-[#333533] mb-2">Depósito</h1>
          <p className="text-gray-600">Adicione dinheiro à sua conta corrente</p>
        </div>

        {/* Informações da conta */}
        <Card className="banking-card">
          <CardHeader>
            <CardTitle className="text-lg">Conta de Destino</CardTitle>
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

        {/* Formulário de depósito */}
        <Card className="banking-card">
          <CardHeader>
            <CardTitle className="text-lg">Valor do Depósito</CardTitle>
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
                    max="10000"
                    placeholder="0,00"
                    className="pl-10"
                    {...register('amount')}
                  />
                </div>
                {errors.amount && (
                  <p className="text-sm text-red-600">{errors.amount.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  Valor máximo: R$ 10.000,00 por depósito
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={submitting}
                >
                  {submitting ? <Loading size="sm" /> : 'Confirmar Depósito'}
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

        {/* Informações sobre o depósito */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-medium text-blue-900 mb-2">ℹ️ Informações</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Depósitos são processados instantaneamente</li>
              <li>• Valor máximo de R$ 10.000,00 por operação</li>
              <li>• Não há taxa para depósitos</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};
