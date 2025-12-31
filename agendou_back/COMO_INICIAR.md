# 🚀 Como Iniciar o Servidor

## ✅ Verificações Rápidas

### 1. Verificar se o arquivo `.env` existe e está configurado

Certifique-se de que o arquivo `.env` na pasta `agendou_back` contém:
```env
DATABASE_URL=postgresql://usuario:senha@host:porta/banco
JWT_SECRET=sua_chave_secreta_aqui
PORT=3001
```

### 2. Verificar se o Prisma Client foi gerado

Execute:
```bash
cd agendou_back
npx prisma generate
```

### 3. Verificar conexão com o banco

Execute o script de teste:
```bash
node test-server.js
```

Se aparecer "✅ Todos os testes passaram!", o banco está OK.

## 🎯 Iniciar o Servidor

### Opção 1: Modo Desenvolvimento (com auto-reload)
```bash
cd agendou_back
npm run dev
```

### Opção 2: Modo Produção
```bash
cd agendou_back
npm run start
```

### Opção 3: Direto com tsx
```bash
cd agendou_back
npx tsx src/server.js
```

## ✅ Verificar se o Servidor Está Rodando

Abra seu navegador ou use curl/Postman para testar:

1. **Health Check:**
   ```
   http://localhost:3001/health
   ```
   Deve retornar: `{"status":"ok","service":"agendou-api"}`

2. **Teste de Banco:**
   ```
   http://localhost:3001/db-check
   ```
   Deve retornar: `{"ok":true,"message":"Conexão com o banco OK ✅"}`

3. **Rota Raiz:**
   ```
   http://localhost:3001/
   ```
   Deve retornar: `{"message":"API Agendou funcionando!"}`

## ❌ Problemas Comuns

### Erro: "Cannot find module '@prisma/client'"
**Solução:**
```bash
npm install
npx prisma generate
```

### Erro: "DATABASE_URL não encontrada"
**Solução:** Verifique se o arquivo `.env` existe e está na pasta `agendou_back`.

### Erro: "Error: P1001: Can't reach database server"
**Solução:** 
- Verifique se o PostgreSQL está rodando
- Verifique se a `DATABASE_URL` está correta
- Teste a conexão manualmente

### Servidor não inicia / porta já em uso
**Solução:**
1. Verifique se já há um processo rodando:
   ```bash
   # No PowerShell:
   Get-Process node -ErrorAction SilentlyContinue
   ```
2. Mude a porta no `.env`:
   ```env
   PORT=3002
   ```

### Erro ao importar controllers TypeScript
**Solução:** O projeto usa `tsx` para rodar TypeScript diretamente. Certifique-se de ter `tsx` instalado:
```bash
npm install -D tsx
```

## 📝 Logs Esperados

Quando o servidor inicia com sucesso, você deve ver:
```
✅ API rodando na porta 3001
```

Se houver erros, eles aparecerão no console.
