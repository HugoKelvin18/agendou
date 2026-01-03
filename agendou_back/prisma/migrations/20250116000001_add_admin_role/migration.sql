-- Adicionar ADMIN ao enum Role
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'ADMIN';

-- Tornar businessId nullable
ALTER TABLE "usuarios" ALTER COLUMN "businessId" DROP NOT NULL;

-- Remover constraint unique antiga e criar nova
ALTER TABLE "usuarios" DROP CONSTRAINT IF EXISTS "usuarios_businessId_email_key";
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_email_key" UNIQUE ("email");

-- Criar índice para role
CREATE INDEX IF NOT EXISTS "usuarios_role_idx" ON "usuarios"("role");

-- Atualizar foreign key para permitir null
ALTER TABLE "usuarios" DROP CONSTRAINT IF EXISTS "usuarios_businessId_fkey";
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_businessId_fkey" 
  FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE;
