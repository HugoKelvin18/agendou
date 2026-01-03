-- Migration para inicializar sistema admin
-- Cria business admin-system e código ADMIN2026 se não existirem

-- 1. Criar business admin-system se não existir
DO $$
DECLARE
    admin_business_id INTEGER;
    has_status_pagamento BOOLEAN;
BEGIN
    -- Verificar se coluna statusPagamento existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'businesses' 
        AND column_name = 'statusPagamento'
    ) INTO has_status_pagamento;

    -- Buscar ou criar business admin-system
    SELECT id INTO admin_business_id FROM "businesses" WHERE slug = 'admin-system' LIMIT 1;

    IF admin_business_id IS NULL THEN
        -- Criar business admin-system
        IF has_status_pagamento THEN
            INSERT INTO "businesses" ("nome", "slug", "ativo", "createdAt", "updatedAt", "plano", "statusPagamento", "toleranciaDias")
            VALUES ('Sistema Admin', 'admin-system', true, NOW(), NOW(), 'ADMIN', 'ATIVO'::"StatusPagamento", 0)
            ON CONFLICT DO NOTHING
            RETURNING id INTO admin_business_id;
        ELSE
            INSERT INTO "businesses" ("nome", "slug", "ativo", "createdAt", "updatedAt", "plano", "toleranciaDias")
            VALUES ('Sistema Admin', 'admin-system', true, NOW(), NOW(), 'ADMIN', 0)
            ON CONFLICT DO NOTHING
            RETURNING id INTO admin_business_id;
        END IF;

        -- Se ainda não tem ID, buscar novamente
        IF admin_business_id IS NULL THEN
            SELECT id INTO admin_business_id FROM "businesses" WHERE slug = 'admin-system' LIMIT 1;
        END IF;
    END IF;

    -- 2. Criar código de acesso ADMIN2026 se não existir
    IF admin_business_id IS NOT NULL THEN
        INSERT INTO "codigos_acesso" ("businessId", "codigo", "descricao", "ativo", "createdAt", "updatedAt")
        VALUES (
            admin_business_id,
            'ADMIN2026',
            'Código de acesso padrão para criar administradores',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT ("businessId", "codigo") DO NOTHING;
    END IF;
END $$;
