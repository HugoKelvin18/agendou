import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

async function fixMigration() {
    try {
        console.log('🔍 Verificando estado atual do banco de dados...\n');

        // 1. Verificar se o valor PENDENTE existe no enum
        console.log('1. Verificando enum StatusPagamento...');
        const enumCheck = await prisma.$queryRaw`
            SELECT enumlabel 
            FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'StatusPagamento' 
            AND e.enumlabel = 'PENDENTE'
        `;

        if (Array.isArray(enumCheck) && enumCheck.length === 0) {
            console.log('   ❌ Valor PENDENTE não encontrado. Adicionando...');
            await prisma.$executeRawUnsafe(`ALTER TYPE "StatusPagamento" ADD VALUE 'PENDENTE'`);
            console.log('   ✅ Valor PENDENTE adicionado ao enum');
        } else {
            console.log('   ✅ Valor PENDENTE já existe no enum');
        }

        // 2. Verificar se a coluna whatsapp existe
        console.log('\n2. Verificando coluna whatsapp...');
        // Verificar qual é o nome da tabela (pode ser "business" ou "businesses")
        const tableCheck = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND (table_name = 'business' OR table_name = 'businesses')
            LIMIT 1
        `;
        
        const tableName = Array.isArray(tableCheck) && tableCheck.length > 0 
            ? tableCheck[0].table_name 
            : 'business'; // Default
        
        console.log(`   📋 Usando tabela: ${tableName}`);
        
        const columnCheck = await prisma.$queryRawUnsafe(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = '${tableName}' 
            AND column_name = 'whatsapp'
        `);

        if (Array.isArray(columnCheck) && columnCheck.length === 0) {
            console.log('   ❌ Coluna whatsapp não encontrada. Adicionando...');
            await prisma.$executeRawUnsafe(`ALTER TABLE "${tableName}" ADD COLUMN IF NOT EXISTS "whatsapp" TEXT`);
            console.log('   ✅ Coluna whatsapp adicionada');
        } else {
            console.log('   ✅ Coluna whatsapp já existe');
        }

        // 3. Marcar migration como aplicada
        console.log('\n3. Marcando migration como aplicada...');
        try {
            const { stdout, stderr } = await execAsync(
                `npx prisma migrate resolve --applied 20250121000000_add_whatsapp_and_pendente_status`,
                { cwd: process.cwd() }
            );
            if (stdout) console.log('   📄', stdout.trim());
            if (stderr && !stderr.includes('Warning')) console.log('   ⚠️', stderr.trim());
            console.log('   ✅ Migration marcada como aplicada');
        } catch (error) {
            // Se já estiver marcada, não é um erro crítico
            if (error.message.includes('already applied') || error.message.includes('already marked')) {
                console.log('   ℹ️  Migration já estava marcada como aplicada');
            } else {
                console.log('   ⚠️  Erro ao marcar migration:', error.message);
                console.log('   💡 Você pode marcar manualmente com:');
                console.log('      npx prisma migrate resolve --applied 20250121000000_add_whatsapp_and_pendente_status');
            }
        }

        console.log('\n✅ Processo concluído com sucesso!');
        console.log('\n📝 Próximos passos:');
        console.log('   - Execute: npx prisma migrate deploy');
        console.log('   - Ou aguarde o próximo deploy automático');

    } catch (error) {
        console.error('\n❌ Erro ao executar script:', error);
        console.error('\nDetalhes:', error.message);
        if (error.stack) {
            console.error('\nStack:', error.stack);
        }
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Executar
fixMigration();
