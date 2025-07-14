import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import { handleCors, handlePreflight } from '@/lib/cors';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";

export async function OPTIONS() {
  return handlePreflight();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Registra na API externa
    const apiResponse = await axios.post(`${API_BASE_URL}/auth/register`, body, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const { access_token, userId } = apiResponse.data;

    // Decodifica o token para obter informações do usuário
    const decodedToken: any = jwtDecode(access_token);

    // Retorna no formato esperado pelo frontend
    const response = NextResponse.json({
      token: access_token,
      user: {
        id: userId.toString(),
        name: decodedToken.name || body.name,
        email: decodedToken.email || body.email,
        cpf: decodedToken.cpf || body.cpf,
        accounts: [],
      },
    });
    
    return handleCors(response);
  } catch (error: any) {
    console.error("Erro na API de register:", error);
    if (error.response) {
      const errorResponse = NextResponse.json(
        { error: error.response.data.message || "Registration failed" },
        { status: error.response.status }
      );
      return handleCors(errorResponse);
    }
    const errorResponse = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
    return handleCors(errorResponse);
  }
}
