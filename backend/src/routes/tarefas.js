// backend/src/routes/tarefas.js
const express = require('express');
const router = express.Router();
const db = require('../config/connection'); // Importa a conexão com o banco

// POST /tarefas - Cadastrar uma nova tarefa
router.post('/', (req, res) => {
    const { descricao } = req.body;
    if (!descricao) {
        return res.status(400).json({ mensagem: "A descrição da tarefa é obrigatória." });
    }
    const sql = 'INSERT INTO tarefas (descricao) VALUES (?)';
    db.query(sql, [descricao], (err, result) => {
        if (err) {
            console.error('Erro ao cadastrar tarefa:', err);
            return res.status(500).json({ erro: 'Erro interno do servidor ao cadastrar tarefa.' });
        }
        res.status(201).json({
            id: result.insertId,
            descricao,
            status: false, // Default é false
            data_criacao: new Date().toISOString().slice(0, 19).replace('T', ' ') // Formato MySQL DATETIME
        });
    });
});

// GET /tarefas - Listar todas as tarefas
router.get('/', (req, res) => {
    // Ordenar por data_criacao para ver as mais recentes primeiro
    const sql = 'SELECT id, descricao, status, DATE_FORMAT(data_criacao, "%Y-%m-%d %H:%i:%s") as data_criacao FROM tarefas ORDER BY data_criacao DESC';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao listar tarefas:', err);
            return res.status(500).json({ erro: 'Erro interno do servidor ao listar tarefas.' });
        }
        res.json(results);
    });
});

// PUT /tarefas/:id - Alterar status (concluir/desmarcar tarefa)
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // Espera-se { "status": true } ou { "status": false }

    // Validação simples: o status deve ser um booleano
    if (typeof status !== 'boolean') {
        return res.status(400).json({ mensagem: "O status deve ser um valor booleano (true/false)." });
    }

    const sql = 'UPDATE tarefas SET status = ? WHERE id = ?';
    db.query(sql, [status, id], (err, result) => {
        if (err) {
            console.error('Erro ao atualizar status da tarefa:', err);
            return res.status(500).json({ erro: 'Erro interno do servidor ao atualizar status da tarefa.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ mensagem: 'Tarefa não encontrada.' });
        }
        res.json({ mensagem: 'Status da tarefa atualizado com sucesso.' });
    });
});

// DELETE /tarefas/:id - Remover uma tarefa
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM tarefas WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Erro ao deletar tarefa:', err);
            return res.status(500).json({ erro: 'Erro interno do servidor ao deletar tarefa.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ mensagem: 'Tarefa não encontrada.' });
        }
        res.json({ mensagem: 'Tarefa deletada com sucesso.' });
    });
});

module.exports = router;