-- CreateEnum
CREATE TYPE "StatusSuporte" AS ENUM ('PENDENTE', 'EM_ATENDIMENTO', 'RESOLVIDO', 'CANCELADO');

-- CreateTable
CREATE TABLE IF NOT EXISTS "solicitacoes_suporte" (
    "id" SERIAL NOT NULL,
    "businessId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "assunto" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "status" "StatusSuporte" NOT NULL DEFAULT 'PENDENTE',
    "resposta" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "respondidoEm" TIMESTAMP(3),

    CONSTRAINT "solicitacoes_suporte_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "solicitacoes_suporte_businessId_idx" ON "solicitacoes_suporte"("businessId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "solicitacoes_suporte_usuarioId_idx" ON "solicitacoes_suporte"("usuarioId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "solicitacoes_suporte_status_idx" ON "solicitacoes_suporte"("status");

-- AddForeignKey
ALTER TABLE "solicitacoes_suporte" ADD CONSTRAINT "solicitacoes_suporte_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes_suporte" ADD CONSTRAINT "solicitacoes_suporte_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
