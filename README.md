# PET_VIDA

Este projeto contém uma aplicação web React/Vite com backend em Node.js que se integra ao banco de dados MySQL `pet_vida`.

Agora o sistema também funciona como um painel financeiro, permitindo:

- visualizar o dashboard financeiro,
- consultar agenda, faturamento, animais e inadimplentes,
- adicionar consultas e pagamentos diretamente pelo frontend,
- inicializar o banco com o schema e os seeds existentes.

## Arquivos incluídos

- `pet_vida_schema.sql`: script SQL para criar o banco de dados, tabelas, views e dados de exemplo.
- `server.js`: backend Express que expõe APIs REST para consultar relatórios, inserir novos registros e inicializar o banco.
- `src/`: frontend React que consome as APIs e fornece um sistema financeiro visual.
- `.env.example`: modelo de configuração de conexão MySQL.

## Requisitos

- Node.js 18+ e npm
- MySQL em execução

## Instalação

```bash
npm install
```

Copie `.env.example` para `.env` e ajuste as credenciais se necessário:

```bash
copy .env.example .env
```

## Como usar

1. Inicialize o banco de dados com o schema SQL usando o endpoint de inicialização:

```bash
npm run server
```

No navegador ou em outra aba do terminal, use o endpoint:

```bash
curl -X POST http://localhost:4000/api/init-db
```

2. Abra a interface React em desenvolvimento:

```bash
npm run dev
```

3. Acesse `http://localhost:5173` e selecione os relatórios:

- Agenda de hoje
- Faturamento mensal
- Animais detalhados
- Inadimplentes

Também é possível executar em modo de desenvolvimento com frontend e backend juntos:

```bash
npm run dev
```

## Scripts disponíveis

- `npm run client`: inicia o frontend Vite.
- `npm run server`: inicia o backend Express.
- `npm run dev`: inicia frontend e backend simultaneamente.
- `npm run build`: gera o build de produção do frontend.
- `npm run start`: inicia apenas o backend.

## Observação

O backend usa `pet_vida_schema.sql` para criar o banco de dados e as views. O frontend consome diretamente as rotas REST baseadas no schema enviado.
