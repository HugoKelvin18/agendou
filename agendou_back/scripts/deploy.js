import { execSync } from 'child_process';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

async function deploy() {
    try {
        // Verificar se DATABASE_URL está configurada
        if (!process.env.DATABASE_URL) {
            console.error('❌ ERRO: DATABASE_URL não está configurada!');
            console.error('   Configure a variável DATABASE_URL no Render (Environment Variables)');
            console.error('   Ou no arquivo .env local');
            process.exit(1);
        }

        console.log('✅ DATABASE_URL configurada');
        console.log(`   Database: ${process.env.DATABASE_URL.split('@')[1]?.split('/')[0] || 'configurada'}`);

        console.log('🔧 Gerando Prisma Client...');
        execSync('npx prisma generate', { 
            stdio: 'inherit',
            env: { ...process.env }
        });

        console.log('🔍 Verificando e corrigindo migrações falhadas...');
        
        // Primeiro, tentar corrigir a migration específica que está falhando
        // Isso garante que o banco está no estado correto antes de marcar como resolvida
        try {
            console.log('🔧 Executando fix para migration 20250121000000_add_whatsapp_and_pendente_status...');
            execSync('npm run fix-migration-pendente', { 
                stdio: 'inherit',
                env: { ...process.env }
            });
            console.log('✅ Fix executado com sucesso');
        } catch (fixError) {
            console.log('⚠️  Fix não executou completamente, mas continuando...');
            console.log('   Isso pode ser normal se a migration já foi corrigida.');
            console.log('   Erro:', fixError.message);
        }
        
        // Lista de migrações que podem ter falhado
        const migrationsFalhadas = [
            '20250115200000_add_multi_tenant_business',
            '20250121000000_add_whatsapp_and_pendente_status'
        ];
        
        for (const migration of migrationsFalhadas) {
            try {
                // Tentar marcar como applied primeiro
                execSync(`npx prisma migrate resolve --applied ${migration}`, {
                    stdio: 'pipe',
                    env: { ...process.env }
                });
                console.log(`✅ Migração ${migration} marcada como aplicada`);
            } catch (error) {
                // Se falhar, tentar rolled-back
                try {
                    execSync(`npx prisma migrate resolve --rolled-back ${migration}`, {
                        stdio: 'pipe',
                        env: { ...process.env }
                    });
                    console.log(`✅ Migração ${migration} marcada como rolled-back`);
                } catch (rollbackError) {
                    // Se ambos falharem, provavelmente já foi resolvida ou não existe
                    console.log(`ℹ️  Migração ${migration} já resolvida ou não existe. Continuando...`);
                }
            }
        }

        console.log('📦 Aplicando migrações...');
        execSync('npx prisma migrate deploy', { 
            stdio: 'inherit',
            env: { ...process.env }
        });

        console.log('🔧 Inicializando sistema admin...');
        try {
            execSync('npm run init-admin', { 
                stdio: 'inherit',
                env: { ...process.env, NODE_ENV: process.env.NODE_ENV || 'production' }
            });
            console.log('✅ Sistema admin inicializado');
        } catch (initError) {
            // Logar erro completo para debug
            console.error('❌ Erro ao inicializar sistema admin:', initError.message);
            console.log('⚠️  Tentando continuar... Execute manualmente se necessário: npm run init-admin');
            // Não bloquear o deploy, mas avisar claramente
        }

        console.log('✅ Deploy concluído com sucesso!');
        console.log('\n📝 Verificações finais:');
        console.log(`   - DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Configurada' : '❌ Não configurada'}`);
        console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'não definido'}`);
    } catch (error) {
        console.error('❌ Erro no deploy:', error);
        console.error('\n🔍 Informações de debug:');
        console.error(`   - DATABASE_URL: ${process.env.DATABASE_URL ? 'Configurada' : 'NÃO CONFIGURADA'}`);
        console.error(`   - Erro completo:`, error.message);
        if (error.stack) {
            console.error(`   - Stack:`, error.stack);
        }
        process.exit(1);
    }
}

deploy();
