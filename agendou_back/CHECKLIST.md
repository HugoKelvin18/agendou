# Checklist de Configuração - Agendou Backend

## ✅ Problemas Corrigidos

1. **Extensões de importação**: Todas as rotas agora importam os controllers com extensão `.js` (padrão TypeScript)
2. **Estrutura de arquivos**: Backend limpo, apenas arquivos necessários

## 📋 Próximos Passos para Finalizar

### 1. Criar arquivo `.env` (OBRIGATÓRIO)

Na pasta `agendou_back/`, crie um arquivo `.env` com:

```env
# URL do banco de dados PostgreSQL
DATABASE_URL="postgresql://usuario:senha@localhost:5432/agendou"
# ou se estiver usando Neon/outro serviço:
# DATABASE_URL="postgresql://usuario:senha@host:5432/agendou?sslmode=require"

# Secret para JWT (use uma string aleatória e segura)
JWT_SECRET="sua-chave-secreta-aqui-mude-esta-string"

# Porta do servidor (opcional, padrão é 3001)
PORT=3001

# Código de acesso para cadastro de profissionais (opcional)
CODIGO_ACESSO_PROFISSIONAL="codigo123"
```

### 2. Instalar dependências (se ainda não instalou)

```bash
cd agendou_back
npm install
```

### 3. Gerar Prisma Client

```bash
cd agendou_back
npx prisma generate
```

### 4. Criar banco de dados e executar migrations

**Opção A - Se já tem o banco criado:**
```bash
npx prisma migrate dev --name init
```

**Opção B - Se precisa criar o banco:**
1. Crie o banco de dados PostgreSQL
2. Atualize a `DATABASE_URL` no `.env`
3. Execute: `npx prisma migrate dev --name init`

### 5. Testar o servidor

```bash
npm run dev
```

O servidor deve iniciar na porta 3001 (ou a porta definida no `.env`).

### 6. Testar endpoints

Abra o navegador ou use Postman/Insomnia:

- **Health check**: `http://localhost:3001/health`
- **DB check**: `http://localhost:3001/db-check`
- **API root**: `http://localhost:3001/`

## 🔍 Verificação de Erros Comuns

### Erro: "Cannot find module '@prisma/client'"
**Solução**: Execute `npx prisma generate`

### Erro: "P1001: Can't reach database server"
**Solução**: Verifique a `DATABASE_URL` no `.env` e se o banco está rodando

### Erro: "JWT_SECRET is not defined"
**Solução**: Adicione `JWT_SECRET` no arquivo `.env`

### Erro: "SyntaxError: Cannot use import statement outside a module"
**Solução**: O arquivo `package.json` já tem `"type": "module"`, então deve funcionar. Certifique-se de usar `tsx` ou `node` com suporte a ES modules.

## 📝 Arquivos Importantes

- `src/server.js` - Servidor principal
- `prisma/schema.prisma` - Schema do banco
- `.env` - Variáveis de ambiente (NÃO versionar!)
- `src/middleware/auth.js` - Middleware de autenticação
- `src/controllers/` - Controllers da API
- `src/routes/` - Rotas da API

## 🚀 Quando tudo estiver funcionando

Você poderá:
- ✅ Fazer login/registro
- ✅ Criar e gerenciar serviços
- ✅ Gerenciar disponibilidades
- ✅ Criar agendamentos
- ✅ Ver notificações
- ✅ Ver faturamento
