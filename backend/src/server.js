// backend/src/server.js
const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path'); // Módulo 'path' para lidar com caminhos de arquivo
require('dotenv').config(); // Carrega as variáveis de ambiente

const tarefasRoutes = require('./routes/tarefas'); // Importa as rotas de tarefas

// Middleware para habilitar CORS (Cross-Origin Resource Sharing)
// Permite que o frontend (rodando em uma porta diferente) acesse a API
app.use(cors());

// Middleware para interpretar JSON do corpo das requisições
app.use(express.json());

// Middleware para servir arquivos estáticos do frontend
// Isso fará com que arquivos como index.html, style.css, script.js sejam acessíveis
// ao navegar para a URL base do servidor (ex: http://localhost:3000)
app.use(express.static(path.join(__dirname, '../../frontend'))); // Volta duas pastas para chegar em /frontend

// Rotas da API
app.use('/api/tarefas', tarefasRoutes);

// Definindo a porta do servidor, usando a variável de ambiente ou 3000 como padrão
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse o frontend em: http://localhost:${PORT}/`);
});