# Configuração de Fallback para SPA (Single Page Application)

## Problema

Quando você acessa uma rota direta em uma SPA (ex: `http://seu-dominio.com/register`), o servidor tenta buscar um arquivo físico `/register`, que não existe. Isso resulta em um erro 404.

## Solução

O servidor precisa ser configurado para **sempre servir o `index.html`** em qualquer rota, permitindo que o React Router gerencie o roteamento no lado do cliente.

## Configurações por Plataforma

### ✅ Vercel (Recomendado)

Já está configurado com `vercel.json` na raiz do projeto frontend.

O arquivo `vercel.json` faz o rewrite de todas as rotas para `/index.html`.

**Deploy na Vercel:**
1. Conecte seu repositório GitHub na Vercel
2. Configure o diretório raiz como `agendou_front`
3. O arquivo `vercel.json` será automaticamente aplicado

### ✅ Netlify

Já está configurado com `netlify.toml` e `public/_redirects`.

**Deploy na Netlify:**
1. Conecte seu repositório GitHub na Netlify
2. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Os arquivos `netlify.toml` e `public/_redirects` serão aplicados automaticamente

### Outros Servidores

#### Apache (.htaccess)

Crie um arquivo `.htaccess` na pasta `dist` após o build:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

#### Nginx

Adicione no seu arquivo de configuração do Nginx:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

#### Node.js/Express (servidor customizado)

```javascript
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
```

## Validação

### Desenvolvimento (Vite)

No desenvolvimento, o Vite já configura isso automaticamente. Teste:

```bash
cd agendou_front
npm run dev
```

Acesse: `http://localhost:5173/register` - deve funcionar ✅

### Produção

Após fazer deploy, teste acessando diretamente uma rota:

- ✅ `https://seu-dominio.com/register` - deve carregar a página de registro
- ✅ `https://seu-dominio.com/cliente/dashboard` - deve carregar o dashboard
- ❌ Se der 404, a configuração de fallback não está funcionando

## Importante

⚠️ **O backend (server.js) NÃO serve o frontend**

- Backend: `http://IP:3001` - API REST apenas
- Frontend: `http://IP:5173` (dev) ou URL da hospedagem (produção)

Nunca acesse rotas do frontend através da porta do backend!
