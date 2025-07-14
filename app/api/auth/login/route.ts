import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { handleCors, handlePreflight } from '@/lib/cors';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

export async function OPTIONS() {
  return handlePreflight();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Faz login na API externa
    const apiResponse = await axios.post(`${API_BASE_URL}/auth/login`, body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const { access_token, userId } = apiResponse.data;

    // Decodifica o token para obter informações do usuário
    const decodedToken: any = jwtDecode(access_token);
    console.log('Token decodificado:', decodedToken);
    
    // Retorna no formato esperado pelo frontend
    const response = NextResponse.json({
      token: access_token,
      user: {
        id: userId.toString(),
        name: decodedToken.name || decodedToken.username || body.email.split('@')[0],
        email: decodedToken.email || body.email,
        cpf: decodedToken.cpf || decodedToken.document || "000.000.000-00",
        accounts: []
      }
    });
    
    return handleCors(response);
  } catch (error: any) {
    console.error('Erro na API de login:', error);
    if (error.response) {
      const errorResponse = NextResponse.json(
        { error: error.response.data.message || 'Login failed' },
        { status: error.response.status }
      );
      return handleCors(errorResponse);
    }
    const errorResponse = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    return handleCors(errorResponse);
  }
}
