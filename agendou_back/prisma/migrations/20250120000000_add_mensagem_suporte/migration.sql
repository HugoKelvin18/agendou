-- CreateTable
CREATE TABLE IF NOT EXISTS "mensagens_suporte" (
    "id" SERIAL NOT NULL,
    "businessId" INTEGER NOT NULL,
    "mensagem" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "criadoPor" INTEGER,

    CONSTRAINT "mensagens_suporte_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "mensagens_suporte_businessId_idx" ON "mensagens_suporte"("businessId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "mensagens_suporte_criadoEm_idx" ON "mensagens_suporte"("criadoEm");

-- AddForeignKey
ALTER TABLE "mensagens_suporte" ADD CONSTRAINT "mensagens_suporte_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
