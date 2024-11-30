const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('pg');
const path = require('path');

const app = express();
const port = 3000;

// Conectar ao PostgreSQL
const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',  // Substitua pelo seu usuário
    password: 'postgres',  // Substitua pela sua senha
    database: 'Teste'  // Substitua pelo nome do seu banco
});

client.connect()
    .then(() => console.log('Conectado ao banco de dados PostgreSQL'))
    .catch(err => console.error('Erro de conexão:', err));

// Middleware para processar dados de formulário (req.body)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve arquivos estáticos da pasta 'public' (se houver arquivos estáticos)
app.use(express.static(path.join(__dirname, 'public')));

// Configura o motor de templates EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));  // Define a pasta para os arquivos EJS

// Rota inicial para mostrar o formulário de cadastro
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'formulario.html'));
});

// Rota para exibir a página de sucesso após o cadastro
app.get('/pagina2', (req, res) => {
    res.sendFile(path.join(__dirname, 'pagina2.html'));
});

// Rota para cadastrar um novo funcionário
app.post('/cadastrar', (req, res) => {
    const { nome, setor, cor } = req.body;

    if (!nome || !setor || !cor) {
        return res.status(400).send('Todos os campos são obrigatórios!');
    }

    const query = 'INSERT INTO funcionarios (nome, setor, cor) VALUES ($1, $2, $3) RETURNING id';

    client.query(query, [nome, setor, cor])
        .then(result => {
            const id = result.rows[0].id; // Retorna o ID do novo funcionário
            // Redireciona para a página de sucesso, passando o ID como parâmetro
            res.redirect(`/pagina2?id=${id}`);
        })
        .catch(err => {
            console.error('Erro ao cadastrar:', err);
            res.status(500).send('Erro ao cadastrar os dados.');
        });
});

// Rota para exibir os detalhes do funcionário em HTML (usando EJS)
app.get('/detalhes', (req, res) => {
    const id = req.query.id;

    if (!id) {
        return res.status(400).send('ID do funcionário não fornecido.');
    }

    // Consulta para recuperar as informações do funcionário
    const query = 'SELECT nome, setor, cor FROM funcionarios WHERE id = $1';
    client.query(query, [id])
        .then(result => {
            if (result.rows.length > 0) {
                const funcionario = result.rows[0];

                // Renderiza a página detalhes.ejs com os dados do funcionário
                res.render('detalhes', {
                    nome: funcionario.nome,
                    setor: funcionario.setor,
                    cor: funcionario.cor
                });
            } else {
                res.status(404).send('Funcionário não encontrado.');
            }
        })
        .catch(err => {
            console.error('Erro ao buscar detalhes:', err);
            res.status(500).send('Erro ao buscar os dados do funcionário.');
        });
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
