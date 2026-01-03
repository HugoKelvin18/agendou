# Configuração de Deploy no Render.com

## Problema

A migração `20250115200000_add_multi_tenant_business` está marcada como falhada, bloqueando novos deploys.

## Solução: Script de Deploy Automático

Foi criado um script `deploy.js` que resolve automaticamente migrações falhadas.

### Configuração no Render.com

**IMPORTANTE**: Altere o Build Command no Render para:

```
cd agendou_back && npm install && npm run deploy
```

Ou se o Render já estiver configurado para a pasta `agendou_back`:

```
npm install && npm run deploy
```

**Start Command:**
```
npm start
```

### Comando Alternativo (Se o script não funcionar)

Se preferir usar um comando direto no Build Command:

```
cd agendou_back && npm install && npx prisma generate && (npx prisma migrate resolve --rolled-back 20250115200000_add_multi_tenant_business || npx prisma migrate resolve --applied 20250115200000_add_multi_tenant_business || true) && npx prisma migrate deploy
```

O `|| true` garante que o build continue mesmo se a migração já foi resolvida.

### O que o script faz:

1. Gera o Prisma Client
2. Verifica se há migrações falhadas
3. Resolve automaticamente a migração `20250115200000_add_multi_tenant_business`
4. Aplica todas as migrações pendentes

### Alternativa: Comando Direto

Se preferir não usar o script, use este comando de build:

```bash
npm install && npx prisma generate && npx prisma migrate resolve --rolled-back 20250115200000_add_multi_tenant_business || true && npx prisma migrate deploy
```

O `|| true` garante que o build continue mesmo se a migração já foi resolvida.

## Verificação

Após o deploy, verifique os logs para confirmar:

```
✅ Migração falhada resolvida (rolled-back)
📦 Aplicando migrações...
✅ Deploy concluído com sucesso!
```

## Troubleshooting

Se ainda houver problemas:

1. Verifique os logs do Render
2. Execute manualmente no banco:
   ```sql
   SELECT * FROM "_prisma_migrations" 
   WHERE migration_name = '20250115200000_add_multi_tenant_business';
   ```
3. Se necessário, delete o registro:
   ```sql
   DELETE FROM "_prisma_migrations" 
   WHERE migration_name = '20250115200000_add_multi_tenant_business';
   ```
