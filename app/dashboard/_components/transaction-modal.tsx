
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Transaction } from '@/lib/types';
import { formatDateToBrazilian } from '@/lib/utils';
import {
  ArrowDownCircle,
  ArrowLeftRight,
  ArrowUpCircle,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  Receipt,
  TrendingDown,
  TrendingUp
} from 'lucide-react';

interface TransactionDetailsModalProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  transaction,
  open,
  onOpenChange,
}) => {
  console.log('TransactionDetailsModal rendered with transaction:', transaction);
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getTransactionIcon = (
    type: 'internal' | 'external' | 'asset_purchase' | 'asset_sale',
    category: 'deposit' | 'withdrawal' | 'transfer' | 'investment'
  ) => {
    switch (category) {
      case 'deposit':
        return <ArrowDownCircle className="h-6 w-6 text-green-600" />;
      case 'withdrawal':
        return <ArrowUpCircle className="h-6 w-6 text-red-600" />;
      case 'transfer':
        return <ArrowLeftRight className="h-6 w-6 text-blue-600" />;
      default:
        switch (type) {
          case 'asset_purchase':
            return <TrendingUp className="h-6 w-6 text-[#F18805]" />;
          case 'asset_sale':
            return <TrendingDown className="h-6 w-6 text-purple-600" />;
          default:
            return <Receipt className="h-6 w-6 text-gray-600" />;
        }
    }
  };

  const getTransactionLabel = (
    type: 'internal' | 'external' | 'asset_purchase' | 'asset_sale',
    category: 'deposit' | 'withdrawal' | 'transfer' | 'investment'
  ) => {
    switch (category) {
      case 'deposit':
        return 'Depósito';
      case 'withdrawal':
        return 'Saque';
      case 'transfer':
        return 'Transferência';
      default:
        switch (type) {
          case 'asset_purchase':
        return 'Compra';
        case 'asset_sale':
          return 'Venda';
        default:
          return 'Transação';
        }
    }
  };

  const getTransactionColor = (category: 'deposit' | 'withdrawal' | 'transfer' | 'investment') => {
    switch (category) {
      case 'deposit':
        return 'bg-green-100 text-green-800';
      case 'withdrawal':
        return 'bg-red-100 text-red-800';
      case 'transfer':
        return 'bg-blue-100 text-blue-800';
      case 'investment':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Receipt className="h-5 w-5 text-[#F18805]" />
            <span>Detalhes da Transação</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cabeçalho da transação */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                {getTransactionIcon(transaction.type, transaction.category)}
                <div>
                  <h3 className="font-medium text-lg">{getTransactionLabel(transaction.type, transaction.category)}</h3>
                  <Badge className={getTransactionColor(transaction.category)}>
                    {getTransactionLabel(transaction.type, transaction.category)}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#F18805]">
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            </div>
          </div>

          {/* Informações da transação */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Data e hora</p>
                <p className="font-medium">{formatDateToBrazilian(transaction.date)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Descrição</p>
                <p className="font-medium">{transaction.description}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <DollarSign className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Valor</p>
                <p className="font-medium">
                  {transaction.category === 'withdrawal' ? '-' : '+'}
                  {formatCurrency(transaction.amount)}
                  </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Building2 className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">ID da Transação</p>
                <p className="font-medium font-mono text-sm">{transaction.id}</p>
              </div>
            </div>

            {/* Informações específicas para transferências */}
            {transaction.category === 'transfer' && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  Detalhes da Transferência
                  {transaction.type === 'internal' ? ' Interna' : ''}
                </h4>
                <div className="space-y-2 text-sm">
                  {transaction.fromAccountId && transaction.type !== 'internal' && (
                    <>
                      <div>
                        <span className="text-blue-700">Conta de origem:</span>
                        <p className="font-mono">{transaction.fromAccountId}</p>
                      </div>
                      <div>
                        <p className="font-mono">
                          <span className="text-blue-700">CPF:</span>
                          {transaction.fromAccount.user.cpf}
                        </p>
                      </div>
                    </>
                  )}
                  {transaction.toAccountId && (
                    <>
                    <div>
                        <span className="text-blue-700">Conta de destino:</span>
                      <p className="font-mono">{transaction.toAccountId}</p>
                    </div>
                    {transaction.type !== 'internal' && (
                    <>
                      <div>
                        <p className="font-mono">
                          <span className="text-blue-700">CPF:</span>
                          {transaction.toAccount.user.cpf}
                        </p>
                      </div>
                      </>
                    )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Informações específicas para investimentos */}
            {(transaction.category === 'investment') && (
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-medium text-orange-900 mb-2">
                  Detalhes do {transaction.type === 'asset_purchase' ? 'Investimento' : 'Resgate'}
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-orange-700">Conta:</span>
                    <p className="font-mono">{transaction.accountId}</p>
                  </div>
                  <div>
                    <span className="text-orange-700">Tipo de operação:</span>
                    <p className="capitalize">{transaction.type === 'asset_purchase' ? 'Compra' : 'Venda'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botão de fechamento */}
          <div className="pt-4">
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full bg-[#F18805] hover:bg-[#D97706]"
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
