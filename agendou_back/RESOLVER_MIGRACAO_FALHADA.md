# Resolver Migração Falhada

## Problema

A migração `20250115200000_add_multi_tenant_business` está marcada como **falhada** no banco de dados, impedindo que novas migrações sejam aplicadas.

## Solução Rápida

### Opção 1: Marcar como Rolled-Back (Recomendado)

Se a migração falhou parcialmente, marque como rolled-back e reaplique:

```bash
cd agendou_back
npx prisma migrate resolve --rolled-back 20250115200000_add_multi_tenant_business
npx prisma migrate deploy
```

### Opção 2: Usar Script de Diagnóstico

Execute o script que verifica o estado e sugere a ação:

```bash
cd agendou_back
npm run resolve-migration
```

### Opção 3: Marcar como Aplicada (Se já foi aplicada)

Se a migração foi completamente aplicada mas marcada como falhada:

```bash
cd agendou_back
npx prisma migrate resolve --applied 20250115200000_add_multi_tenant_business
npx prisma migrate deploy
```

## Verificar Estado Manualmente

Conecte ao banco e verifique:

```sql
-- Ver estado das migrações
SELECT migration_name, finished_at, applied_steps_count, started_at
FROM "_prisma_migrations"
WHERE migration_name = '20250115200000_add_multi_tenant_business';

-- Verificar se tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('businesses', 'servicos', 'disponibilidades', 'agendamentos', 'codigos_acesso');

-- Verificar se businessId existe
SELECT table_name, column_name, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND column_name = 'businessId';
```

## Para Render.com (Deploy)

Se estiver fazendo deploy no Render, você pode adicionar um comando de build customizado:

```bash
npm install && npx prisma generate && npx prisma migrate resolve --rolled-back 20250115200000_add_multi_tenant_business && npx prisma migrate deploy
```

Ou criar um script no `package.json`:

```json
{
  "scripts": {
    "deploy": "prisma generate && prisma migrate resolve --rolled-back 20250115200000_add_multi_tenant_business && prisma migrate deploy"
  }
}
```

E usar `npm run deploy` como comando de build.

## Se Nada Funcionar

Como último recurso, você pode deletar o registro da migração falhada (⚠️ CUIDADO):

```sql
DELETE FROM "_prisma_migrations" 
WHERE migration_name = '20250115200000_add_multi_tenant_business';
```

Depois execute `npx prisma migrate deploy` novamente.
