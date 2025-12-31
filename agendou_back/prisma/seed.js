import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Iniciando seed...\n");

    // Criar códigos de acesso para profissionais
    const codigos = [
        {
            codigo: "PROF2024",
            descricao: "Código de acesso padrão para profissionais 2024",
            ativo: true
        },
        {
            codigo: "ADMIN123",
            descricao: "Código administrativo",
            ativo: true
        }
    ];

    for (const dadosCodigo of codigos) {
        const codigoExistente = await prisma.codigoAcesso.findUnique({
            where: { codigo: dadosCodigo.codigo }
        });

        if (codigoExistente) {
            console.log(`⚠️  Código "${dadosCodigo.codigo}" já existe. Pulando...`);
            continue;
        }

        const codigo = await prisma.codigoAcesso.create({
            data: dadosCodigo
        });

        console.log(`✅ Código "${codigo.codigo}" criado com sucesso!`);
    }

    console.log("\n✨ Seed concluído!");
}

main()
    .catch((e) => {
        console.error("❌ Erro no seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
