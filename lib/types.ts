export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
}

export interface Account {
  id: string;
  type: 'current' | 'investment';
  balance: number;
  userId: string;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'transfer' | 'buy' | 'sell';
  amount: number;
  date: string;
  description: string;
  accountId: string;
  fromAccountId?: string;
  toAccountId?: string;
}

export interface Asset {
  id: string;
  symbol?: string;
  name: string;
  currentPrice: number;
  previousPrice?: number;
  variation?: number;
  dailyVariation?: number;
  type?: 'stock' | 'fixed_income';
  assetType?: 'stock' | 'fixed-income';
  sector?: string;
  rate?: number;
  rateType?: string;
  maturity?: string;
  minimumInvestment?: number;
  minInvestment?: number;
  maturityDate?: string;
  interestRate?: number;
}

export interface Position {
  id: string;
  assetId: string;
  asset: Asset;
  quantity: number;
  averagePrice: number;
  currentValue: number;
  accountId: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  cpf: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DepositRequest {
  description?: string;
  amount: number;
}

export interface WithdrawRequest {
  description?: string;
  amount: number;
}

export interface TransferRequest {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
}

export interface BuyAssetRequest {
  accountId: string;
  assetId: string;
  assetSymbol: string;
  quantity: number;
  assetType?: 'stock' | 'fixed-income';
}

export interface SellAssetRequest {
  accountId: string;
  assetId: string;
  assetSymbol: string;
  positionId?: string;
  quantity: number;
  assetType?: 'stock' | 'fixed-income';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
