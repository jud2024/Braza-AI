let chats = [];
let chatAtual = { mensagens: [], assunto: "Sem assunto" };

function enviarMensagem() {
    const input = document.getElementById("mensagem");
    const texto = input.value;
    if (!texto.trim()) return;

    chatAtual.mensagens.push({ remetente: "Você", texto });
    renderizarChat();

    if (!chatAtual.iniciado) {
        detectarAssunto(texto).then(() => {
            chatAtual.iniciado = true;
            puter.ai.chat(texto, { model: "gpt-4o" }).then(resposta => {
                chatAtual.mensagens.push({ remetente: "GPT-4o", texto: resposta.text });
                renderizarChat();
                salvarChat();
            });
        });
    } else {
        puter.ai.chat(texto, { model: "gpt-4o" }).then(resposta => {
            chatAtual.mensagens.push({ remetente: "GPT-4o", texto: resposta.text });
            renderizarChat();
            salvarChat();
        });
    }

    input.value = "";
}

function detectarAssunto(mensagemInicial) {
    const promptAssunto = `Resuma em 3 palavras o assunto desta mensagem: "${mensagemInicial}". Apenas o assunto, sem explicação.`;
    return puter.ai.chat(promptAssunto, { model: "gpt-4o" })
        .then(resposta => {
            const assuntoDetectado = resposta.text.trim();
            chatAtual.assunto = assuntoDetectado;
            if (!chats.includes(chatAtual)) {
                chats.push({ ...chatAtual });
            }
            renderizarHistorico();
        });
}

function renderizarChat() {
    const chatDiv = document.getElementById("chat");
    chatDiv.innerHTML = chatAtual.mensagens.map(m => `<b>${m.remetente}:</b> ${m.texto}`).join("<br>");
}

function renderizarHistorico() {
    const historicoDiv = document.getElementById("historico");
    historicoDiv.innerHTML = chats.map((c, i) =>
        `<button onclick="carregarChat(${i})">${i + 1}. ${c.assunto}</button>`
    ).join("<br>");
}

function carregarChat(indice) {
    chatAtual = { ...chats[indice] };
    renderizarChat();
}

function salvarChat() {
    if (!chats.includes(chatAtual)) {
        chats.push({ ...chatAtual });
    }
    renderizarHistorico();
}

function limparHistorico() {
    chats = [];
    chatAtual = { mensagens: [], assunto: "Sem assunto" };
    renderizarHistorico();
    renderizarChat();
}
