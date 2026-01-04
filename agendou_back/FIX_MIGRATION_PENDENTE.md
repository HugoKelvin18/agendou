# Como Resolver a Migration Falhada

A migration `20250121000000_add_whatsapp_and_pendente_status` falhou no deploy. Este guia explica como resolver.

## Opção 1: Usar o Script Automático (Recomendado)

### No Render.com (Produção)

1. Acesse o dashboard do Render
2. Vá para o serviço do backend
3. Abra o **Shell** (console)
4. Execute:

```bash
cd agendou_back
npm run fix-migration-pendente
```

O script irá:
- ✅ Verificar se o valor `PENDENTE` existe no enum e adicionar se necessário
- ✅ Verificar se a coluna `whatsapp` existe e adicionar se necessário  
- ✅ Marcar a migration como aplicada

### Localmente (para testar)

```bash
cd agendou_back
npm run fix-migration-pendente
```

## Opção 2: Executar Manualmente via SQL

Se preferir fazer manualmente, conecte ao banco de dados e execute:

```sql
-- 1. Adicionar PENDENTE ao enum (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'StatusPagamento' 
        AND e.enumlabel = 'PENDENTE'
    ) THEN
        ALTER TYPE "StatusPagamento" ADD VALUE 'PENDENTE';
    END IF;
END $$;

-- 2. Adicionar coluna whatsapp (se não existir)
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "whatsapp" TEXT;

-- 3. Marcar migration como aplicada (via Prisma)
-- Execute no terminal:
-- npx prisma migrate resolve --applied 20250121000000_add_whatsapp_and_pendente_status
```

## Opção 3: Via Prisma Studio ou Console

1. Conecte ao banco via Prisma Studio ou console SQL
2. Execute os comandos SQL acima
3. No terminal, execute:
```bash
npx prisma migrate resolve --applied 20250121000000_add_whatsapp_and_pendente_status
```

## Verificação

Após executar, verifique:

```sql
-- Verificar enum
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'StatusPagamento');

-- Verificar coluna
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'businesses' AND column_name = 'whatsapp';
```

## Próximos Passos

Após resolver a migration:

1. Execute `npx prisma migrate deploy` para aplicar outras migrations pendentes
2. Ou aguarde o próximo deploy automático do Render
