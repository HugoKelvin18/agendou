-- Migração de correção: Limpar registros órfãos e validar constraints
-- Esta migração corrige problemas de dados órfãos antes de aplicar NOT NULL e FKs

-- ============================================
-- 1. LIMPAR REGISTROS ÓRFÃOS
-- ============================================

-- Servicos com profissionalId inválido ou profissional sem businessId
DELETE FROM "servicos" 
WHERE "profissionalId" NOT IN (SELECT id FROM "usuarios")
   OR "profissionalId" IN (SELECT id FROM "usuarios" WHERE "businessId" IS NULL AND role != 'ADMIN');

-- Atualizar servicos restantes com businessId do profissional
UPDATE "servicos" s 
SET "businessId" = (
    SELECT u."businessId" 
    FROM "usuarios" u 
    WHERE u.id = s."profissionalId" 
    AND u."businessId" IS NOT NULL
)
WHERE "businessId" IS NULL 
AND "profissionalId" IN (SELECT id FROM "usuarios" WHERE "businessId" IS NOT NULL);

-- Disponibilidades com profissionalId inválido ou profissional sem businessId
DELETE FROM "disponibilidades" 
WHERE "profissionalId" NOT IN (SELECT id FROM "usuarios")
   OR "profissionalId" IN (SELECT id FROM "usuarios" WHERE "businessId" IS NULL AND role != 'ADMIN');

-- Atualizar disponibilidades restantes com businessId do profissional
UPDATE "disponibilidades" d 
SET "businessId" = (
    SELECT u."businessId" 
    FROM "usuarios" u 
    WHERE u.id = d."profissionalId" 
    AND u."businessId" IS NOT NULL
)
WHERE "businessId" IS NULL 
AND "profissionalId" IN (SELECT id FROM "usuarios" WHERE "businessId" IS NOT NULL);

-- Agendamentos com clienteId ou profissionalId inválido
DELETE FROM "agendamentos" 
WHERE "clienteId" NOT IN (SELECT id FROM "usuarios")
   OR "profissionalId" NOT IN (SELECT id FROM "usuarios")
   OR "clienteId" IN (SELECT id FROM "usuarios" WHERE "businessId" IS NULL AND role != 'ADMIN')
   OR "profissionalId" IN (SELECT id FROM "usuarios" WHERE "businessId" IS NULL AND role != 'ADMIN');

-- Atualizar agendamentos restantes com businessId do cliente
UPDATE "agendamentos" a 
SET "businessId" = (
    SELECT u."businessId" 
    FROM "usuarios" u 
    WHERE u.id = a."clienteId" 
    AND u."businessId" IS NOT NULL
)
WHERE "businessId" IS NULL 
AND "clienteId" IN (SELECT id FROM "usuarios" WHERE "businessId" IS NOT NULL);

-- Agendamentos com servicoId inválido ou servico sem businessId
DELETE FROM "agendamentos" 
WHERE "servicoId" NOT IN (SELECT id FROM "servicos")
   OR "servicoId" IN (SELECT id FROM "servicos" WHERE "businessId" IS NULL);

-- ============================================
-- 2. VALIDAR E CORRIGIR businessId NULL
-- ============================================

-- Verificar se há servicos com businessId NULL (não deveria acontecer após limpeza)
-- Se houver, atribuir ao business padrão ou deletar
DO $$
DECLARE
    default_business_id INTEGER;
BEGIN
    SELECT id INTO default_business_id FROM "businesses" WHERE slug = 'default' LIMIT 1;
    
    IF default_business_id IS NULL THEN
        -- Criar business padrão se não existir
        INSERT INTO "businesses" ("nome", "slug", "ativo", "createdAt", "updatedAt", "statusPagamento")
        VALUES ('Negócio Padrão', 'default', true, NOW(), NOW(), 'ATIVO')
        RETURNING id INTO default_business_id;
    END IF;
    
    -- Atualizar servicos órfãos (se ainda houver)
    UPDATE "servicos" 
    SET "businessId" = default_business_id 
    WHERE "businessId" IS NULL;
    
    -- Se ainda houver NULL após tentar corrigir, deletar
    DELETE FROM "servicos" WHERE "businessId" IS NULL;
    
    -- Mesmo para disponibilidades
    UPDATE "disponibilidades" 
    SET "businessId" = default_business_id 
    WHERE "businessId" IS NULL;
    
    DELETE FROM "disponibilidades" WHERE "businessId" IS NULL;
    
    -- Mesmo para agendamentos
    UPDATE "agendamentos" 
    SET "businessId" = default_business_id 
    WHERE "businessId" IS NULL;
    
    DELETE FROM "agendamentos" WHERE "businessId" IS NULL;
    
    -- Codigos_acesso
    UPDATE "codigos_acesso" 
    SET "businessId" = default_business_id 
    WHERE "businessId" IS NULL;
    
    DELETE FROM "codigos_acesso" WHERE "businessId" IS NULL;
END $$;

