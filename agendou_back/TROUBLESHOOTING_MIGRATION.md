# Troubleshooting - Erros de Migração

## Como Diagnosticar o Erro

Execute o comando de migração e capture a mensagem de erro completa:

```bash
cd agendou_back
npx prisma migrate deploy
```

## Erros Comuns e Soluções

### 1. Erro: "column does not exist" ou "table does not exist"

**Causa**: A migração está tentando acessar uma tabela/coluna que ainda não existe.

**Solução**: A migração de correção foi atualizada para verificar se as tabelas existem antes de operar.

### 2. Erro: "constraint already exists" ou "index already exists"

**Causa**: A constraint ou índice já foi criado em uma migração anterior.

**Solução**: A migração usa `IF EXISTS` e `IF NOT EXISTS` para evitar esses erros.

### 3. Erro: "cannot cast type" (StatusPagamento)

**Causa**: Tentativa de inserir string em campo enum sem cast.

**Solução**: A migração foi atualizada para usar `'ATIVO'::"StatusPagamento"` ou inserir sem o campo se ele não existir.

### 4. Erro: "violates foreign key constraint"

**Causa**: Existem registros órfãos que não foram limpos.

**Solução**: A migração limpa registros órfãos antes de criar FKs.

## Verificar Estado Atual do Banco

```sql
-- Verificar quais migrações foram aplicadas
SELECT * FROM "_prisma_migrations" ORDER BY finished_at DESC;

-- Verificar estrutura das tabelas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar constraints
SELECT constraint_name, table_name 
FROM information_schema.table_constraints 
WHERE table_schema = 'public'
ORDER BY table_name, constraint_name;
```

## Aplicar Migração Manualmente (se necessário)

Se `prisma migrate deploy` continuar falhando, você pode aplicar a migração manualmente:

```bash
# Conectar ao banco
psql $DATABASE_URL

# Executar o SQL da migração
\i prisma/migrations/20250117000000_fix_orphan_records_and_constraints/migration.sql
```

## Resetar Migrações (ÚLTIMO RECURSO)

⚠️ **ATENÇÃO**: Isso apagará todos os dados!

```bash
# Resetar banco e aplicar todas as migrações
npx prisma migrate reset

# Ou apenas marcar migrações como aplicadas sem executar
npx prisma migrate resolve --applied 20250117000000_fix_orphan_records_and_constraints
```

## Próximos Passos

1. Execute `npx prisma migrate deploy` e capture o erro completo
2. Compartilhe a mensagem de erro para análise específica
3. Verifique o estado do banco usando as queries acima
