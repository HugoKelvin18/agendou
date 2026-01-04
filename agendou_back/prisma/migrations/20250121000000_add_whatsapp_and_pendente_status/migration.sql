-- AlterTable: Adicionar campo whatsapp ao Business
ALTER TABLE "business" ADD COLUMN IF NOT EXISTS "whatsapp" TEXT;

-- AlterEnum: Adicionar PENDENTE ao enum StatusPagamento
-- PostgreSQL não suporta IF NOT EXISTS para ADD VALUE, então usamos um bloco DO com tratamento de erro
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
        -- Adicionar PENDENTE ao enum
        -- Usar EXECUTE para evitar problemas de parsing
        EXECUTE 'ALTER TYPE "StatusPagamento" ADD VALUE ''PENDENTE''';
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        -- Valor já existe, ignorar silenciosamente
        NULL;
    WHEN OTHERS THEN
        -- Para outros erros, verificar novamente se o valor existe
        -- Se existir, ignorar; caso contrário, relançar o erro
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'StatusPagamento' 
            AND e.enumlabel = 'PENDENTE'
        ) THEN
            RAISE;
        END IF;
END $$;
