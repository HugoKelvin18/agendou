# Agendou

Sistema de agendamento com dois perfis (cliente e profissional), notificacoes e controle de servicos, disponibilidade e faturamento.

## Visao geral
Agendou e um sistema fullstack para agendamento de servicos. O cliente pode buscar servicos e agendar horarios; o profissional gerencia servicos, disponibilidade, agenda e faturamento.

## Funcionalidades
- Autenticacao com JWT
- Perfis: CLIENTE e PROFISSIONAL
- Cadastro e gerenciamento de servicos
- Agenda do profissional (status: pendente, em andamento, concluido, cancelado)
- Disponibilidades e calculo de horarios disponiveis
- Notificacoes (agendamentos, cancelamentos e mensagens)
- Mensagem publica do profissional para clientes
- Faturamento por periodo

## Tecnologias
**Frontend**
- React 19 + Vite
- TypeScript
- Tailwind CSS
- Axios
- React Router
- Lucide Icons
- Recharts

**Backend**
- Node.js + Express 5
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- Bcrypt

## Estrutura do repositorio
- agendou_front/ (frontend)
- agendou_back/ (backend)

## Requisitos
- Node.js 18+
- PostgreSQL

## Configuracao
### Backend
1) Acesse a pasta:
   - `cd agendou_back`
2) Instale as dependencias:
   - `npm install`
3) Crie um `.env` com as variaveis:
   - `DATABASE_URL=postgresql://usuario:senha@localhost:5432/agendou`
   - `JWT_SECRET=sua_chave`
   - `PORT=3333` (opcional)
4) Rode as migrations:
   - `npx prisma migrate dev`
5) (Opcional) Gerar codigo de acesso inicial para profissional:
   - Edite `agendou_back/prisma/seed.ts`
   - Execute `npx tsx prisma/seed.ts`
6) Inicie o servidor:
   - `npm run dev`

### Frontend
1) Acesse a pasta:
   - `cd agendou_front`
2) Instale as dependencias:
   - `npm install`
3) (Opcional) Configure o backend:
   - `VITE_BACKEND_URL=http://localhost:3333`
   - ou `VITE_BACKEND_PORT=3333`
4) Inicie o frontend:
   - `npm run dev`

## Acesso profissional (codigo de acesso)
O cadastro de profissional exige um codigo de acesso valido (tabela `codigoAcesso`). Voce pode gerar um codigo via `prisma/seed.ts`.

## Scripts principais
**Backend (agendou_back)**
- `npm run dev` (tsx watch)
- `npm run start`

**Frontend (agendou_front)**
- `npm run dev`
- `npm run build`
- `npm run preview`

## Rotas principais (backend)
- `GET /` (healthcheck)
- `POST /auth/register`
- `POST /auth/login`
- `GET /servicos`
- `GET /agendamentos`
- `GET /usuarios`
- `GET /disponibilidades`
- `GET /horarios-disponiveis`
- `GET /notificacoes`

## Observacoes
- `.env` nao deve ser versionado.
- As notificacoes atuais sao carregadas no header e organizadas por tipo.

## Publicar no GitHub
1) Inicialize o repositorio na raiz do projeto (pasta Agendou):
   - `git init`
2) Verifique se `node_modules` e `.env` estao ignorados.
3) Adicione os arquivos:
   - `git add .`
4) Crie o primeiro commit:
   - `git commit -m "Initial commit"`
5) Crie o repo no GitHub e adicione o remoto:
   - `git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git`
6) Envie:
   - `git branch -M main`
   - `git push -u origin main`
