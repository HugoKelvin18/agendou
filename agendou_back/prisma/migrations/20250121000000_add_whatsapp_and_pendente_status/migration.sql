-- AlterTable: Adicionar campo whatsapp ao Business
ALTER TABLE "business" ADD COLUMN IF NOT EXISTS "whatsapp" TEXT;

-- AlterEnum: Adicionar PENDENTE ao enum StatusPagamento
-- PostgreSQL não suporta IF NOT EXISTS para ADD VALUE, então usamos um bloco DO
DO $$ 
BEGIN
    -- Verificar se o valor PENDENTE já existe no enum
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'StatusPagamento' 
        AND e.enumlabel = 'PENDENTE'
    ) THEN
        -- Adicionar PENDENTE como primeiro valor do enum
        ALTER TYPE "StatusPagamento" ADD VALUE 'PENDENTE';
    END IF;
END $$;
