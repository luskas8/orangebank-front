
import axios, { AxiosResponse } from 'axios';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User, 
  Account, 
  Transaction, 
  Asset, 
  Position,
  DepositRequest,
  WithdrawRequest,
  TransferRequest,
  CreateAccountRequest,
  BuyAssetRequest,
  SellAssetRequest,
  ApiResponse 
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

// Cliente para API externa (backend)
const externalApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cliente para API interna (Next.js API routes)
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptador para adicionar token de autenticação (para API externa)
externalApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptador para tratar respostas (para API externa)
externalApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Evita redirecionamento se já estiver na página de login
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Interceptador para adicionar token de autenticação (para API interna)
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptador para tratar respostas (para API interna)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Evita redirecionamento se já estiver na página de login
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/register', data);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    try {
      const response: AxiosResponse<User> = await api.get('/auth/profile');
      console.log('Perfil do usuário obtido:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar perfil:', error);
      throw error;
    }
  },
};

// Accounts API
export const accountsApi = {
  getAccounts: async (): Promise<Account[]> => {
    // Usa a API route interna em vez da externa diretamente
    const response: AxiosResponse<Account[]> = await api.get('/accounts');
    return response.data;
  },

  getAccountById: async (id: string): Promise<Account> => {
    const response: AxiosResponse<Account> = await externalApi.get(`/account/get/${id}`);
    return response.data;
  },

  createAccount: async (data: CreateAccountRequest): Promise<ApiResponse<Account>> => {
    const response: AxiosResponse<ApiResponse<Account>> = await externalApi.post('/account/create', {
      type: data.type,
      balance: data.balance || 0,
      active: data.active !== undefined ? data.active : true,
      userId: data.userId
    });
    return response.data;
  },

  deposit: async (data: DepositRequest): Promise<ApiResponse<Transaction>> => {
    const response: AxiosResponse<ApiResponse<Transaction>> = await externalApi.post('/account/deposit', {
      amount: data.amount,
      description: data.description
    });
    return response.data;
  },

  withdraw: async (data: WithdrawRequest): Promise<ApiResponse<Transaction>> => {
    const response: AxiosResponse<ApiResponse<Transaction>> = await externalApi.post('/account/withdraw', {
      amount: data.amount,
      description: data.description
    });
    return response.data;
  },

  transfer: async (data: TransferRequest): Promise<ApiResponse<Transaction>> => {
    const response: AxiosResponse<ApiResponse<Transaction>> = await externalApi.post('/account/transfer', {
      toAccountId: data.toAccountId,
      fromAccountType: data.fromAccountType,
      amount: data.amount,
      description: data.description
    });
    return response.data;
  },

  getTransactions: async (accountId: string): Promise<Transaction[]> => {
    const response: AxiosResponse<Transaction[]> = await externalApi.get(`/account/transactions/${accountId}`);
    return response.data;
  },
};

// Market API
export const marketApi = {
  getAssets: async (): Promise<Asset[]> => {
    // Combina stocks e fixed-income em uma única lista
    const [stocksResponse, fixedIncomeResponse] = await Promise.all([
      externalApi.get('/market/stocks'),
      externalApi.get('/market/fixed-incomes')
    ]);
    
    const stocks = stocksResponse.data.map((stock: any) => ({
      ...stock,
      type: 'stock',
      symbol: stock.id,
      currentPrice: stock.currentPrice,
      variation: stock.dailyVariation
    }));
    
    const fixedIncomes = fixedIncomeResponse.data.map((asset: any) => ({
      ...asset,
      type: 'fixed_income',
      symbol: asset.id,
      currentPrice: asset.minimumInvestment,
      interestRate: asset.rate,
      maturityDate: asset.maturity,
      minInvestment: asset.minimumInvestment
    }));
    
    return [...stocks, ...fixedIncomes];
  },

  getAssetById: async (id: string): Promise<Asset> => {
    // Primeiro tenta buscar como stock, depois como fixed-income
    try {
      const response = await externalApi.get(`/market/stocks`);
      const stock = response.data.find((s: any) => s.id === id);
      if (stock) return { 
        ...stock, 
        type: 'stock',
        symbol: stock.id,
        currentPrice: stock.currentPrice,
        variation: stock.dailyVariation
      };
    } catch (error) {
      // Ignora erro e tenta fixed-income
    }
    
    try {
      const response = await externalApi.get(`/market/fixed-incomes`);
      const fixedIncome = response.data.find((f: any) => f.id === id);
      if (fixedIncome) return { 
        ...fixedIncome, 
        type: 'fixed_income',
        symbol: fixedIncome.id,
        currentPrice: fixedIncome.minimumInvestment,
        interestRate: fixedIncome.rate,
        maturityDate: fixedIncome.maturity,
        minInvestment: fixedIncome.minimumInvestment
      };
    } catch (error) {
      // Ignora erro
    }
    
    throw new Error(`Asset ${id} not found`);
  },

  buyAsset: async (data: BuyAssetRequest, assetType: 'stock' | 'fixed_income'): Promise<ApiResponse<Transaction>> => {
    // Determina o endpoint baseado no tipo de asset
    const endpoint = assetType === 'stock' ? '/market/buy/stock' : '/market/buy/fixed-income';
    const response: AxiosResponse<ApiResponse<Transaction>> = await externalApi.post(endpoint, {
      assetSymbol: data.assetSymbol,
      quantity: data.quantity
    });
    return response.data;
  },

  sellAsset: async (data: SellAssetRequest, assetType: 'stock' | 'fixed_income'): Promise<ApiResponse<Transaction>> => {
    // Determina o endpoint baseado no tipo de asset
    const endpoint = assetType === 'stock' ? '/market/sell/stock' : '/market/sell/fixed-income';
    const response: AxiosResponse<ApiResponse<Transaction>> = await externalApi.post(endpoint, {
      assetSymbol: data.assetSymbol,
      quantity: data.quantity
    });
    return response.data;
  },

  getPositions: async (accountId: string): Promise<Position[]> => {
    // A API não tem endpoint específico para posições, retorna array vazio por enquanto
    // Pode ser implementado futuramente ou calculado baseado no histórico de transações
    return [];
  },
};

export default api;
