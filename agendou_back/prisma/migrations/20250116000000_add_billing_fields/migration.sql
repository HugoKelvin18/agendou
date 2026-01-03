-- AlterTable: Adicionar campos de billing ao modelo Business
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "plano" TEXT;
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "vencimento" TIMESTAMP(3);
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "ultimoPagamento" TIMESTAMP(3);
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "dataBloqueio" TIMESTAMP(3);
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "toleranciaDias" INTEGER NOT NULL DEFAULT 5;
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "limiteUsuarios" INTEGER;
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "limiteProfissionais" INTEGER;
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "limiteServicos" INTEGER;
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "limiteAgendamentos" INTEGER;

-- Criar enum StatusPagamento se não existir
DO $$ BEGIN
    CREATE TYPE "StatusPagamento" AS ENUM ('ATIVO', 'INADIMPLENTE', 'BLOQUEADO', 'CANCELADO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Adicionar coluna statusPagamento como TEXT primeiro (se não existir)
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "statusPagamento" TEXT;

-- Atualizar valores existentes para 'ATIVO' se null
UPDATE "businesses" SET "statusPagamento" = 'ATIVO' WHERE "statusPagamento" IS NULL;

-- Tornar NOT NULL
ALTER TABLE "businesses" ALTER COLUMN "statusPagamento" SET NOT NULL;

-- Remover valor padrão temporariamente
ALTER TABLE "businesses" ALTER COLUMN "statusPagamento" DROP DEFAULT;

-- Alterar tipo para enum
ALTER TABLE "businesses" ALTER COLUMN "statusPagamento" TYPE "StatusPagamento" USING "statusPagamento"::"StatusPagamento";

-- Adicionar valor padrão novamente
ALTER TABLE "businesses" ALTER COLUMN "statusPagamento" SET DEFAULT 'ATIVO'::"StatusPagamento";

-- Criar índices
CREATE INDEX IF NOT EXISTS "businesses_statusPagamento_idx" ON "businesses"("statusPagamento");
CREATE INDEX IF NOT EXISTS "businesses_vencimento_idx" ON "businesses"("vencimento");
