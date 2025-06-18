// Formatação automática de telefone
function formatPhone(value) {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return value;
}

// Formatação automática de placa
function formatPlaca(value) {
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (cleaned.length <= 3) {
        return cleaned;
    } else if (cleaned.length <= 7) {
        return cleaned.substring(0, 3) + '-' + cleaned.substring(3);
    }
    return cleaned.substring(0, 3) + '-' + cleaned.substring(3, 7);
}

// Validação de formulário
function validateForm() {
    const cliente = document.getElementById('cliente').value.trim();
    const placa = document.getElementById('placa').value.trim();
    const reclamacao = document.getElementById('reclamacao').value.trim();
    const nome_responsavel = document.getElementById('nome_responsavel').value.trim();

    if (!cliente || !placa || !reclamacao || !nome_responsavel) {
        showMessage('error', 'Por favor, preencha todos os campos obrigatórios.');
        return false;
    }

    if (cliente.length < 2) {
        showMessage('error', 'Nome do cliente deve ter pelo menos 2 caracteres.');
        return false;
    }

    if (placa.length < 7) {
        showMessage('error', 'Placa deve ter formato válido (ex: ABC-1234).');
        return false;
    }

    if (reclamacao.length < 10) {
        showMessage('error', 'Reclamação deve ter pelo menos 10 caracteres.');
        return false;
    }

    if (nome_responsavel.length < 2) {
        showMessage('error', 'Nome da pessoa responsável deve ter pelo menos 2 caracteres.');
        return false;
    }

    return true;
}

// Mostrar mensagens de sucesso ou erro
function showMessage(type, message) {
    const successDiv = document.getElementById('successMessage');
    const errorDiv = document.getElementById('errorMessage');
    
    // Esconder ambas as mensagens primeiro
    successDiv.style.display = 'none';
    errorDiv.style.display = 'none';
    
    if (type === 'success') {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
    } else {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
    
    // Auto-esconder após 5 segundos
    setTimeout(() => {
        successDiv.style.display = 'none';
        errorDiv.style.display = 'none';
    }, 5000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const telefoneInput = document.getElementById('telefone_responsavel');
    const placaInput = document.getElementById('placa');
    const form = document.getElementById('serviceForm');
    const submitBtn = document.getElementById('submitBtn');

    // Formatação automática do telefone
    telefoneInput.addEventListener('input', function(e) {
        e.target.value = formatPhone(e.target.value);
    });

    // Formatação automática da placa
    placaInput.addEventListener('input', function(e) {
        e.target.value = formatPlaca(e.target.value);
    });

    // Submissão do formulário
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Desabilitar botão durante o processamento
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processando...';

        const cliente = document.getElementById('cliente').value.trim();
        const placa = document.getElementById('placa').value.trim();
        const reclamacao = document.getElementById('reclamacao').value.trim();
        const nome_responsavel = document.getElementById('nome_responsavel').value.trim();
        const telefone_responsavel = document.getElementById('telefone_responsavel').value.trim();

        const serviceData = {
            cliente: cliente,
            placa_equipamento: placa,
            reclamacao_cliente: reclamacao,
            nome_pessoa_deixou_servico: nome_responsavel,
            telefone_pessoa_deixou_equipamento: telefone_responsavel,
            data_registro: new Date().toLocaleString('pt-BR'),
            numero_protocolo: 'HF' + Date.now().toString().slice(-6)
        };

        console.log('Dados do Serviço:', serviceData);

        // Simular processamento
        setTimeout(() => {
            showMessage('success', `Serviço registrado com sucesso! Protocolo: ${serviceData.numero_protocolo}`);
            
            // Limpar formulário
            form.reset();
            
            // Reabilitar botão
            submitBtn.disabled = false;
            submitBtn.textContent = 'Registrar Serviço';
            
            // Aqui seria implementada a integração com o Bling
            // Para segurança, isso deve ser feito através de um backend
            console.log('Dados prontos para envio ao Bling:', serviceData);
        }, 1500);
    });
});

