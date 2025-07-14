
'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccountStatement } from './account-statement';
import { InvestmentSummary } from './investment-summary';
import { TaxReport } from './tax-report';
import { FileText, TrendingUp, Calculator } from 'lucide-react';

export const ReportsContent: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#F18805] to-[#D97706] rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Relatórios</h1>
          <p className="text-white/90">
            Acompanhe suas movimentações e investimentos
          </p>
        </div>

        {/* Tabs de navegação */}
        <Tabs defaultValue="statement" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="statement" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Extrato</span>
            </TabsTrigger>
            <TabsTrigger value="investments" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Investimentos</span>
            </TabsTrigger>
            <TabsTrigger value="taxes" className="flex items-center space-x-2">
              <Calculator className="h-4 w-4" />
              <span>IR</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="statement">
            <AccountStatement />
          </TabsContent>

          <TabsContent value="investments">
            <InvestmentSummary />
          </TabsContent>

          <TabsContent value="taxes">
            <TaxReport />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};
