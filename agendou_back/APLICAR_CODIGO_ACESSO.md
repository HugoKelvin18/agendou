# 🔐 Aplicar Modelo de Código de Acesso

## 📋 O que foi alterado:

1. **Schema do Prisma**: Adicionado modelo `CodigoAcesso` para gerenciar códigos de acesso
2. **AuthController**: Atualizado para validar códigos no banco de dados
3. **Seed**: Criado script para gerar códigos de acesso iniciais

## 🚀 Passos para aplicar:

### 1. Gerar o Prisma Client com o novo modelo
```bash
cd agendou_back
npx prisma generate
```

### 2. Criar e aplicar a migration
```bash
npx prisma migrate dev --name add_codigo_acesso
```

Ou se preferir aplicar diretamente sem migration (desenvolvimento):
```bash
npx prisma db push
```

### 3. Executar o seed para criar códigos de acesso iniciais
```bash
npm run seed
```

Isso criará dois códigos de acesso:
- `PROF2024` - Código padrão para profissionais
- `ADMIN123` - Código administrativo

## ✅ Verificar se funcionou:

### Verificar no banco:
```bash
npx prisma studio
```

Ou via SQL:
```sql
SELECT * FROM codigos_acesso;
```

### Testar cadastro de profissional:

1. No frontend, acesse a página de cadastro
2. Selecione "PROFISSIONAL" como role
3. Insira um dos códigos criados (ex: `PROF2024`)
4. Complete o cadastro

## 📝 Funcionalidades do modelo:

- ✅ **Código único**: Cada código é único no banco
- ✅ **Ativo/Inativo**: Pode desativar códigos sem deletar
- ✅ **Uso único**: Código marcado como usado após primeiro uso
- ✅ **Rastreamento**: Registra qual usuário usou o código e quando
- ✅ **Expiração opcional**: Pode definir data de expiração
- ✅ **Descrição**: Campo opcional para identificar o código

## 🔧 Criar novos códigos:

Você pode criar novos códigos de duas formas:

### 1. Via Prisma Studio (recomendado)
```bash
npx prisma studio
```

### 2. Via script customizado
Crie um arquivo `criar-codigo.js`:

```javascript
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

await prisma.codigoAcesso.create({
    data: {
        codigo: "SEU_CODIGO_AQUI",
        descricao: "Descrição do código",
        ativo: true,
        // expiraEm: new Date("2025-12-31") // opcional
    }
});

await prisma.$disconnect();
```

Execute:
```bash
node criar-codigo.js
```

## ⚠️ Importante:

- Códigos usados não podem ser reutilizados
- Códigos inativos não podem ser usados
- Códigos expirados (se definido) não podem ser usados
- Um código só pode ser usado por um profissional
