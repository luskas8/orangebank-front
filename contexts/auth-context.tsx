
'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import { User, LoginRequest, RegisterRequest } from '@/lib/types';
import { authApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage, useIsClient } from '@/hooks/use-local-storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<boolean>;
  register: (data: RegisterRequest) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useLocalStorage<string | null>('token', 'string' as any);
  const isClient = useIsClient();
  const { toast } = useToast();
  
  // Use ref to track if initialization has already been attempted
  const hasInitialized = useRef(false);
  const lastTokenValue = useRef<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      // Só executa no cliente e quando o hook de localStorage estiver pronto
      if (!isClient) {
        return;
      }
      // Se o token não mudou, não faz nada
      if (hasInitialized.current && lastTokenValue.current === token) {
        return;
      }
      
      hasInitialized.current = true;
      lastTokenValue.current = token;
      
      try {
        if (token) {
          console.log('Token encontrado no localStorage, validando...');
          // Verificar se o token não expirou
          try {
            const decoded: any = jwtDecode(token);
            if (decoded.exp * 1000 > Date.now()) {
              console.log('Token válido, buscando perfil do usuário...');
              try {
                const userData = await authApi.getProfile();
                console.log('Perfil do usuário obtido:', userData);
                setUser(userData);
                console.log('Usuário autenticado com sucesso:', userData.name);
              } catch (profileError: any) {
                console.error('Erro ao buscar perfil do usuário:', profileError);
                // Se o token for inválido, remove ele
                if (profileError.response?.status === 401) {
                  console.log('Token inválido, removendo...');
                  setToken(null);
                  setUser(null);
                } else {
                  // Se for outro erro, cria um usuário básico com as informações do token
                  console.log('Erro de rede, usando dados do token...');
                  setUser({
                    id: decoded.sub || decoded.userId || '1',
                    name: decoded.name || 'Usuário',
                    email: decoded.email || '',
                    cpf: decoded.cpf || ''
                  });
                }
              }
            } else {
              console.log('Token expirado, removendo...');
              setToken(null);
              setUser(null);
            }
          } catch (decodeError) {
            console.error('Erro ao decodificar token:', decodeError);
            setToken(null);
            setUser(null);
          }
        } else {
          console.log('Nenhum token encontrado');
          setUser(null);
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Só inicializa quando estiver no cliente
    if (isClient) {
      initializeAuth();
    } else {
      setLoading(false);
    }
  }, [isClient, token]);

  const login = async (data: LoginRequest): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authApi.login(data);
      
      setToken(response.token);
      setUser(response.user);
      
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo(a), ${response.user.name}!`,
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.response?.data?.message || "Credenciais inválidas",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterRequest): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authApi.register(data);
      
      setToken(response.token);
      setUser(response.user);
      
      toast({
        title: "Conta criada com sucesso!",
        description: `Bem-vindo(a) ao OrangeBank, ${response.user.name}!`,
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.response?.data?.message || "Erro ao criar conta",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
