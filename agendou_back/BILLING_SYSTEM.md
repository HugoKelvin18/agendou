# Sistema de Billing e Bloqueio

## Visão Geral

Sistema completo de controle de planos, pagamentos e bloqueio automático por inadimplência.

## Estrutura do Banco de Dados

### Campos Adicionados ao Modelo Business

- **plano**: String (ex: "FREE", "BASIC", "PRO", "ENTERPRISE")
- **statusPagamento**: Enum (ATIVO, INADIMPLENTE, BLOQUEADO, CANCELADO)
- **vencimento**: DateTime (data de vencimento da assinatura)
- **ultimoPagamento**: DateTime (data do último pagamento registrado)
- **dataBloqueio**: DateTime (data em que foi bloqueado)
- **toleranciaDias**: Int (dias de tolerância após vencimento antes de bloquear, padrão: 5)

### Limites do Plano

- **limiteUsuarios**: Int (limite de usuários totais, null = ilimitado)
- **limiteProfissionais**: Int (limite de profissionais, null = ilimitado)
- **limiteServicos**: Int (limite de serviços, null = ilimitado)
- **limiteAgendamentos**: Int (limite de agendamentos por mês, null = ilimitado)

## Funcionamento do Bloqueio

### Status de Pagamento

1. **ATIVO**: Business funcionando normalmente
2. **INADIMPLENTE**: Vencimento passou, mas ainda dentro da tolerância
3. **BLOQUEADO**: Bloqueado automaticamente após tolerância ou manualmente
4. **CANCELADO**: Assinatura cancelada

### Lógica de Bloqueio Automático

1. Quando o vencimento passa, o status muda para **INADIMPLENTE** (se ainda estava ATIVO)
2. Após `toleranciaDias` (padrão: 5 dias), o sistema bloqueia automaticamente:
   - Status muda para **BLOQUEADO**
   - `dataBloqueio` é registrada
3. Bloqueio impede:
   - Login de usuários
   - Registro de novos usuários
   - Acesso a rotas autenticadas
   - Acesso a rotas públicas que dependem de business

### Middlewares

#### `validateBusiness`
- Valida existência e status ativo do business
- Verifica bloqueio e inadimplência
- Bloqueia automaticamente se passou da tolerância
- Usado em todas as rotas que dependem de business

#### `checkBusinessBlocked`
- Middleware específico para rotas de autenticação
- Verifica bloqueio antes de permitir login/registro
- Retorna mensagens específicas para cada tipo de bloqueio

## Aplicação nas Rotas

### Rotas de Autenticação
- `/auth/login` - Verifica bloqueio antes de autenticar
- `/auth/register` - Verifica bloqueio antes de permitir cadastro

### Rotas Autenticadas
Todas as rotas que usam `validateBusiness` já estão protegidas:
- `/notificacoes/*`
- `/agendamentos/*`
- `/servicos/*`
- `/disponibilidades/*`
- `/usuarios/*`

## Códigos de Erro

- `BUSINESS_BLOCKED`: Business bloqueado manualmente ou por inadimplência
- `BUSINESS_CANCELLED`: Assinatura cancelada
- `BUSINESS_OVERDUE_BLOCKED`: Bloqueado automaticamente após tolerância
- `BUSINESS_INACTIVE`: Business inativo

## Próximos Passos (Futuro)

### Painel de Auditoria/Admin

Endpoints sugeridos:
- `GET /admin/businesses` - Listar todos os businesses com dados de billing
- `GET /admin/businesses/:id` - Detalhes completos de um business
- `PATCH /admin/businesses/:id/status` - Alterar status de pagamento
- `PATCH /admin/businesses/:id/plano` - Alterar plano
- `POST /admin/businesses/:id/cobranca` - Registrar pagamento
- `POST /admin/businesses/:id/bloquear` - Bloquear manualmente
- `POST /admin/businesses/:id/liberar` - Liberar bloqueio

### Métricas de Uso

Para o painel de auditoria, calcular:
- Total de usuários/profissionais ativos
- Total de agendamentos no mês
- Serviços ativos
- Dias em atraso (se aplicável)

### Validação de Limites

Middleware adicional para verificar limites do plano:
- Antes de criar usuário: verificar `limiteUsuarios`
- Antes de criar profissional: verificar `limiteProfissionais`
- Antes de criar serviço: verificar `limiteServicos`
- Ao listar agendamentos: verificar `limiteAgendamentos` do mês

## Migration

Para aplicar as mudanças no banco:

```bash
cd agendou_back
npx prisma migrate deploy
```

Ou para desenvolvimento:

```bash
npx prisma migrate dev
```

## Exemplo de Uso

### Criar Business com Plano

```typescript
const business = await prisma.business.create({
  data: {
    nome: "Meu Negócio",
    slug: "meu-negocio",
    plano: "BASIC",
    statusPagamento: "ATIVO",
    vencimento: new Date("2026-02-01"),
    toleranciaDias: 5,
    limiteUsuarios: 100,
    limiteProfissionais: 10,
    limiteServicos: 50
  }
});
```

### Registrar Pagamento

```typescript
await prisma.business.update({
  where: { id: businessId },
  data: {
    statusPagamento: "ATIVO",
    ultimoPagamento: new Date(),
    vencimento: new Date("2026-03-01"), // Próximo vencimento
    dataBloqueio: null // Limpar bloqueio se existir
  }
});
```

### Bloquear Manualmente

```typescript
await prisma.business.update({
  where: { id: businessId },
  data: {
    statusPagamento: "BLOQUEADO",
    dataBloqueio: new Date()
  }
});
```
