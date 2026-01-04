# Configuração do Banco de Dados

## Como Funciona

O sistema usa **PostgreSQL** e pode ser configurado para usar:
- **Banco local** (desenvolvimento)
- **Neon Database** (produção no Render)

## Configuração

### 1. Variável de Ambiente `DATABASE_URL`

O Prisma lê a conexão do banco através da variável de ambiente `DATABASE_URL`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. Formato da DATABASE_URL

```
postgresql://usuario:senha@host:porta/database?sslmode=require
```

**Exemplo Neon:**
```
postgresql://user:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Exemplo Local:**
```
postgresql://postgres:senha@localhost:5432/agendou
```

## Configuração no Render

### Passo 1: Adicionar Variável de Ambiente

1. Acesse o serviço no Render
2. Vá em **Environment**
3. Adicione a variável:
   - **Key**: `DATABASE_URL`
   - **Value**: A string de conexão do seu banco Neon (ou outro PostgreSQL)

### Passo 2: Verificar Build Command

O Build Command deve ser:
```bash
npm install && npm run deploy
```

Ou, se preferir:
```bash
npm install && npx prisma generate && npm run deploy
```

### Passo 3: Verificar Start Command

O Start Command deve ser:
```bash
npm start
```

### Passo 4: Verificar Root Directory

O **Root Directory** deve estar configurado como:
```
agendou_back
```

## Verificação

### Testar Conexão Localmente

```bash
cd agendou_back
# Certifique-se de que o .env tem DATABASE_URL
npx prisma db pull  # Testa conexão
```

### Testar no Render

1. Acesse o **Shell** do serviço no Render
2. Execute:
```bash
cd agendou_back
echo $DATABASE_URL  # Deve mostrar a string de conexão
npx prisma db pull  # Testa conexão
```

## Problemas Comuns

### Erro: "DATABASE_URL não está configurada"

**Causa**: A variável não está definida no Render ou no .env local.

**Solução**:
1. Verifique se `DATABASE_URL` está nas Environment Variables do Render
2. Verifique se o arquivo `.env` local existe e tem a variável

### Erro: "Connection refused" ou "Timeout"

**Causa**: String de conexão incorreta ou banco inacessível.

**Solução**:
1. Verifique a string de conexão no Neon
2. Certifique-se de que o banco está ativo
3. Verifique se o SSL está configurado (`?sslmode=require`)

### Erro: "Migration failed"

**Causa**: Migration anterior falhou e bloqueou as próximas.

**Solução**:
1. Execute manualmente no Shell do Render:
```bash
cd agendou_back
npm run fix-migration-pendente
npx prisma migrate deploy
```

## Scripts Disponíveis

- `npm run deploy` - Deploy completo (gera client, corrige migrations, aplica migrations)
- `npm run fix-migration-pendente` - Corrige migration específica que está falhando
- `npm run prisma:migrate` - Aplica migrations apenas
- `npm run prisma:generate` - Gera Prisma Client apenas
