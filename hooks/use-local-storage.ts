'use client';

import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Estado para armazenar nosso valor
  // Passar a função inicial para useState então a lógica só é executada uma vez
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      // Pega do localStorage pela key
      const item = window.localStorage.getItem(key);
      // Para strings simples (como tokens), não faz parse JSON
      if (typeof initialValue === 'string') {
        return (item as T) || initialValue;
      }
      // Para outros tipos, parseia JSON armazenado ou se nenhum retorna initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Se erro também retorna initialValue
      console.error('Erro ao acessar localStorage:', error);
      return initialValue;
    }
  });

  // Retorna uma versão wrapped da função setter do useState que...
  // ... persiste o novo valor para localStorage.
  const setValue = (value: T) => {
    try {
      // Permite que value seja uma função para que tenhamos a mesma API do useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Salva no state
      setStoredValue(valueToStore);
      // Salva no localStorage
      if (typeof window !== 'undefined') {
        if (valueToStore === null || valueToStore === undefined) {
          window.localStorage.removeItem(key);
        } else {
          // Para strings simples (como tokens), salva diretamente
          if (typeof valueToStore === 'string') {
            window.localStorage.setItem(key, valueToStore);
          } else {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          }
        }
      }
    } catch (error) {
      // Uma implementação mais avançada lidaria com o caso de erro
      console.error('Erro ao salvar no localStorage:', error);
    }
  };

  return [storedValue, setValue];
}

export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}
