import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Normaliza datas recebidas da API externa para o padrão ISO 8601.
 * Espera datas no formato "YYYY-MM-DDTHH:mm:SS.SSSZ" da API externa.
 * Exemplo: "2025-07-13T17:01:27.614Z"
 * 
 * @param dateString String de data da API externa no formato ISO 8601
 * @returns Date object
 */
export function parseApiDate(dateString: string): Date {
  // Valida se a string está no formato ISO 8601 esperado (YYYY-MM-DDTHH:mm:SS.SSSZ)
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  
  if (!dateString) {
    throw new Error('Data não pode ser vazia');
  }
  
  // Se está no formato ISO 8601 esperado (YYYY-MM-DDTHH:mm:SS.SSSZ)
  if (isoRegex.test(dateString)) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error(`Data inválida: ${dateString}`);
    }
    return date;
  }
  
  // Fallback para outros formatos ISO com T e Z
  if (dateString.includes('T') && dateString.includes('Z')) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error(`Data inválida: ${dateString}`);
    }
    return date;
  }
  
  // Último fallback para compatibilidade com outros formatos
  const fallbackDate = new Date(dateString);
  if (isNaN(fallbackDate.getTime())) {
    throw new Error(`Formato de data não suportado: ${dateString}`);
  }
  
  return fallbackDate;
}

/**
 * Formata uma data para o formato brasileiro (dd/MM/yyyy HH:mm)
 * 
 * @param date Date object ou string ISO
 * @returns String formatada para exibição
 */
export function formatDateToBrazilian(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseApiDate(date) : date;
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo'
  }).format(dateObj);
}

/**
 * Formata uma data para exibição brasileira apenas com data (dd/MM/yyyy)
 * 
 * @param date Date object ou string ISO
 * @returns String formatada para exibição
 */
export function formatDateOnlyToBrazilian(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseApiDate(date) : date;
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo'
  }).format(dateObj);
}

/**
 * Converte uma data para o formato ISO 8601 para envio à API
 * Retorna no formato "YYYY-MM-DDTHH:mm:SS.SSSZ"
 * Exemplo: "2025-07-13T17:01:27.614Z"
 * 
 * @param date Date object
 * @returns String no formato ISO 8601 com milissegundos
 */
export function formatDateToISO(date: Date): string {
  return date.toISOString();
}

/**
 * Cria uma data atual no formato ISO 8601 para a API externa
 * Retorna no formato "YYYY-MM-DDTHH:mm:SS.SSSZ"
 * Exemplo: "2025-07-13T17:01:27.614Z"
 * 
 * @returns String no formato ISO 8601 com timestamp atual
 */
export function getCurrentISOTimestamp(): string {
  return new Date().toISOString();
}