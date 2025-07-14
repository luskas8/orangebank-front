#!/bin/bash

echo "🧪 Testando funcionalidades do OrangeBank..."

# Testa se o servidor está rodando
echo "📡 Verificando se o servidor está ativo..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Servidor está rodando em http://localhost:3000"
else
    echo "❌ Servidor não está acessível"
    exit 1
fi

# Testa se a API externa está acessível
echo "🔗 Verificando API externa..."
if curl -s http://localhost:3003/health > /dev/null; then
    echo "✅ API externa está acessível"
else
    echo "⚠️  API externa pode não estar rodando (localhost:3003)"
fi

# Verifica as rotas principais
echo "🛣️  Testando rotas..."

# Testa rota de login
if curl -s http://localhost:3000/login > /dev/null; then
    echo "✅ Rota /login acessível"
else
    echo "❌ Problema na rota /login"
fi

# Testa rota de dashboard
if curl -s http://localhost:3000/dashboard > /dev/null; then
    echo "✅ Rota /dashboard acessível"
else
    echo "❌ Problema na rota /dashboard"
fi

# Testa API interna de login
echo "🔐 Testando API de login..."
LOGIN_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao.silva@email.com","password":"orangebank123@"}')

if [ "$LOGIN_RESPONSE" = "200" ] || [ "$LOGIN_RESPONSE" = "401" ]; then
    echo "✅ API de login está respondendo (status: $LOGIN_RESPONSE)"
else
    echo "❌ Problema na API de login (status: $LOGIN_RESPONSE)"
fi

echo "🎉 Teste concluído!"
