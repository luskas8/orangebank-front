
'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AssetsList } from './assets-list';
import { Portfolio } from './portfolio';
import { TrendingUp, Briefcase } from 'lucide-react';

export const InvestmentsContent: React.FC = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#F18805] to-[#D97706] rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Investimentos</h1>
          <p className="text-white/90">
            Faça seu dinheiro trabalhar para você
          </p>
        </div>

        {/* Tabs de navegação */}
        <Tabs defaultValue="market" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="market" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Mercado</span>
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4" />
              <span>Meu Portfólio</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="market">
            <AssetsList />
          </TabsContent>

          <TabsContent value="portfolio">
            <Portfolio />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};
