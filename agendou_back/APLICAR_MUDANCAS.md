# Guia para Aplicar Mudanças - Sistema Admin e Billing

## 📋 Passo a Passo

### 1. Aplicar Migrations no Banco de Dados

Execute as migrations para adicionar os campos de billing e suporte a admin:

```bash
cd agendou_back
npx prisma migrate deploy
```

Ou para desenvolvimento (cria migration_lock.toml):

```bash
npx prisma migrate dev
```

**Migrations que serão aplicadas:**
- `20250116000000_add_billing_fields` - Adiciona campos de billing ao modelo Business
- `20250116000001_add_admin_role` - Adiciona role ADMIN e torna businessId nullable

### 2. Gerar Prisma Client

Após aplicar as migrations, gere o Prisma Client atualizado:

```bash
npx prisma generate
```

### 3. Inicializar Sistema Admin

Execute o script de inicialização para criar o business admin-system e código de acesso:

```bash
npm run init-admin
```

**O que o script faz:**
- Cria business "admin-system" (se não existir)
- Cria código de acesso padrão: `ADMIN2026`
- Exibe resumo das informações criadas

### 4. Criar Primeiro Admin

#### Opção A: Via Frontend (Recomendado)

1. Acesse a página de registro: `/register`
2. Preencha os dados:
   - Nome: Seu nome
   - Email: Seu email
   - Senha: Sua senha
   - Role: **ADMIN**
   - Código de Acesso: **ADMIN2026** (ou o código criado pelo script)
3. Complete o cadastro
4. Faça login e será redirecionado para `/admin/dashboard`

#### Opção B: Via API (Postman/Insomnia)

```bash
POST /auth/register
Content-Type: application/json

{
  "nome": "Admin Principal",
  "email": "admin@agendou.com",
  "senha": "senha123",
  "role": "ADMIN",
  "codigoAcesso": "ADMIN2026"
}
```

### 5. Verificar Funcionamento

1. **Login como Admin:**
   - Acesse `/login`
   - Use as credenciais do admin criado
   - Deve redirecionar para `/admin/dashboard`

2. **Acessar Painel Admin:**
   - Dashboard deve mostrar lista de businesses
   - Deve exibir estatísticas (total, ativos, bloqueados, etc.)

3. **Testar Rotas Admin:**
   ```bash
   GET /admin/businesses - Listar businesses
   GET /admin/businesses/:id - Detalhes de um business
   ```

## 🔧 Troubleshooting

### Erro: "Migration failed"

Se a migration falhar, verifique:
1. Se o banco está acessível
2. Se as migrations anteriores foram aplicadas
3. Se há conflitos de schema

**Solução:**
```bash
# Verificar status das migrations
npx prisma migrate status

# Resetar migrations (CUIDADO: apaga dados)
npx prisma migrate reset

# Aplicar novamente
npx prisma migrate deploy
```

### Erro: "Enum Role não tem valor ADMIN"

Se o enum não foi atualizado:
```sql
-- Execute manualmente no banco
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'ADMIN';
```

### Erro: "businessId não pode ser null"

Verifique se a migration foi aplicada:
```sql
-- Verificar se coluna permite null
SELECT column_name, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'usuarios' AND column_name = 'businessId';
```

### Erro: "Código de acesso inválido"

1. Verifique se o business "admin-system" existe:
   ```sql
   SELECT * FROM businesses WHERE slug = 'admin-system';
   ```

2. Verifique se o código existe:
   ```sql
   SELECT * FROM codigos_acesso 
   WHERE businessId = (SELECT id FROM businesses WHERE slug = 'admin-system');
   ```

3. Execute novamente o script:
   ```bash
   npm run init-admin
   ```

## 📝 Checklist de Verificação

Após aplicar todas as mudanças, verifique:

- [ ] Migrations aplicadas com sucesso
- [ ] Prisma Client gerado
- [ ] Business "admin-system" criado
- [ ] Código de acesso admin criado
- [ ] Primeiro admin cadastrado
- [ ] Login como admin funciona
- [ ] Dashboard admin acessível
- [ ] Rotas `/admin/*` funcionando
- [ ] Listagem de businesses funcionando

## 🚀 Próximos Passos (Opcional)

### Melhorias Futuras

1. **Página de Gerenciamento de Códigos Admin**
   - Listar códigos existentes
   - Criar novos códigos
   - Desativar códigos

2. **Formulários de Ação no Dashboard**
   - Formulário para registrar pagamento
   - Formulário para alterar plano
   - Formulário para alterar limites

3. **Gráficos e Métricas**
   - Gráfico de businesses por status
   - Gráfico de crescimento de usuários
   - Métricas de uso por business

4. **Notificações Admin**
   - Alertas de businesses próximos ao vencimento
   - Alertas de businesses bloqueados
   - Relatório semanal de inadimplência

## 📞 Suporte

Se encontrar problemas, verifique:
1. Logs do servidor (`console.log` no backend)
2. Console do navegador (F12)
3. Network tab (requisições HTTP)
4. Banco de dados (queries diretas)
