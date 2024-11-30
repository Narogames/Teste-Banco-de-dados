COMANDOS SQL:

CREATE TABLE IF NOT EXISTS funcionarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100),
    setor VARCHAR(100),
    cor VARCHAR(50)
);

Comandos dependência:
npm install

Funcionar:
node server.js


