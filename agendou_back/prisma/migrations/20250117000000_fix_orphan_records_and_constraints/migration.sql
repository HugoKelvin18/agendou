-- Migração de correção: Limpar registros órfãos e validar constraints
-- Esta migração corrige problemas de dados órfãos antes de aplicar NOT NULL e FKs
-- VERSÃO ROBUSTA: Verifica existência de tabelas antes de operar

-- ============================================
-- 1. LIMPAR REGISTROS ÓRFÃOS
-- ============================================

-- Servicos com profissionalId inválido ou profissional sem businessId
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'servicos') THEN
        DELETE FROM "servicos" 
        WHERE "profissionalId" NOT IN (SELECT id FROM "usuarios")
           OR "profissionalId" IN (SELECT id FROM "usuarios" WHERE "businessId" IS NULL AND role != 'ADMIN');
    END IF;
END $$;

-- Atualizar servicos restantes com businessId do profissional
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'servicos') THEN
        UPDATE "servicos" s 
        SET "businessId" = (
            SELECT u."businessId" 
            FROM "usuarios" u 
            WHERE u.id = s."profissionalId" 
            AND u."businessId" IS NOT NULL
        )
        WHERE "businessId" IS NULL 
        AND "profissionalId" IN (SELECT id FROM "usuarios" WHERE "businessId" IS NOT NULL);
    END IF;
END $$;

-- Disponibilidades com profissionalId inválido ou profissional sem businessId
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'disponibilidades') THEN
        DELETE FROM "disponibilidades" 
        WHERE "profissionalId" NOT IN (SELECT id FROM "usuarios")
           OR "profissionalId" IN (SELECT id FROM "usuarios" WHERE "businessId" IS NULL AND role != 'ADMIN');
    END IF;
END $$;

-- Atualizar disponibilidades restantes com businessId do profissional
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'disponibilidades') THEN
        UPDATE "disponibilidades" d 
        SET "businessId" = (
            SELECT u."businessId" 
            FROM "usuarios" u 
            WHERE u.id = d."profissionalId" 
            AND u."businessId" IS NOT NULL
        )
        WHERE "businessId" IS NULL 
        AND "profissionalId" IN (SELECT id FROM "usuarios" WHERE "businessId" IS NOT NULL);
    END IF;
END $$;

-- Agendamentos com clienteId ou profissionalId inválido
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'agendamentos') THEN
        DELETE FROM "agendamentos" 
        WHERE "clienteId" NOT IN (SELECT id FROM "usuarios")
           OR "profissionalId" NOT IN (SELECT id FROM "usuarios")
           OR "clienteId" IN (SELECT id FROM "usuarios" WHERE "businessId" IS NULL AND role != 'ADMIN')
           OR "profissionalId" IN (SELECT id FROM "usuarios" WHERE "businessId" IS NULL AND role != 'ADMIN');
    END IF;
END $$;

-- Atualizar agendamentos restantes com businessId do cliente
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'agendamentos') THEN
        UPDATE "agendamentos" a 
        SET "businessId" = (
            SELECT u."businessId" 
            FROM "usuarios" u 
            WHERE u.id = a."clienteId" 
            AND u."businessId" IS NOT NULL
        )
        WHERE "businessId" IS NULL 
        AND "clienteId" IN (SELECT id FROM "usuarios" WHERE "businessId" IS NOT NULL);
    END IF;
END $$;

-- Agendamentos com servicoId inválido ou servico sem businessId
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'agendamentos') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'servicos') THEN
        DELETE FROM "agendamentos" 
        WHERE "servicoId" NOT IN (SELECT id FROM "servicos")
           OR "servicoId" IN (SELECT id FROM "servicos" WHERE "businessId" IS NULL);
    END IF;
END $$;

-- ============================================
-- 2. VALIDAR E CORRIGIR businessId NULL
-- ============================================

DO $$
DECLARE
    default_business_id INTEGER;
    has_status_pagamento BOOLEAN;
BEGIN
    -- Verificar se businesses existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'businesses') THEN
        RETURN;
    END IF;
    
    -- Verificar se coluna statusPagamento existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'businesses' 
        AND column_name = 'statusPagamento'
    ) INTO has_status_pagamento;
    
    SELECT id INTO default_business_id FROM "businesses" WHERE slug = 'default' LIMIT 1;
    
    IF default_business_id IS NULL THEN
        -- Criar business padrão
        IF has_status_pagamento THEN
            BEGIN
                INSERT INTO "businesses" ("nome", "slug", "ativo", "createdAt", "updatedAt", "statusPagamento")
                VALUES ('Negócio Padrão', 'default', true, NOW(), NOW(), 'ATIVO'::"StatusPagamento")
                RETURNING id INTO default_business_id;
            EXCEPTION
                WHEN OTHERS THEN
                    INSERT INTO "businesses" ("nome", "slug", "ativo", "createdAt", "updatedAt")
                    VALUES ('Negócio Padrão', 'default', true, NOW(), NOW())
                    RETURNING id INTO default_business_id;
            END;
        ELSE
            INSERT INTO "businesses" ("nome", "slug", "ativo", "createdAt", "updatedAt")
            VALUES ('Negócio Padrão', 'default', true, NOW(), NOW())
            RETURNING id INTO default_business_id;
        END IF;
    END IF;
    
    -- Atualizar servicos órfãos
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'servicos') THEN
        UPDATE "servicos" SET "businessId" = default_business_id WHERE "businessId" IS NULL;
        DELETE FROM "servicos" WHERE "businessId" IS NULL;
    END IF;
    
    -- Disponibilidades
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'disponibilidades') THEN
        UPDATE "disponibilidades" SET "businessId" = default_business_id WHERE "businessId" IS NULL;
        DELETE FROM "disponibilidades" WHERE "businessId" IS NULL;
    END IF;
    
    -- Agendamentos
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'agendamentos') THEN
        UPDATE "agendamentos" SET "businessId" = default_business_id WHERE "businessId" IS NULL;
        DELETE FROM "agendamentos" WHERE "businessId" IS NULL;
    END IF;
    
    -- Codigos_acesso
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'codigos_acesso') THEN
        UPDATE "codigos_acesso" SET "businessId" = default_business_id WHERE "businessId" IS NULL;
        DELETE FROM "codigos_acesso" WHERE "businessId" IS NULL;
    END IF;
