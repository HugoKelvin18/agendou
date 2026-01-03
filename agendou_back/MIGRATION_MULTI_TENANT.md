# Migration Multi-Tenant - Documentação

## ⚠️ AVISO IMPORTANTE

Esta é uma **mudança estrutural grande** que transforma o sistema em multi-tenant baseado em `businessId`. 

### O que muda:

1. **Nova tabela `businesses`**: Cada negócio/cliente terá seu próprio business
2. **businessId obrigatório**: Todas as tabelas principais agora exigem `businessId`
3. **Isolamento de dados**: Cada business só acessa seus próprios dados
4. **Autenticação**: Token JWT agora inclui `businessId`
5. **Frontend**: Precisa resolver business por slug/domínio antes de autenticar

### Migration criada:

- **Arquivo**: `prisma/migrations/20250115200000_add_multi_tenant_business/migration.sql`
- **Status**: Criada, mas **NÃO APLICADA**

### Passos para aplicar:

1. **BACKUP DO BANCO DE DADOS** (OBRIGATÓRIO!)
   ```bash
   pg_dump -U seu_usuario -d agendou > backup_antes_multi_tenant.sql
   ```

2. **Aplicar migration:**
   ```bash
   cd agendou_back
   npx prisma migrate deploy
   ```
   OU manualmente executar o SQL no banco

3. **Regenerar Prisma Client:**
   ```bash
   npx prisma generate
   ```

4. **Criar business inicial:**
   Após a migration, um business padrão será criado automaticamente (slug: 'default').
   Você pode criar novos businesses via API ou SQL.

5. **Atualizar código:**
   - Backend controllers já estão sendo atualizados
   - Frontend precisa ser atualizado para resolver business

### Estrutura de dados existentes:

A migration preserva dados existentes:
- Usa um business padrão (slug: 'default') para dados existentes
- Todos os usuários, serviços, agendamentos existentes são vinculados ao business padrão
- Códigos de acesso existentes também são vinculados ao business padrão

### Próximos passos após migration:

1. ✅ Schema Prisma atualizado
2. ✅ Migration SQL criada
3. ⏳ Controllers backend atualizados (em andamento)
4. ⏳ Frontend atualizado para resolver business
5. ⏳ Testes completos

### Notas importantes:

- **Não aplicar em produção sem backup**
- **Testar em ambiente de desenvolvimento primeiro**
- **Dados existentes serão preservados no business padrão**
- **Após aplicar, todos os novos registros devem incluir businessId válido**
