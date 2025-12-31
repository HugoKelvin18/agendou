# 🔗 Configuração da URL do Backend

## ⚙️ Variável de Ambiente: `VITE_BACKEND_URL`

O frontend precisa saber onde está o backend. Use a variável `VITE_BACKEND_URL`.

### 📝 Formato

URL completa do backend (com `http://` ou `https://`):
```
VITE_BACKEND_URL=https://seu-backend.onrender.com
```

### 🔧 Como Configurar

#### Desenvolvimento Local

**Opção 1: Arquivo `.env` (recomendado)**
1. Crie um arquivo `.env` na pasta `agendou_front`
2. Adicione:
   ```
   VITE_BACKEND_URL=http://localhost:3001
   ```
3. Reinicie o servidor de desenvolvimento

**Opção 2: Sem `.env`**
- Se não definir, o sistema usará `http://localhost:3001` automaticamente
- ⚠️ **IMPORTANTE**: Isso só funciona no mesmo computador
- Para testar em outros aparelhos (celular na mesma rede), use o IP do computador:
  ```
  VITE_BACKEND_URL=http://192.168.1.100:3001
  ```
  (substitua pelo IP real do seu computador)

#### Produção (Vercel)

1. No painel do Vercel, vá em seu projeto
2. Vá em **Settings** → **Environment Variables**
3. Adicione uma nova variável:
   - **Name**: `VITE_BACKEND_URL`
   - **Value**: URL pública do seu backend (ex: `https://seu-backend.onrender.com`)
   - **Environment**: Production (e Preview se quiser)
4. Salve e faça redeploy

### ✅ Verificação

Após configurar:
1. Em desenvolvimento, você verá no console:
   ```
   🔗 Backend URL configurada: http://localhost:3001
   ```
2. Em produção, verifique o console do navegador após build

### ⚠️ Problemas Comuns

#### "VITE_BACKEND_URL não está definida"
- **Desenvolvimento local**: Normal, o sistema usa fallback `localhost:3001`
- **Produção**: Você DEVE definir `VITE_BACKEND_URL` no Vercel

#### "Não foi possível conectar ao servidor"
- Verifique se o backend está rodando
- Verifique se a URL está correta
- Em produção, verifique se o backend está online (Render/Railway)

#### Funciona no computador mas não no celular
- Use o IP do computador em vez de `localhost`
- Ou configure `VITE_BACKEND_URL` apontando para o backend público

### 🔍 Descobrir o IP do Computador

**Windows:**
```powershell
ipconfig
```
Procure por "IPv4 Address" (ex: 192.168.1.100)

**Mac/Linux:**
```bash
ifconfig
# ou
ip addr
```

Use esse IP na `VITE_BACKEND_URL` para testar em outros aparelhos da mesma rede.

### 📋 Checklist para Deploy

- [ ] Backend deployado e rodando (ex: Render)
- [ ] `VITE_BACKEND_URL` definida no Vercel apontando para o backend público
- [ ] `CORS_ORIGINS` no backend inclui a URL do frontend no Vercel
- [ ] Testado login/registro em produção
