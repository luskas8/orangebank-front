import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { handleCors, handlePreflight } from '@/lib/cors';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

export async function OPTIONS() {
  return handlePreflight();
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      const errorResponse = NextResponse.json(
        { error: 'Authorization header missing' },
        { status: 401 }
      );
      return handleCors(errorResponse);
    }

    // Faz a chamada para a API externa para buscar as contas
    const apiResponse = await axios.get(`${API_BASE_URL}/account/get`, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    // Mapeia as contas para o formato esperado pelo frontend
    const accounts = apiResponse.data.map((account: any) => ({
      id: account.id,
      type: account.type === 'current_account' ? 'current' : 'investment',
      balance: account.balance,
      userId: account.userId.toString()
    }));

    const response = NextResponse.json(accounts);
    return handleCors(response);

  } catch (error: any) {
    console.error('Erro na API de accounts:', error);
    
    if (error.response?.status === 401) {
      const errorResponse = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
      return handleCors(errorResponse);
    }
    
    if (error.response?.status === 404) {
      // Retorna array vazio se não encontrar contas
      const response = NextResponse.json([]);
      return handleCors(response);
    }
    
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
    return handleCors(errorResponse);
  }
}
