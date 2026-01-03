/**
 * Script para inicializar o sistema de administração
 * 
 * Este script:
 * 1. Cria o business "admin-system" se não existir
 * 2. Cria um código de acesso admin padrão
 * 
 * Uso: npm run init-admin
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function initAdmin() {
    try {
        console.log('🚀 Inicializando sistema de administração...\n');

        // 1. Criar ou buscar business admin-system
        let adminBusiness = await prisma.business.findFirst({
            where: { slug: 'admin-system' }
        });

        if (!adminBusiness) {
            console.log('📦 Criando business admin-system...');
            adminBusiness = await prisma.business.create({
                data: {
                    nome: 'Sistema Admin',
                    slug: 'admin-system',
                    ativo: true,
                    plano: 'ADMIN',
                    statusPagamento: 'ATIVO',
                    toleranciaDias: 0 // Admins não têm tolerância
                }
            });
            console.log('✅ Business admin-system criado com sucesso!\n');
        } else {
            console.log('✅ Business admin-system já existe\n');
        }

        // 2. Criar código de acesso admin padrão se não existir
        const codigoPadrao = 'ADMIN2026';
        const codigoExistente = await prisma.codigoAcesso.findFirst({
            where: {
                businessId: adminBusiness.id,
                codigo: codigoPadrao
            }
        });

        if (!codigoExistente) {
            console.log(`🔑 Criando código de acesso admin padrão: ${codigoPadrao}...`);
            await prisma.codigoAcesso.create({
                data: {
                    businessId: adminBusiness.id,
                    codigo: codigoPadrao,
                    descricao: 'Código de acesso padrão para criar administradores',
                    ativo: true
                }
            });
            console.log(`✅ Código de acesso ${codigoPadrao} criado com sucesso!\n`);
        } else {
            console.log(`✅ Código de acesso ${codigoPadrao} já existe\n`);
        }

        console.log('📋 Resumo:');
        console.log(`   Business ID: ${adminBusiness.id}`);
        console.log(`   Slug: ${adminBusiness.slug}`);
        console.log(`   Código Admin: ${codigoPadrao}`);
        console.log('\n✨ Sistema de administração inicializado com sucesso!');
        console.log('\n📝 Próximos passos:');
        console.log('   1. Acesse /register no frontend');
        console.log(`   2. Use o código: ${codigoPadrao}`);
        console.log('   3. Selecione role: ADMIN');
        console.log('   4. Complete o cadastro\n');

    } catch (error) {
        console.error('❌ Erro ao inicializar sistema admin:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Executar
initAdmin()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
