# Plataforma de Jogos Educativos

## Descrição do Projeto

A Plataforma de Jogos Educativos permite **criar, jogar e compartilhar jogos interativos** baseados em **termos e definições**. Usuários podem se registrar como **jogadores** ou **criadores**, desenvolver jogos de forma dinâmica e acompanhar os resultados das partidas.

---

## Funcionalidades da Primeira Entrega

- Cadastro de usuários (jogadores e criadores)
- Login/autenticação via JWT
- Recuperação e alteração de senha via e-mail
- Criação de jogos: termo-definição, item-categoria, jogo da memória, jogo da sabedoria (quiz)
- Compartilhamento via código ou link
- Registro de resultados (pontuação, tempo, erros)

---

## Tecnologias

- Frontend: React.js + Vite
- Backend: Node.js + Express
- Banco de Dados: MongoDB (via Prisma)
- Autenticação: JWT
- E-mail: Nodemailer
- Estilização: CSS customizado

---

## Instalação e Execução

### Pré-requisitos

- Node.js (v18+)
- npm ou yarn
- Conta no MongoDB Atlas ou Mongo local

---

### Backend

1. Entre na pasta backend:

```bash
cd backend
Instale as dependências:

bash
Copiar
Editar
npm install
Crie o arquivo .env com o seguinte conteúdo:

env
Copiar
Editar
PORT=5000
DATABASE_URL="mongodb+srv://usuario:senha@cluster.mongodb.net/Plataforma_Games?retryWrites=true&w=majority&appName=Cluster0"
JWT_SECRET="seuSegredoJWT"
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
EMAIL_USER=seuemail@provedor.com
EMAIL_PASS=sua_senha_de_app_email
Gere os arquivos do Prisma:

bash
Copiar
Editar
npx prisma generate
Inicie o servidor backend:

bash
Copiar
Editar
node server.js
O backend estará disponível em http://localhost:5000.

Frontend
Entre na pasta frontend:

bash
Copiar
Editar
cd frontend
Instale as dependências:

bash
Copiar
Editar
npm install
Crie o arquivo .env para definir a API usada (local ou produção):

Para rodar localmente:

env
Copiar
Editar
VITE_API_URL=http://localhost:5000
Para rodar no ar (produção):

env
Copiar
Editar
VITE_API_URL=https://plataformagames.onrender.com
Importante: Sempre use no código React:

js
Copiar
Editar
fetch(`${import.meta.env.VITE_API_URL}/rota`)
para que a API correta seja chamada conforme o ambiente.

Inicie o frontend:

bash
Copiar
Editar
npm run dev
O frontend estará disponível em http://localhost:5173.

Como Testar
Para rodar localmente, inicie backend e frontend localmente, usando o .env com VITE_API_URL=http://localhost:5000.

Para testar no ar (produção), certifique-se de que o backend esteja deployado (ex: Render) e atualize o .env do frontend com VITE_API_URL=https://plataformagames.onrender.com.

No frontend, faça login, registre usuários e crie jogos para testar as funcionalidades.

Use os links e códigos gerados para acessar jogos diretamente.

Verifique o banco de dados para confirmar que os resultados são registrados.

Resumo dos Comandos
bash
Copiar
Editar
# Backend
cd backend
npm install
npx prisma generate
node server.js

# Frontend
cd frontend
npm install
npm run dev
```
