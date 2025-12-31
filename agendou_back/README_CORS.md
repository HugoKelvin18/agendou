# 🔐 Configuração de CORS

## ⚙️ Variável de Ambiente: `CORS_ORIGINS`

O backend usa a variável de ambiente `CORS_ORIGINS` para definir quais origens podem acessar a API.

### 📝 Formato

URLs separadas por vírgula:
```
CORS_ORIGINS=https://agendou-2026.vercel.app,https://agendou-seven.vercel.app,https://meu-dominio.vercel.app
```

### 🔧 Como Configurar

#### Desenvolvimento Local
Deixe `CORS_ORIGINS` vazia ou não defina. O sistema usará fallback:
- `http://localhost:5173`
- `http://127.0.0.1:5173`
- URLs do Vercel padrão

#### Produção (Render, Railway, etc.)
1. No painel do seu serviço de hospedagem (Render/Railway)
2. Vá em "Environment Variables" ou "Config"
3. Adicione:
   ```
   CORS_ORIGINS=https://seu-frontend.vercel.app,https://outro-dominio.vercel.app
   ```
4. Substitua `seu-frontend.vercel.app` pela URL real do seu frontend no Vercel
5. Se tiver múltiplos domínios, separe por vírgula

### ✅ Verificação

Após configurar, ao iniciar o servidor você verá:
```
✅ CORS configurado com origens do ambiente: https://seu-frontend.vercel.app
```

### ⚠️ Importante

- Sempre inclua `https://` nas URLs
- Não inclua `/` no final das URLs
- Se mudar o domínio do frontend, atualize `CORS_ORIGINS`
- Cada domínio deve estar separado por vírgula

### 🧪 Teste

Para testar se o CORS está funcionando:
1. Acesse seu frontend em produção
2. Tente fazer login
3. Se funcionar, CORS está OK
4. Se der erro de CORS no console, verifique se a URL do frontend está em `CORS_ORIGINS`
