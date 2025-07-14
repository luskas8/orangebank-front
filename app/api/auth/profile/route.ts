import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
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

    // Remove 'Bearer ' e qualquer aspas que possam estar no token
    const token = authHeader.replace('Bearer ', '').replace(/"/g, '');

    // Validar o token com a API externa fazendo uma chamada para algum endpoint protegido
    // Como não temos um endpoint específico de perfil na API externa, vamos usar o endpoint de contas
    // para validar se o token é válido
    try {
      await axios.get(`${API_BASE_URL}/account/get`, {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        timeout: 5000, // 5 segundos de timeout
      });
    } catch (apiError: any) {
      console.error('Token inválido na API externa:', apiError.response?.status);
      if (apiError.response?.status === 401) {
        const errorResponse = NextResponse.json(
          { error: 'Token expired or invalid' },
          { status: 401 }
        );
        return handleCors(errorResponse);
      }
      // Se for 404 (sem contas), o token ainda é válido
      if (apiError.response?.status !== 404) {
        throw apiError;
      }
    }

    // Decodifica o token para obter informações do usuário
    const decodedToken: any = jwtDecode(token);

    // Retorna apenas o perfil do usuário, sem as contas
    // As contas serão buscadas separadamente pelo dashboard
    const response = NextResponse.json({
      id: decodedToken.sub || decodedToken.userId || decodedToken.id || '1',
      name: decodedToken.name || decodedToken.username || 'Usuário',
      email: decodedToken.email || '',
      cpf: decodedToken.cpf || decodedToken.document || ''
    });
    
    return handleCors(response);

  } catch (error: any) {
    console.error('Erro na API de profile:', error);
    const errorResponse = NextResponse.json(
      { error: 'Invalid token or internal server error' },
      { status: 401 }
    );
    return handleCors(errorResponse);
  }
}
