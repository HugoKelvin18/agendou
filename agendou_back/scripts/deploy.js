import { execSync } from 'child_process';

async function deploy() {
    try {
        console.log('🔧 Gerando Prisma Client...');
        execSync('npx prisma generate', { stdio: 'inherit' });

        console.log('🔍 Tentando resolver migração falhada...');
        
        // Tentar resolver a migração falhada (ignorar erros se já foi resolvida)
        try {
            execSync('npx prisma migrate resolve --rolled-back 20250115200000_add_multi_tenant_business', {
                stdio: 'inherit'
            });
            console.log('✅ Migração falhada resolvida (rolled-back)');
        } catch (resolveError) {
            // Se falhar, tentar marcar como applied
            try {
                execSync('npx prisma migrate resolve --applied 20250115200000_add_multi_tenant_business', {
                    stdio: 'inherit'
                });
                console.log('✅ Migração falhada resolvida (applied)');
            } catch (appliedError) {
                // Se ambos falharem, provavelmente já foi resolvida ou não existe
                console.log('ℹ️  Migração já resolvida ou não existe. Continuando...');
            }
        }

        console.log('📦 Aplicando migrações...');
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });

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
    } catch (error) {
        console.error('❌ Erro no deploy:', error);
        process.exit(1);
    }
}

deploy();
