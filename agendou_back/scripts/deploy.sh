#!/bin/bash
# Script de deploy que resolve migrações falhadas automaticamente

set -e  # Parar em caso de erro

echo "🔧 Gerando Prisma Client..."
npx prisma generate

echo "🔍 Verificando migrações falhadas..."

# Tentar resolver migração falhada se existir
if npx prisma migrate resolve --rolled-back 20250115200000_add_multi_tenant_business 2>/dev/null; then
    echo "✅ Migração falhada resolvida (rolled-back)"
elif npx prisma migrate resolve --applied 20250115200000_add_multi_tenant_business 2>/dev/null; then
    echo "✅ Migração falhada resolvida (applied)"
else
    echo "ℹ️  Nenhuma migração falhada encontrada ou já foi resolvida"
fi

echo "📦 Aplicando migrações..."
npx prisma migrate deploy

echo "✅ Deploy concluído com sucesso!"
