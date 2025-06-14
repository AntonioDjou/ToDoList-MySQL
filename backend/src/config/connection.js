// backend/src/config/connection.js
const mysql = require('mysql2');
require('dotenv').config(); // Carrega as variáveis de ambiente do .env

const conexao = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

conexao.connect(err => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err.stack);
        return;
    }
    console.log('Conectado ao MySQL como id ' + conexao.threadId);
});

module.exports = conexao;