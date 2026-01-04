-- AlterTable: Adicionar campo whatsapp ao Business
ALTER TABLE "businesses" ADD COLUMN IF NOT EXISTS "whatsapp" TEXT;

-- AlterEnum: Adicionar PENDENTE ao enum StatusPagamento
-- Usar bloco DO com tratamento de erro para evitar falha se valor já existir
DO $$ 
DECLARE
    enum_exists BOOLEAN;
BEGIN
    -- Verificar se o valor PENDENTE já existe no enum
    SELECT EXISTS (
        SELECT 1 
        FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'StatusPagamento' 
        AND e.enumlabel = 'PENDENTE'
    ) INTO enum_exists;
    
    -- Se não existir, adicionar
    IF NOT enum_exists THEN
        ALTER TYPE "StatusPagamento" ADD VALUE 'PENDENTE';
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        -- Valor já existe, ignorar silenciosamente
        NULL;
    WHEN OTHERS THEN
        -- Para outros erros, verificar novamente se o valor existe
        SELECT EXISTS (
            SELECT 1 
            FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'StatusPagamento' 
            AND e.enumlabel = 'PENDENTE'
        ) INTO enum_exists;
        
        -- Se ainda não existir, relançar o erro
        IF NOT enum_exists THEN
            RAISE;
        END IF;
END $$;
