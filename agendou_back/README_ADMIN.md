# Sistema de Administração - Guia Rápido

## 🎯 Visão Geral

Sistema completo de administração para gerenciar businesses, planos, pagamentos e bloqueios.

## 🚀 Aplicação Rápida

### 1. Aplicar Migrations

```bash
cd agendou_back
npx prisma migrate deploy
npx prisma generate
```

### 2. Inicializar Sistema Admin

```bash
npm run init-admin
```

Isso criará:
- Business "admin-system"
- Código de acesso: `ADMIN2026`

### 3. Criar Primeiro Admin

1. Acesse `/register` no frontend
2. Preencha:
   - Nome, Email, Senha
   - Role: **ADMIN**
   - Código: **ADMIN2026**
3. Faça login → será redirecionado para `/admin/dashboard`

## 📊 Funcionalidades

### Dashboard Admin
- Visão geral de todos os businesses
- Estatísticas (total, ativos, bloqueados, usuários)
- Lista com métricas de uso

### Gerenciamento de Business
- Ver detalhes completos
- Alterar status de pagamento
- Alterar plano e limites
- Registrar pagamentos
- Bloquear/Liberar businesses

### Métricas Exibidas
- Total de usuários
- Total de profissionais
- Total de serviços
- Agendamentos do mês
- Dias em atraso (se aplicável)

## 🔐 Segurança

- Apenas usuários com `role="ADMIN"` podem acessar rotas `/admin/*`
- Admin não precisa de `businessId` (pode ser null)
- Código de acesso especial para criar novos admins
- Middleware `requireRole(["ADMIN"])` protege todas as rotas

## 📝 Rotas Disponíveis

### Backend
- `GET /admin/businesses` - Listar todos
- `GET /admin/businesses/:id` - Detalhes
- `PATCH /admin/businesses/:id/status` - Alterar status
- `PATCH /admin/businesses/:id/plano` - Alterar plano
- `POST /admin/businesses/:id/pagamento` - Registrar pagamento
- `POST /admin/businesses/:id/bloquear` - Bloquear
- `POST /admin/businesses/:id/liberar` - Liberar
- `POST /admin/codigos-acesso` - Criar código admin

### Frontend
- `/admin/dashboard` - Dashboard principal
- `/admin/businesses/:id` - Detalhes do business

## 🛠️ Troubleshooting

### Admin não consegue fazer login
- Verifique se o usuário tem `role="ADMIN"`
- Verifique se `businessId` é null no banco
- Verifique token JWT no localStorage

### Código de acesso não funciona
- Execute `npm run init-admin` novamente
- Verifique se business "admin-system" existe
- Verifique se código está ativo no banco

### Rotas admin retornam 403
- Verifique se token está sendo enviado
- Verifique se usuário tem role ADMIN
- Verifique middleware `requireRole` nas rotas

## 📚 Documentação Completa

Veja `APLICAR_MUDANCAS.md` para guia detalhado de aplicação.
