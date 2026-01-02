# Correção do Erro 500 no Register

## Problema Identificado

O erro 500 no endpoint `/auth/register` está ocorrendo porque:

1. **Schema Prisma atualizado**: O `schema.prisma` foi atualizado com novos campos (cidade, bairro, endereco, numero, complemento, uf, cep, whatsapp, emailPublico, instagram, facebook, tiktok, site, linkedin).

2. **Migration não aplicada**: A migration que adiciona essas colunas ao banco de dados **não foi criada ou não foi aplicada no ambiente do Render**.

3. **Prisma Client desatualizado**: O Prisma Client pode estar desatualizado no ambiente do Render.

## Solução

### Passo 1: Criar a Migration Localmente

```bash
cd agendou_back
npx prisma migrate dev --name add_profissional_contact_location_fields
```

Isso vai criar uma nova migration SQL que adiciona as novas colunas.

### Passo 2: Aplicar a Migration no Render

No painel do Render, você tem duas opções:

#### Opção A: Build Command (Recomendado)

Configure o **Build Command** no Render para executar as migrations:

```bash
npm install && npx prisma generate && npx prisma migrate deploy
```

#### Opção B: SSH no Render (Alternativa)

Se o Render permitir SSH, conecte e execute:

```bash
cd agendou_back
npx prisma migrate deploy
npx prisma generate
```

### Passo 3: Verificar DATABASE_URL

Certifique-se de que a variável de ambiente `DATABASE_URL` está configurada corretamente no Render.

### Passo 4: Regenerar Prisma Client

Se necessário, force a regeneração do Prisma Client no Render:

```bash
npx prisma generate
```

## Melhorias no Código

O tratamento de erros foi melhorado no `AuthController.js` para mostrar mais detalhes em desenvolvimento:

- Logs mais detalhados no console
- Mensagens de erro mais específicas em ambiente de desenvolvimento
- Código de erro do Prisma incluído na resposta (em dev)

## Verificação

Após aplicar as migrations, teste novamente o registro. O erro deve desaparecer.

Se o erro persistir, verifique os logs do Render para ver a mensagem de erro específica do Prisma.
