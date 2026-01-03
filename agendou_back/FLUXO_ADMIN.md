# Fluxo Completo de ADMIN - Documentação

## ✅ Status: Implementado

O sistema de ADMIN está **completamente implementado** e pronto para uso.

## 📋 Checklist de Implementação

### 1. Schema Prisma ✅
- [x] `enum Role` inclui `ADMIN` (linha 186)
- [x] `businessId` é nullable para admins (linha 15)
- [x] Foreign key permite null (linha 38)

**Arquivo:** `prisma/schema.prisma`

### 2. Migrations ✅
- [x] Migration `20250116000001_add_admin_role` existe
- [x] Adiciona `ADMIN` ao enum `Role`
- [x] Torna `businessId` nullable
- [x] Remove constraint única composta e cria única por email

**Arquivo:** `prisma/migrations/20250116000001_add_admin_role/migration.sql`

**Para aplicar:**
```bash
cd agendou_back
npx prisma migrate deploy
```

### 3. Script de Inicialização ✅
- [x] Script `init-admin.js` existe
- [x] Está configurado no `package.json` como `npm run init-admin`
- [x] Cria business "admin-system" se não existir
- [x] Cria código de acesso padrão "ADMIN2026"

**Arquivo:** `scripts/init-admin.js`

**Para executar:**
```bash
cd agendou_back
npm run init-admin
```

### 4. Frontend (Register.tsx) ✅
- [x] Opção "Sou administrador" no select de role (linha 184)
- [x] Campo de código de acesso aparece para ADMIN (linha 188)
- [x] Validação de código obrigatório para ADMIN (linha 32)
- [x] Envia `role: "ADMIN"` e `codigoAcesso` no body (linhas 48-49)

**Arquivo:** `agendou_front/src/pages/auth/Register.tsx`

### 5. Backend (AuthController.js) ✅
- [x] Valida código de acesso ADMIN (linha 141)
- [x] Busca business "admin-system" (linha 147)
- [x] Valida código no business admin-system (linha 156)
- [x] Cria usuário com `businessId: null` e `role: "ADMIN"` (linha 181)
- [x] Retorna token sem businessId (linha 194)

**Arquivo:** `src/controllers/AuthController.js`

### 6. Login ✅
- [x] Login valida ADMIN e retorna token sem businessId (linha 31)
- [x] Redireciona para `/admin/dashboard` (Login.tsx linha 36)

## 🚀 Como Usar

### Passo 1: Aplicar Migrations
```bash
cd agendou_back
npx prisma migrate deploy
```

### Passo 2: Inicializar Sistema Admin
```bash
cd agendou_back
npm run init-admin
```

Isso criará:
- Business "admin-system" (se não existir)
- Código de acesso "ADMIN2026" (se não existir)

### Passo 3: Cadastrar Primeiro Admin
1. Acesse `/register` no frontend
2. Selecione "Sou administrador" no campo "Tipo de conta"
3. Digite o código: `ADMIN2026`
4. Preencha os demais dados
5. Clique em "Cadastrar"

### Passo 4: Login
1. Acesse `/login`
2. Use o email e senha do admin cadastrado
3. Será redirecionado para `/admin/dashboard`

## 📝 Estrutura de Dados

### Usuario Admin
```typescript
{
  id: number
  businessId: null  // Admins não têm businessId
  nome: string
  email: string
  role: "ADMIN"
  // ... outros campos
}
```

### Business Admin-System
```typescript
{
  id: number
  nome: "Sistema Admin"
  slug: "admin-system"
  plano: "ADMIN"
  statusPagamento: "ATIVO"
  toleranciaDias: 0
}
```

### Código de Acesso Admin
```typescript
{
  id: number
  businessId: <id do admin-system>
  codigo: "ADMIN2026"
  descricao: "Código de acesso padrão para criar administradores"
  ativo: true
}
```

## 🔒 Segurança

- ✅ Código de acesso é obrigatório para criar ADMIN
- ✅ Código é validado no business "admin-system"
- ✅ Código deve estar ativo e não expirado
- ✅ Admin não tem businessId (isolamento completo)
- ✅ Email é único globalmente (não precisa businessId)

## 🐛 Troubleshooting

### Erro: "Sistema de administração não configurado"
**Solução:** Execute `npm run init-admin` para criar o business admin-system.

### Erro: "Código de acesso inválido"
**Solução:** Verifique se o código está correto (ADMIN2026) e se foi criado pelo script init-admin.

### Erro: "Migration não aplicada"
**Solução:** Execute `npx prisma migrate deploy` para aplicar todas as migrations pendentes.

### Admin não aparece no select
**Solução:** 
1. Verifique se a migration foi aplicada: `npx prisma migrate status`
2. Regenere o Prisma Client: `npx prisma generate`
3. Rebuild o frontend: `cd agendou_front && npm run build`

## 📚 Arquivos Relacionados

- `prisma/schema.prisma` - Schema com enum Role e businessId nullable
- `prisma/migrations/20250116000001_add_admin_role/migration.sql` - Migration para adicionar ADMIN
- `scripts/init-admin.js` - Script de inicialização
- `src/controllers/AuthController.js` - Validação e criação de ADMIN
- `agendou_front/src/pages/auth/Register.tsx` - Tela de cadastro com opção ADMIN
- `agendou_front/src/pages/auth/Login.tsx` - Login com redirecionamento para admin
