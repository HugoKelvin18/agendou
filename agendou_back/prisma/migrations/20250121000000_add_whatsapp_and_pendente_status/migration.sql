-- AlterTable: Adicionar campo whatsapp ao Business
ALTER TABLE "business" ADD COLUMN IF NOT EXISTS "whatsapp" TEXT;

-- AlterEnum: Adicionar PENDENTE ao enum StatusPagamento
-- Primeiro, criar novo tipo
DO $$ BEGIN
    CREATE TYPE "StatusPagamento_new" AS ENUM ('PENDENTE', 'ATIVO', 'INADIMPLENTE', 'BLOQUEADO', 'CANCELADO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Alterar coluna para usar novo tipo
ALTER TABLE "business" ALTER COLUMN "statusPagamento" DROP DEFAULT;
ALTER TABLE "business" ALTER COLUMN "statusPagamento" TYPE "StatusPagamento_new" USING ("statusPagamento"::text::"StatusPagamento_new");
ALTER TABLE "business" ALTER COLUMN "statusPagamento" SET DEFAULT 'ATIVO';

-- Remover tipo antigo
DROP TYPE IF EXISTS "StatusPagamento_old";

-- Renomear tipo novo para o nome original
DO $$ BEGIN
    ALTER TYPE "StatusPagamento_new" RENAME TO "StatusPagamento";
EXCEPTION
    WHEN undefined_object THEN null;
END $$;