-- ============================================
-- 3. VALIDAR businessId APONTANDO PARA BUSINESSES INEXISTENTES
-- ============================================

-- Deletar registros com businessId inválido
DELETE FROM "servicos" 
WHERE "businessId" NOT IN (SELECT id FROM "businesses");

DELETE FROM "disponibilidades" 
WHERE "businessId" NOT IN (SELECT id FROM "businesses");

DELETE FROM "agendamentos" 
WHERE "businessId" NOT IN (SELECT id FROM "businesses");

DELETE FROM "codigos_acesso" 
WHERE "businessId" NOT IN (SELECT id FROM "businesses");

-- ============================================
-- 4. GARANTIR QUE businessId NÃO É NULL (exceto admins em usuarios)
-- ============================================

-- Servicos: garantir NOT NULL
DO $$
BEGIN
    -- Verificar se há NULL
    IF EXISTS (SELECT 1 FROM "servicos" WHERE "businessId" IS NULL) THEN
        RAISE EXCEPTION 'Ainda existem servicos com businessId NULL após limpeza';
    END IF;
    
    -- Aplicar NOT NULL se ainda não estiver
    BEGIN
        ALTER TABLE "servicos" ALTER COLUMN "businessId" SET NOT NULL;
    EXCEPTION
        WHEN OTHERS THEN
            -- Se já for NOT NULL, ignorar erro
            NULL;
    END;
END $$;

-- Disponibilidades: garantir NOT NULL
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "disponibilidades" WHERE "businessId" IS NULL) THEN
        RAISE EXCEPTION 'Ainda existem disponibilidades com businessId NULL após limpeza';
    END IF;
    
    BEGIN
        ALTER TABLE "disponibilidades" ALTER COLUMN "businessId" SET NOT NULL;
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END;
END $$;

-- Agendamentos: garantir NOT NULL
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "agendamentos" WHERE "businessId" IS NULL) THEN
        RAISE EXCEPTION 'Ainda existem agendamentos com businessId NULL após limpeza';
    END IF;
    
    BEGIN
        ALTER TABLE "agendamentos" ALTER COLUMN "businessId" SET NOT NULL;
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END;
END $$;

-- Codigos_acesso: garantir NOT NULL
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "codigos_acesso" WHERE "businessId" IS NULL) THEN
        RAISE EXCEPTION 'Ainda existem codigos_acesso com businessId NULL após limpeza';
    END IF;
    
    BEGIN
        ALTER TABLE "codigos_acesso" ALTER COLUMN "businessId" SET NOT NULL;
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END;
END $$;

-- ============================================
-- 5. RECRIAR FOREIGN KEYS (se necessário)
-- ============================================

-- Remover FKs existentes e recriar para garantir consistência
DO $$
BEGIN
    -- Servicos
    ALTER TABLE "servicos" DROP CONSTRAINT IF EXISTS "servicos_businessId_fkey";
    ALTER TABLE "servicos" ADD CONSTRAINT "servicos_businessId_fkey" 
        FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE;
    
    -- Disponibilidades
    ALTER TABLE "disponibilidades" DROP CONSTRAINT IF EXISTS "disponibilidades_businessId_fkey";
    ALTER TABLE "disponibilidades" ADD CONSTRAINT "disponibilidades_businessId_fkey" 
        FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE;
    
    -- Agendamentos
    ALTER TABLE "agendamentos" DROP CONSTRAINT IF EXISTS "agendamentos_businessId_fkey";
    ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_businessId_fkey" 
        FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE;
    
    -- Codigos_acesso
    ALTER TABLE "codigos_acesso" DROP CONSTRAINT IF EXISTS "codigos_acesso_businessId_fkey";
    ALTER TABLE "codigos_acesso" ADD CONSTRAINT "codigos_acesso_businessId_fkey" 
        FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE;
EXCEPTION
    WHEN OTHERS THEN
        -- Logar erro mas continuar
        RAISE NOTICE 'Erro ao recriar FKs: %', SQLERRM;
END $$;

-- ============================================
-- 6. CORRIGIR ÍNDICES (remover e recriar se necessário)
-- ============================================

-- Remover índices únicos problemáticos de forma segura
DO $$
BEGIN
    -- Remover índice único de email se existir (pode ter nomes diferentes)
    DROP INDEX IF EXISTS "usuarios_email_key";
    DROP INDEX IF EXISTS "usuarios_businessId_email_key";
    
    -- Remover índice único de codigo se existir
    DROP INDEX IF EXISTS "codigos_acesso_codigo_key";
    DROP INDEX IF EXISTS "codigos_acesso_businessId_codigo_key";
    
    -- Recriar índices únicos corretos
    CREATE UNIQUE INDEX IF NOT EXISTS "usuarios_email_key" ON "usuarios"("email");
    CREATE UNIQUE INDEX IF NOT EXISTS "codigos_acesso_businessId_codigo_key" 
        ON "codigos_acesso"("businessId", "codigo");
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao corrigir índices: %', SQLERRM;
END $$;
