# TrabalhoW

# ddd

# ddd

# Plataforma de Jogos Educativos

## Descrição do Projeto

Esta plataforma permite criar, compartilhar e jogar diferentes tipos de jogos educativos baseados em termos e definições. Usuários podem se cadastrar como jogadores ou criadores, gerar jogos automaticamente a partir de conteúdos cadastrados, compartilhar jogos por link ou código, e registrar resultados de cada partida.

## Funcionalidades da Primeira Entrega

- **Gerenciamento de Usuários (CRUD)**

  - Cadastro de usuários (jogador ou criador)
  - Login/autenticação (JWT)
  - Recuperação e alteração de senha

- **Cadastro de Conteúdo**

  - Cadastro de termos e definições (painel do criador)

- **Geração dos Jogos**

  - Jogo da Memória (associação termo <-> definição)
  - Jogo de Associação (associação direta termo-definição)
  - Jogo de Quiz (termo + múltiplas alternativas de definição)

- **Compartilhamento dos Jogos**

  - Cada jogo criado gera um código de acesso único
  - Jogos podem ser acessados por código ou link compartilhável

- **Registro de Resultados**
  - Pontuação, acertos, erros, tempo e identificação do jogador são registrados no banco de dados

## Tecnologias Utilizadas

- **Frontend:** React.js (Vite)
- **Backend:** Node.js + Express
- **Banco de Dados:** MongoDB (via Prisma ORM)
- **Autenticação:** JWT
- **Estilização:** CSS customizado

## Instalação e Execução

### Pré-requisitos

- Node.js (v18+ recomendado)
- npm ou yarn
- MongoDB rodando localmente ou em nuvem

### Backend

1. Acesse a pasta do backend:

   ```bash
   cd backend

   Instale as dependências:
   npm install
   ```

Configure o arquivo .env:

PORT=5000
DATABASE_URL="mongodb+srv://admin:ad123@cluster0.dotctfh.mongodb.net/Plataforma_Games?retryWrites=true&w=majority&appName=Cluster0"
JWT_SECRET="super123"
FRONTEND_URL=http://localhost:5174
BACKEND_URL=http://localhost:5000
EMAIL_USER=silvaassis@acad.ifma.edu.br
EMAIL_PASS=dwfvylrhztiknbiq

Rode as migrations do Prisma
npx prisma generate

Inicie o backend:
node server.js

O backend estará disponível em http://localhost:5000.

Frontend

Acesse a pasta do frontend:
cd frontend

Instale as dependências:
npm install

Configure o arquivo .env:
VITE_API_URL=http://localhost:5000

Inicie o frontend:
npm run dev

O frontend estará disponível em http://localhost:5173.

Banco de Dados

O projeto utiliza MongoDB.
Certifique-se de que o serviço está rodando e que a string de conexão no .env do backend está correta.
Não é necessário script de criação de tabelas, pois o Prisma gerencia os modelos automaticamente.

Observações
Para acessar jogos por código, utilize a tela de busca por código no frontend.
O projeto já registra resultados de cada partida automaticamente.
Para dúvidas ou problemas, consulte os comentários no código ou abra uma issue no repositório.

Pronto!

Basta preencher com o nome do seu banco e ajustar detalhes específicos do seu projeto, se necessário.
Esse README cobre tudo que a especificação da entrega exige! O frontend estará disponível em http://localhost:5173.
