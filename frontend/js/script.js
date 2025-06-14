// frontend/js/script.js

const form = document.getElementById("formTarefa");
const descricaoInput = document.getElementById("descricao");
const tabelaTarefas = document.getElementById("tabelaTarefas");
const mensagemDiv = document.getElementById("mensagem");

const API_URL = "http://localhost:3000/api/tarefas"; // URL da sua API

// Função para exibir mensagens de feedback
function mostrarMensagem(texto, sucesso = true) {
    mensagemDiv.textContent = texto;
    mensagemDiv.className = sucesso ? "success" : "error";
    setTimeout(() => mensagemDiv.textContent = "", 3000); // Limpa a mensagem após 3 segundos
}

// Função para carregar e exibir as tarefas
async function carregarTarefas() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            // Se a resposta não for OK (ex: 404, 500), lança um erro
            throw new Error(`Erro HTTP! Status: ${response.status}`);
        }
        const tarefas = await response.json();
        tabelaTarefas.innerHTML = ""; // Limpa a tabela antes de adicionar

        if (tarefas.length === 0) {
            tabelaTarefas.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #666;">Nenhuma tarefa cadastrada.</td></tr>';
            return;
        }

        tarefas.forEach(tarefa => {
            const row = tabelaTarefas.insertRow();
            // Adiciona a classe 'tarefa-concluida' se o status for true
            row.className = tarefa.status ? 'tarefa-concluida' : '';

            // Formata a data para exibição no formato DD/MM/AAAA HH:MM
            const dataCriacao = new Date(tarefa.data_criacao);
            const dataCriacaoFormatada = dataCriacao.toLocaleDateString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            }) + ' ' + dataCriacao.toLocaleTimeString('pt-BR', {
                hour: '2-digit', minute: '2-digit'
            });

            // Usando template literals com `${}` para interpolar as variáveis
            row.innerHTML = `
                <td>${tarefa.id}</td>
                <td>${tarefa.descricao}</td>
                <td>${tarefa.status ? 'Concluída' : 'Pendente'}</td>
                <td>${dataCriacaoFormatada}</td>
                <td>
                    <button class="status-btn" data-id="${tarefa.id}" data-status="${tarefa.status}">
                        ${tarefa.status ? 'Desmarcar' : 'Concluir'}
                    </button>
                    <button class="delete-btn" data-id="${tarefa.id}">Remover</button>
                </td>
            `;

            // Adicionar event listeners aos botões de cada linha
            // Usamos querySelector dentro da linha (row) para garantir que pegamos o botão correto
            row.querySelector('.status-btn').addEventListener('click', toggleStatusTarefa);
            row.querySelector('.delete-btn').addEventListener('click', removerTarefa);
        });
    } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
        mostrarMensagem("Erro ao carregar tarefas. Verifique a conexão com o servidor ou a API.", false);
    }
}

// Event listener para o formulário de adicionar nova tarefa
form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Impede o recarregamento padrão da página
    const descricao = descricaoInput.value.trim(); // Obtém o valor do input e remove espaços em branco

    if (!descricao) {
        mostrarMensagem("A descrição da tarefa não pode ser vazia.", false);
        return; // Sai da função se a descrição estiver vazia
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST", // Método HTTP para criar um novo recurso
            headers: {
                "Content-Type": "application/json" // Indica que o corpo da requisição é JSON
            },
            body: JSON.stringify({ descricao }) // Converte o objeto JavaScript em string JSON
        });
        const data = await response.json(); // Pega a resposta da API (JSON)

        if (response.ok) { // Verifica se a requisição foi bem-sucedida (status 2xx)
            mostrarMensagem("Tarefa adicionada com sucesso!");
            descricaoInput.value = ""; // Limpa o campo de input
            carregarTarefas(); // Recarrega a lista de tarefas para mostrar a nova
        } else {
            // Se houver erro na resposta da API (ex: validação)
            mostrarMensagem(data.mensagem || "Erro ao adicionar tarefa.", false);
        }
    } catch (error) {
        console.error('Erro ao adicionar tarefa:', error);
        mostrarMensagem("Erro na conexão ao adicionar tarefa. Verifique o servidor.", false);
    }
});

// Função para alternar o status de uma tarefa (concluída/pendente)
async function toggleStatusTarefa(e) {
    const id = e.target.dataset.id; // Pega o ID da tarefa do atributo data-id do botão
    const currentStatus = e.target.dataset.status === 'true'; // Converte string "true"/"false" para boolean
    const newStatus = !currentStatus; // Inverte o status atual (true vira false, false vira true)

    if (confirm(`Deseja ${newStatus ? 'marcar' : 'desmarcar'} esta tarefa como concluída?`)) {
        try {
            const response = await fetch(`${API_URL}/${id}`, { // Requisição PUT para o endpoint específico
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: newStatus }) // Envia o novo status
            });
            const data = await response.json();

            if (response.ok) {
                mostrarMensagem(data.mensagem);
                carregarTarefas(); // Recarrega a lista para refletir a mudança
            } else {
                mostrarMensagem(data.mensagem || "Erro ao atualizar status.", false);
            }
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            mostrarMensagem("Erro na conexão ao atualizar status da tarefa. Verifique o servidor.", false);
        }
    }
}

// Função para remover uma tarefa
async function removerTarefa(e) {
    const id = e.target.dataset.id; // Pega o ID da tarefa do atributo data-id do botão
    if (confirm("Tem certeza que deseja remover esta tarefa?")) { // Confirmação antes de deletar
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE" // Método HTTP para deletar um recurso
            });
            const data = await response.json();

            if (response.ok) {
                mostrarMensagem(data.mensagem);
                carregarTarefas(); // Recarrega a lista após a remoção
            } else {
                mostrarMensagem(data.mensagem || "Erro ao remover tarefa.", false);
            }
        } catch (error) {
            console.error('Erro ao remover tarefa:', error);
            mostrarMensagem("Erro na conexão ao remover tarefa. Verifique o servidor.", false);
        }
    }
}

// Carregar tarefas quando a página é completamente carregada
// Isso garante que a lista de tarefas seja exibida assim que o usuário acessa a página
document.addEventListener("DOMContentLoaded", carregarTarefas);