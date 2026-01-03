# Implementação Multi-Tenant - Status

## ✅ Concluído

1. **Schema Prisma**
   - ✅ Model `Business` criado
   - ✅ `businessId` adicionado em todas as entidades
   - ✅ Unique composto `businessId_email` em Usuario
   - ✅ Unique composto `businessId_codigo` em CodigoAcesso
   - ✅ Índices criados

2. **Migration SQL**
   - ✅ Migration criada em `prisma/migrations/20250115200000_add_multi_tenant_business/migration.sql`
   - ⚠️ **NÃO APLICADA AINDA** - requer backup antes de aplicar

3. **Backend - Controllers**
   - ✅ `BusinessController.ts` criado com endpoints públicos e admin
   - ✅ Rota `/public/business` para resolver business por slug/domínio
   - ✅ `AuthController.js` atualizado:
     - Login: busca por `businessId_email`, inclui `businessId` no token
     - Register: valida `businessId`, valida código com `businessId_codigo`
   - ✅ Middleware `auth.js` atualizado para incluir `businessId` no req
   - ✅ Middleware `business.js` criado para validar business

4. **Backend - Rotas**
   - ✅ Rota `/public/business` adicionada em `business.ts`
   - ✅ Rota registrada no `server.js`

## ⏳ Pendente (Controllers)

Todos os controllers precisam ser atualizados para filtrar por `businessId`:

- [ ] `UsuarioController.ts`
  - `listarProfissionais`: filtrar por `businessId`
  - `getPerfil`: validar que usuário pertence ao `businessId` do token

- [ ] `ServicoController.ts`
  - `listar`: filtrar por `businessId` (query param ou header)
  - `listarPorProfissional`: validar `businessId`
  - `criar`: usar `businessId` do profissional logado
  - `atualizar`: validar `businessId`
  - `deletar`: validar `businessId`

- [ ] `DisponibilidadeController.ts`
  - `listar`: filtrar por `businessId`
  - `listarPorProfissional`: já usa `req.userId`, validar `businessId`
  - `criar`: usar `businessId` do profissional
  - `deletar`: validar `businessId`
  - `horariosDisponiveis`: filtrar por `businessId`

- [ ] `AgendamentoController.ts`
  - `criarCliente`: validar que cliente e profissional estão no mesmo `businessId`
  - `listarCliente`: filtrar por `businessId` do cliente
  - `listarProfissional`: filtrar por `businessId` do profissional
  - `atualizarStatus`: validar `businessId`

- [ ] `NotificacaoController.ts`
  - Filtrar por `businessId` (se aplicável)

## ⏳ Pendente (Frontend)

1. **BusinessContext**
   - [ ] Criar `BusinessContext.tsx` para gerenciar `businessId`
   - [ ] Resolver business por slug/domínio na inicialização
   - [ ] Salvar `businessId` no localStorage
   - [ ] Prover `businessId` para componentes

2. **API Service**
   - [ ] Atualizar `api.ts` para enviar header `x-business-id` em todas as requisições
   - [ ] Criar `businessService.ts` com função `resolverBusiness(slug/dominio)`

3. **Rotas Públicas**
   - [ ] Atualizar `Login.tsx` para incluir `businessId` no body/header
   - [ ] Atualizar `Register.tsx` para incluir `businessId` no body/header
   - [ ] Resolver business antes de carregar páginas públicas

4. **App Layout**
   - [ ] Atualizar `App.tsx` ou layout principal para inicializar BusinessContext
   - [ ] Extrair slug/domínio da URL ou usar valor padrão

## 📋 Próximos Passos

### 1. Aplicar Migration (ATENÇÃO!)
```bash
# BACKUP OBRIGATÓRIO PRIMEIRO!
pg_dump -U usuario -d agendou > backup_antes_multi_tenant.sql

# Aplicar migration
cd agendou_back
npx prisma migrate deploy
# OU executar SQL manualmente

# Regenerar Prisma Client
npx prisma generate
```

### 2. Criar Business Inicial
Após migration, criar business padrão ou usar o que a migration criou (slug: 'default').

### 3. Atualizar Controllers Backend
Implementar filtros por `businessId` em todos os controllers.

### 4. Implementar Frontend
- BusinessContext
- Resolver business por slug
- Enviar `x-business-id` header

### 5. Testes
- Testar fluxo completo de registro/login
- Testar isolamento de dados entre businesses
- Testar resolução de business por slug/domínio

## ⚠️ Atenção

- **Esta é uma mudança quebrando compatibilidade**
- **Backup obrigatório antes de aplicar migration**
- **Dados existentes serão vinculados ao business padrão (slug: 'default')**
- **Frontend precisa ser atualizado antes de usar em produção**
