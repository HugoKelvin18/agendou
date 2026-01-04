-- AlterTable: Adicionar campo whatsapp ao Business
ALTER TABLE "business" ADD COLUMN IF NOT EXISTS "whatsapp" TEXT;

-- AlterEnum: Adicionar PENDENTE ao enum StatusPagamento
-- Verificar se o valor PENDENTE já existe no enum
DO $$ 
BEGIN
    -- Verificar se o enum já tem PENDENTE
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'PENDENTE' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'StatusPagamento')
    ) THEN
        -- Adicionar PENDENTE ao enum existente
        ALTER TYPE "StatusPagamento" ADD VALUE IF NOT EXISTS 'PENDENTE' BEFORE 'ATIVO';
    END IF;
END $$;
