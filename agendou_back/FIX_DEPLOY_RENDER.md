# Como Corrigir o Deploy no Render

## Problema
A migration `20250121000000_add_whatsapp_and_pendente_status` está falhando no Render com erro `P3009`, bloqueando novos deploys.

## Solução Rápida (Recomendada)

### Opção 1: Executar o script de fix manualmente no Render

1. Acesse o **Shell** do serviço no Render
2. Execute:
```bash
cd agendou_back
npm run fix-migration-pendente
```

3. Depois execute:
```bash
npx prisma migrate deploy
```

### Opção 2: Marcar a migration como resolvida manualmente

Se o script não funcionar, marque manualmente:

```bash
cd agendou_back
npx prisma migrate resolve --applied 20250121000000_add_whatsapp_and_pendente_status
npx prisma migrate deploy
```

## Verificação da Configuração do Render

### 1. Root Directory
Certifique-se de que o **Root Directory** no Render está configurado como:
```
agendou_back
```

### 2. Build Command
O comando de build deve ser:
```bash
npm install && npm run deploy
```

Ou, se preferir usar o script direto:
```bash
npm install && npx prisma generate && npm run deploy
```

### 3. Start Command
O comando de start deve ser:
```bash
npm start
```

## O que o script de deploy faz agora

1. Gera o Prisma Client
2. **Executa o fix-migration-pendente** (novo!)
3. Tenta resolver migrations falhadas
4. Aplica as migrations
5. Inicializa o admin (se necessário)

## Verificação Pós-Deploy

Após o deploy, verifique:

1. **Health check**: `https://seu-backend.onrender.com/health`
2. **Rota de lead**: `POST https://seu-backend.onrender.com/public/business/lead`
3. **Logs do Render**: Verifique se não há erros de migration

## Se ainda falhar

1. Verifique os logs do Render para ver o erro exato
2. Execute o fix manualmente no Shell
3. Verifique se a tabela `businesses` existe e tem a coluna `whatsapp`
4. Verifique se o enum `StatusPagamento` tem o valor `PENDENTE`

### Comandos de verificação no Shell do Render:

```bash
# Verificar coluna whatsapp
psql $DATABASE_URL -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'whatsapp';"

# Verificar enum PENDENTE
psql $DATABASE_URL -c "SELECT enumlabel FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'StatusPagamento' AND e.enumlabel = 'PENDENTE';"

# Verificar migrations aplicadas
psql $DATABASE_URL -c "SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 5;"
```
