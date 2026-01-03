import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function resolveFailedMigration() {
    try {
        console.log('🔍 Verificando estado das migrações...\n');

        // Verificar se a migração falhada foi parcialmente aplicada
        const result = await prisma.$queryRaw`
            SELECT migration_name, finished_at, applied_steps_count, started_at
            FROM "_prisma_migrations"
            WHERE migration_name = '20250115200000_add_multi_tenant_business'
        `;

        if (result.length === 0) {
            console.log('❌ Migração não encontrada na tabela _prisma_migrations');
            return;
        }

        const migration = result[0];
        console.log('📋 Estado da migração:');
        console.log(`   Nome: ${migration.migration_name}`);
        console.log(`   Iniciada em: ${migration.started_at}`);
        console.log(`   Finalizada em: ${migration.finished_at || 'NÃO FINALIZADA'}`);
        console.log(`   Passos aplicados: ${migration.applied_steps_count}\n`);

        // Verificar se as tabelas/colunas da migração existem
        const tablesCheck = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('businesses', 'servicos', 'disponibilidades', 'agendamentos', 'codigos_acesso')
            ORDER BY table_name
        `;

        console.log('📊 Tabelas encontradas:');
        tablesCheck.forEach(t => console.log(`   ✓ ${t.table_name}`));

        // Verificar se businessId existe nas tabelas
        const columnsCheck = await prisma.$queryRaw`
            SELECT table_name, column_name, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND column_name = 'businessId'
            ORDER BY table_name
        `;

        console.log('\n📊 Colunas businessId encontradas:');
        columnsCheck.forEach(c => {
            console.log(`   ✓ ${c.table_name}.${c.column_name} (nullable: ${c.is_nullable})`);
        });

        console.log('\n🔧 Opções:');
        console.log('1. Se a migração foi parcialmente aplicada, marcar como rolled-back e reaplicar');
        console.log('2. Se a migração foi completamente aplicada, marcar como applied');
        console.log('3. Se houver problemas, pode ser necessário corrigir manualmente\n');

        // Verificar se businesses existe (indica que migração foi parcialmente aplicada)
        const businessesExists = tablesCheck.some(t => t.table_name === 'businesses');
        const businessIdExists = columnsCheck.length > 0;

        if (businessesExists && businessIdExists) {
            console.log('✅ Parece que a migração foi parcialmente aplicada.');
            console.log('💡 Recomendação: Marcar como rolled-back e aplicar novamente\n');
            
            console.log('Executando: npx prisma migrate resolve --rolled-back 20250115200000_add_multi_tenant_business');
            try {
                execSync('npx prisma migrate resolve --rolled-back 20250115200000_add_multi_tenant_business', {
                    stdio: 'inherit',
                    cwd: process.cwd()
                });
                console.log('\n✅ Migração marcada como rolled-back. Agora execute: npx prisma migrate deploy');
            } catch (error) {
                console.error('\n❌ Erro ao marcar como rolled-back:', error.message);
            }
        } else if (!businessesExists && !businessIdExists) {
            console.log('⚠️  Migração não foi aplicada. Pode ser marcada como rolled-back.\n');
            console.log('Executando: npx prisma migrate resolve --rolled-back 20250115200000_add_multi_tenant_business');
            try {
                execSync('npx prisma migrate resolve --rolled-back 20250115200000_add_multi_tenant_business', {
                    stdio: 'inherit',
                    cwd: process.cwd()
                });
                console.log('\n✅ Migração marcada como rolled-back. Agora execute: npx prisma migrate deploy');
            } catch (error) {
                console.error('\n❌ Erro:', error.message);
            }
        } else {
            console.log('⚠️  Estado inconsistente detectado. Verificação manual necessária.');
        }

    } catch (error) {
        console.error('❌ Erro ao verificar migrações:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resolveFailedMigration();