END $$;

-- ============================================
-- 3. VALIDAR businessId APONTANDO PARA BUSINESSES INEXISTENTES
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'servicos') THEN
        DELETE FROM "servicos" WHERE "businessId" NOT IN (SELECT id FROM "businesses");
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'disponibilidades') THEN
        DELETE FROM "disponibilidades" WHERE "businessId" NOT IN (SELECT id FROM "businesses");
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'agendamentos') THEN
        DELETE FROM "agendamentos" WHERE "businessId" NOT IN (SELECT id FROM "businesses");
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'codigos_acesso') THEN
        DELETE FROM "codigos_acesso" WHERE "businessId" NOT IN (SELECT id FROM "businesses");
    END IF;
END $$;

-- ============================================
-- 4. GARANTIR QUE businessId NÃO É NULL (exceto admins em usuarios)
-- ============================================

-- Servicos: garantir NOT NULL
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'servicos') THEN
        RETURN;
    END IF;
    
    IF EXISTS (SELECT 1 FROM "servicos" WHERE "businessId" IS NULL) THEN
        RAISE EXCEPTION 'Ainda existem servicos com businessId NULL após limpeza';
    END IF;
    
    BEGIN
        ALTER TABLE "servicos" ALTER COLUMN "businessId" SET NOT NULL;
    EXCEPTION
        WHEN OTHERS THEN
            -- Se já for NOT NULL ou outro erro, ignorar
            NULL;
    END;
END $$;

-- Disponibilidades: garantir NOT NULL
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'disponibilidades') THEN
        RETURN;
    END IF;
    
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
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'agendamentos') THEN
        RETURN;
    END IF;
    
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
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'codigos_acesso') THEN
        RETURN;
    END IF;
    
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

DO $$
BEGIN
    -- Servicos
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'servicos') THEN
        ALTER TABLE "servicos" DROP CONSTRAINT IF EXISTS "servicos_businessId_fkey";
        BEGIN
            ALTER TABLE "servicos" ADD CONSTRAINT "servicos_businessId_fkey" 
                FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE;
        EXCEPTION
            WHEN OTHERS THEN NULL;
        END;
    END IF;
    
    -- Disponibilidades
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'disponibilidades') THEN
        ALTER TABLE "disponibilidades" DROP CONSTRAINT IF EXISTS "disponibilidades_businessId_fkey";
        BEGIN
            ALTER TABLE "disponibilidades" ADD CONSTRAINT "disponibilidades_businessId_fkey" 
                FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE;
        EXCEPTION
            WHEN OTHERS THEN NULL;
        END;
    END IF;
    
    -- Agendamentos
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'agendamentos') THEN
        ALTER TABLE "agendamentos" DROP CONSTRAINT IF EXISTS "agendamentos_businessId_fkey";
        BEGIN
            ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_businessId_fkey" 
                FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE;
        EXCEPTION
            WHEN OTHERS THEN NULL;
        END;
    END IF;
    
    -- Codigos_acesso
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'codigos_acesso') THEN
        ALTER TABLE "codigos_acesso" DROP CONSTRAINT IF EXISTS "codigos_acesso_businessId_fkey";
        BEGIN
            ALTER TABLE "codigos_acesso" ADD CONSTRAINT "codigos_acesso_businessId_fkey" 
                FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE;
        EXCEPTION
            WHEN OTHERS THEN NULL;
        END;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao recriar FKs: %', SQLERRM;
END $$;

-- ============================================
-- 6. CORRIGIR ÍNDICES (remover e recriar se necessário)
-- ============================================

DO $$
BEGIN
    -- Remover índice único de email se existir
    DROP INDEX IF EXISTS "usuarios_email_key";
    DROP INDEX IF EXISTS "usuarios_businessId_email_key";
    
    -- Recriar índice único de email
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usuarios') THEN
        CREATE UNIQUE INDEX IF NOT EXISTS "usuarios_email_key" ON "usuarios"("email");
    END IF;
    
    -- Remover índice único de codigo se existir
    DROP INDEX IF EXISTS "codigos_acesso_codigo_key";
    DROP INDEX IF EXISTS "codigos_acesso_businessId_codigo_key";
    
    -- Recriar índice único composto de codigo
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'codigos_acesso') THEN
        CREATE UNIQUE INDEX IF NOT EXISTS "codigos_acesso_businessId_codigo_key" 
            ON "codigos_acesso"("businessId", "codigo");
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao corrigir índices: %', SQLERRM;
END $$;
