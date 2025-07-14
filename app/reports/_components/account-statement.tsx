'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loading } from '@/components/ui/loading';
import { accountsApi } from '@/lib/api';
import { Account, Transaction } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ArrowUpRight, ArrowDownRight, ArrowRightLeft, TrendingUp, TrendingDown, Download, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { parseApiDate, formatDateToBrazilian } from '@/lib/utils';

export const AccountStatement: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current_month');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const accountsData = await accountsApi.getAccounts();
        setAccounts(accountsData);
        if (accountsData.length > 0) {
          setSelectedAccount(accountsData[0].id);
        }
      } catch (error) {
        console.error('Erro ao carregar contas:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar contas",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [toast]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!selectedAccount) return;

      try {
        const transactionsData = await accountsApi.getTransactions(selectedAccount);
        setTransactions(transactionsData);
      } catch (error) {
        console.error('Erro ao carregar transações:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar transações",
          variant: "destructive",
        });
      }
    };

    fetchTransactions();
  }, [selectedAccount, toast]);

  useEffect(() => {
    const filterTransactions = () => {
      let filtered = [...transactions];
      const now = new Date();

      switch (selectedPeriod) {
        case 'current_month':
          const startCurrentMonth = startOfMonth(now);
          const endCurrentMonth = endOfMonth(now);
          filtered = transactions.filter(t => {
            const date = parseApiDate(t.date);
            return date >= startCurrentMonth && date <= endCurrentMonth;
          });
          break;
        case 'last_month':
          const lastMonth = subMonths(now, 1);
          const startLastMonth = startOfMonth(lastMonth);
          const endLastMonth = endOfMonth(lastMonth);
          filtered = transactions.filter(t => {
            const date = parseApiDate(t.date);
            return date >= startLastMonth && date <= endLastMonth;
          });
          break;
        case 'custom':
          if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            filtered = transactions.filter(t => {
              const date = parseApiDate(t.date);
              return date >= start && date <= end;
            });
          }
          break;
        default:
          filtered = transactions;
      }

      setFilteredTransactions(filtered.sort((a, b) => parseApiDate(b.date).getTime() - parseApiDate(a.date).getTime()));
    };

    filterTransactions();
  }, [transactions, selectedPeriod, startDate, endDate]);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownRight className="h-4 w-4 text-green-600" />;
      case 'withdraw':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case 'transfer':
        return <ArrowRightLeft className="h-4 w-4 text-blue-600" />;
      case 'buy':
        return <TrendingUp className="h-4 w-4 text-[#F18805]" />;
      case 'sell':
        return <TrendingDown className="h-4 w-4 text-purple-600" />;
      default:
        return <ArrowRightLeft className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionType = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Depósito';
      case 'withdraw':
        return 'Saque';
      case 'transfer':
        return 'Transferência';
      case 'buy':
        return 'Compra de Ativo';
      case 'sell':
        return 'Venda de Ativo';
      default:
        return 'Transação';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'sell':
        return 'text-green-600';
      case 'withdraw':
      case 'buy':
        return 'text-red-600';
      default:
        return 'text-gray-900';
    }
  };

  const getAccountName = (type: string) => {
    return type === 'current' ? 'Conta Corrente' : 'Conta Investimento';
  };

  const calculateSummary = () => {
    const deposits = filteredTransactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0);
    const withdraws = filteredTransactions.filter(t => t.type === 'withdraw').reduce((sum, t) => sum + t.amount, 0);
    const transfers = filteredTransactions.filter(t => t.type === 'transfer').length;

    return { deposits, withdraws, transfers };
  };

  const summary = calculateSummary();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="banking-card">
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Conta</Label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma conta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {getAccountName(account.type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Período</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current_month">Mês Atual</SelectItem>
                  <SelectItem value="last_month">Mês Anterior</SelectItem>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="custom">Período Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedPeriod === 'custom' && (
              <>
                <div className="space-y-2">
                  <Label>Data Inicial</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Final</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resumo do período */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="banking-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Depósitos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.deposits)}
            </p>
          </CardContent>
        </Card>

        <Card className="banking-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Saques</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.withdraws)}
            </p>
          </CardContent>
        </Card>

        <Card className="banking-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Transferências</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {summary.transfers}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de transações */}
      <Card className="banking-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            Extrato ({filteredTransactions.length} transações)
          </CardTitle>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma transação encontrada no período selecionado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {getTransactionType(transaction.type)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateToBrazilian(transaction.date)}
                      </p>
                      {transaction.description && (
                        <p className="text-xs text-gray-600 mt-1">
                          {transaction.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${getAmountColor(transaction.type)}`}>
                      {transaction.type === 'withdraw' || transaction.type === 'buy' ? '-' : '+'}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
