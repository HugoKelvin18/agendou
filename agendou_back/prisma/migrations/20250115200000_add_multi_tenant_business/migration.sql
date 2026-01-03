-- CreateTable
CREATE TABLE "businesses" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "dominio" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "businesses_slug_key" ON "businesses"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "businesses_dominio_key" ON "businesses"("dominio");

-- CreateIndex
CREATE INDEX "businesses_slug_idx" ON "businesses"("slug");

-- CreateIndex
CREATE INDEX "businesses_dominio_idx" ON "businesses"("dominio");

-- AlterTable: Adicionar businessId em usuarios
ALTER TABLE "usuarios" ADD COLUMN "businessId" INTEGER;

-- Criar um business padrão para dados existentes
INSERT INTO "businesses" ("nome", "slug", "dominio", "ativo", "createdAt", "updatedAt")
VALUES ('Negócio Padrão', 'default', NULL, true, NOW(), NOW());

-- Atualizar usuarios existentes com o business padrão
UPDATE "usuarios" SET "businessId" = (SELECT id FROM "businesses" WHERE slug = 'default') WHERE "businessId" IS NULL;

-- Tornar businessId obrigatório e adicionar constraint
ALTER TABLE "usuarios" ALTER COLUMN "businessId" SET NOT NULL;

-- Adicionar foreign key e índice
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "usuarios_businessId_idx" ON "usuarios"("businessId");

-- Remover unique em email e criar unique composto
-- Primeiro dropar a constraint (se existir como constraint)
ALTER TABLE "usuarios" DROP CONSTRAINT IF EXISTS "usuarios_email_key";
-- Depois dropar o índice (se existir como índice separado)
DROP INDEX IF EXISTS "usuarios_email_key";
CREATE UNIQUE INDEX "usuarios_businessId_email_key" ON "usuarios"("businessId", "email");

-- AlterTable: Adicionar businessId em servicos
ALTER TABLE "servicos" ADD COLUMN "businessId" INTEGER;

-- Atualizar servicos existentes com businessId do profissional
UPDATE "servicos" s SET "businessId" = (SELECT u."businessId" FROM "usuarios" u WHERE u.id = s."profissionalId") WHERE "businessId" IS NULL;

-- Tornar businessId obrigatório
ALTER TABLE "servicos" ALTER COLUMN "businessId" SET NOT NULL;

-- Adicionar foreign key e índice
ALTER TABLE "servicos" ADD CONSTRAINT "servicos_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "servicos_businessId_idx" ON "servicos"("businessId");

-- AlterTable: Adicionar businessId em disponibilidades
ALTER TABLE "disponibilidades" ADD COLUMN "businessId" INTEGER;

-- Atualizar disponibilidades existentes com businessId do profissional
UPDATE "disponibilidades" d SET "businessId" = (SELECT u."businessId" FROM "usuarios" u WHERE u.id = d."profissionalId") WHERE "businessId" IS NULL;

-- Tornar businessId obrigatório
ALTER TABLE "disponibilidades" ALTER COLUMN "businessId" SET NOT NULL;

-- Adicionar foreign key e índice
ALTER TABLE "disponibilidades" ADD CONSTRAINT "disponibilidades_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "disponibilidades_businessId_idx" ON "disponibilidades"("businessId");

-- AlterTable: Adicionar businessId em agendamentos
ALTER TABLE "agendamentos" ADD COLUMN "businessId" INTEGER;

-- Atualizar agendamentos existentes com businessId do cliente
UPDATE "agendamentos" a SET "businessId" = (SELECT u."businessId" FROM "usuarios" u WHERE u.id = a."clienteId") WHERE "businessId" IS NULL;

-- Tornar businessId obrigatório
ALTER TABLE "agendamentos" ALTER COLUMN "businessId" SET NOT NULL;

-- Adicionar foreign key e índice
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "agendamentos_businessId_idx" ON "agendamentos"("businessId");

-- AlterTable: Adicionar businessId em codigos_acesso
ALTER TABLE "codigos_acesso" ADD COLUMN "businessId" INTEGER;

-- Atualizar codigos_acesso existentes com business padrão
UPDATE "codigos_acesso" SET "businessId" = (SELECT id FROM "businesses" WHERE slug = 'default') WHERE "businessId" IS NULL;

-- Tornar businessId obrigatório
ALTER TABLE "codigos_acesso" ALTER COLUMN "businessId" SET NOT NULL;

-- Adicionar foreign key e índice
ALTER TABLE "codigos_acesso" ADD CONSTRAINT "codigos_acesso_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "codigos_acesso_businessId_idx" ON "codigos_acesso"("businessId");

-- Remover unique em codigo e criar unique composto
-- Primeiro dropar a constraint (se existir como constraint)
ALTER TABLE "codigos_acesso" DROP CONSTRAINT IF EXISTS "codigos_acesso_codigo_key";
-- Depois dropar o índice (se existir como índice separado)
DROP INDEX IF EXISTS "codigos_acesso_codigo_key";
CREATE UNIQUE INDEX "codigos_acesso_businessId_codigo_key" ON "codigos_acesso"("businessId", "codigo");
