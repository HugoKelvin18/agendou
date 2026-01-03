import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deploy() {
    try {
        console.log('🔧 Gerando Prisma Client...');
        execSync('npx prisma generate', { stdio: 'inherit' });

        console.log('🔍 Verificando migrações falhadas...');

        // Verificar se há migração falhada
        try {
            const failedMigrations = await prisma.$queryRaw`
                SELECT migration_name, finished_at
                FROM "_prisma_migrations"
                WHERE migration_name = '20250115200000_add_multi_tenant_business'
                AND finished_at IS NULL
            `;

            if (failedMigrations && failedMigrations.length > 0) {
                console.log('⚠️  Migração falhada detectada. Tentando resolver...');
                
                // Verificar se tabelas foram criadas (migração parcial)
                const tables = await prisma.$queryRaw`
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'businesses'
                `;

                if (tables && tables.length > 0) {
                    console.log('📋 Tabelas encontradas. Marcando como rolled-back...');
                    execSync('npx prisma migrate resolve --rolled-back 20250115200000_add_multi_tenant_business', {
                        stdio: 'inherit'
                    });
                } else {
                    console.log('📋 Migração não aplicada. Marcando como rolled-back...');
                    execSync('npx prisma migrate resolve --rolled-back 20250115200000_add_multi_tenant_business', {
                        stdio: 'inherit'
                    });
                }
            }
        } catch (error) {
            // Se não conseguir verificar, tentar resolver mesmo assim
            console.log('⚠️  Erro ao verificar migrações. Tentando resolver...');
            try {
                execSync('npx prisma migrate resolve --rolled-back 20250115200000_add_multi_tenant_business', {
                    stdio: 'inherit'
                });
            } catch (resolveError) {
                // Ignorar se já foi resolvida
                console.log('ℹ️  Migração já resolvida ou não existe');
            }
        }

        console.log('📦 Aplicando migrações...');
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });

        console.log('✅ Deploy concluído com sucesso!');
    } catch (error) {
        console.error('❌ Erro no deploy:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

deploy();
