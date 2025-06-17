// Configurações da API do Bling
const BLING_CONFIG = {
    clientId: '6b6ba3a8083c01e5680db675ab9b5b2717d2b775',
    clientSecret: 'dd7759bf9486cf0d8bc357f838f09e01601c722d23f86d3335e76de24228',
    redirectUri: 'https://hidraulicafreitas.github.io/entradaoficina/',
    baseUrl: 'https://api.bling.com.br/Api/v3'
};

// Estado da aplicação
let accessToken = null;

// Elementos do DOM
const serviceForm = document.getElementById('serviceForm');
const submitBtn = document.getElementById('submitBtn');
const clearBtn = document.getElementById('clearBtn');
const authorizeBtn = document.getElementById('authorizeBtn');

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    setupFormValidation();
});

function initializeApp() {
    // Verificar se há um código de autorização na URL
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    
    if (authCode) {
        // Trocar código por token de acesso
        exchangeCodeForToken(authCode);
    } else {
        // Verificar se já temos um token armazenado
        accessToken = localStorage.getItem('bling_access_token');
        updateAuthorizationStatus();
    }
}

function updateAuthorizationStatus() {
    if (accessToken) {
        authorizeBtn.style.display = 'none';
        submitBtn.disabled = false;
        console.log('Aplicativo autorizado com o Bling');
    } else {
        authorizeBtn.style.display = 'inline-flex';
        submitBtn.disabled = true;
        console.log('Aplicativo não autorizado. Clique em "Autorizar Bling" para conectar.');
    }
}

function setupEventListeners() {
    // Evento de submissão do formulário
    serviceForm.addEventListener('submit', handleFormSubmit);
    
    // Evento de limpar formulário
    clearBtn.addEventListener('click', clearForm);
    
    // Evento de autorização
    authorizeBtn.addEventListener('click', redirectToAuthorization);
    
    // Formatação automática do telefone
    const telefoneInput = document.getElementById('telefone');
    telefoneInput.addEventListener('input', formatPhoneNumber);
    
    // Formatação automática da placa
    const placaInput = document.getElementById('placa');
    placaInput.addEventListener('input', formatPlate);
}

function setupFormValidation() {
    const requiredFields = document.querySelectorAll('input[required], textarea[required]');
    
    requiredFields.forEach(field => {
        field.addEventListener('blur', validateField);
        field.addEventListener('input', clearFieldError);
    });
}

function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    if (!value) {
        field.classList.add('error');
        field.classList.remove('success');
    } else {
        field.classList.remove('error');
        field.classList.add('success');
    }
}

function clearFieldError(event) {
    const field = event.target;
    field.classList.remove('error');
}

function formatPhoneNumber(event) {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
        value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        value = value.replace(/(\d{2})(\d{4})/, '($1) $2');
        value = value.replace(/(\d{2})/, '($1');
    }
    
    event.target.value = value;
}

function formatPlate(event) {
    let value = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (value.length <= 7) {
        value = value.replace(/([A-Z]{3})([0-9]{4})/, '$1-$2');
        value = value.replace(/([A-Z]{3})([0-9]{1,3})/, '$1-$2');
    }
    
    event.target.value = value;
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!accessToken) {
        showErrorModal('É necessário autorizar o aplicativo com o Bling antes de registrar uma entrada. Clique em "Autorizar Bling".');
        return;
    }
    
    if (!validateForm()) {
        return;
    }
    
    const formData = getFormData();
    
    try {
        showModal('loadingModal');
        await createSalesOrder(formData);
        hideModal('loadingModal');
        showSuccessModal('Entrada registrada com sucesso! Um pedido de venda foi criado no Bling.');
        clearForm();
    } catch (error) {
        hideModal('loadingModal');
        console.error('Erro ao criar pedido:', error);
        
        if (error.message.includes('401') || error.message.includes('token')) {
            // Token expirado ou inválido
            localStorage.removeItem('bling_access_token');
            accessToken = null;
            updateAuthorizationStatus();
            showErrorModal('Sessão expirada. Por favor, autorize novamente o aplicativo com o Bling.');
        } else {
            showErrorModal(error.message);
        }
    }
}

function validateForm() {
    const requiredFields = document.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('error');
            isValid = false;
        } else {
            field.classList.remove('error');
            field.classList.add('success');
        }
    });
    
    return isValid;
}

function getFormData() {
    return {
        cliente: document.getElementById('cliente').value.trim(),
        responsavel: document.getElementById('responsavel').value.trim(),
        telefone: document.getElementById('telefone').value.trim(),
        placa: document.getElementById('placa').value.trim(),
        reclamacao: document.getElementById('reclamacao').value.trim()
    };
}

async function createSalesOrder(formData) {
    if (!accessToken) {
        throw new Error('Token de acesso não encontrado. Redirecionando para autorização...');
    }
    
    const orderData = {
        numero: generateOrderNumber(),
        data: new Date().toISOString().split('T')[0],
        contato: {
            nome: formData.cliente,
            tipoPessoa: 'F'
        },
        itens: [{
            produto: {
                nome: `Serviço de Oficina - ${formData.placa}`,
                tipo: 'S',
                situacao: 'A'
            },
            quantidade: 1,
            valor: 0.01,
            descricao: `Equipamento: ${formData.placa}\nResponsável: ${formData.responsavel}\nTelefone: ${formData.telefone || 'Não informado'}\nReclamação: ${formData.reclamacao}`
        }],
        observacoes: `ENTRADA EM OFICINA\n\nEquipamento: ${formData.placa}\nResponsável: ${formData.responsavel}\nTelefone: ${formData.telefone || 'Não informado'}\nReclamação: ${formData.reclamacao}`,
        observacoesInternas: `Registro de entrada em oficina - ${new Date().toLocaleString('pt-BR')}`
    };
    
    const response = await fetch(`${BLING_CONFIG.baseUrl}/pedidos/vendas`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(orderData)
    });
    
    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Token de acesso inválido ou expirado (401)');
        }
        
        let errorMessage = 'Erro ao criar pedido de venda no Bling';
        try {
            const errorData = await response.json();
            errorMessage = errorData.error?.message || errorData.message || errorMessage;
        } catch (e) {
            errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
    }
    
    return await response.json();
}

function generateOrderNumber() {
    const now = new Date();
    const timestamp = now.getTime().toString().slice(-6);
    return `OS${timestamp}`;
}

function redirectToAuthorization() {
    const state = generateRandomState();
    localStorage.setItem('oauth_state', state);
    
    const authUrl = `https://www.bling.com.br/Api/v3/oauth/authorize?` +
        `response_type=code&` +
        `client_id=${BLING_CONFIG.clientId}&` +
        `state=${state}&` +
        `redirect_uri=${encodeURIComponent(BLING_CONFIG.redirectUri)}`;
    
    window.location.href = authUrl;
}

async function exchangeCodeForToken(code) {
    const storedState = localStorage.getItem('oauth_state');
    const urlState = new URLSearchParams(window.location.search).get('state');
    
    if (storedState !== urlState) {
        throw new Error('Estado OAuth inválido');
    }
    
    try {
        const response = await fetch(`${BLING_CONFIG.baseUrl}/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: BLING_CONFIG.redirectUri,
                client_id: BLING_CONFIG.clientId,
                client_secret: BLING_CONFIG.clientSecret
            })
        });
        
        if (!response.ok) {
            throw new Error('Erro ao obter token de acesso');
        }
        
        const tokenData = await response.json();
        accessToken = tokenData.access_token;
        
        localStorage.setItem('bling_access_token', accessToken);
        localStorage.removeItem('oauth_state');
        
        // Limpar URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Atualizar status de autorização
        updateAuthorizationStatus();
        
        showSuccessModal('Autorização realizada com sucesso! Agora você pode registrar entradas na oficina.');
        
    } catch (error) {
        console.error('Erro na troca do código por token:', error);
        showErrorModal('Erro na autorização. Tente novamente.');
    }
}

function generateRandomState() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

function clearForm() {
    serviceForm.reset();
    
    // Remover classes de validação
    const fields = document.querySelectorAll('.form-group input, .form-group textarea');
    fields.forEach(field => {
        field.classList.remove('error', 'success');
    });
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
    
    // Fechar modal ao clicar fora
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            hideModal(modalId);
        }
    });
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
}

function closeModal(modalId) {
    hideModal(modalId);
}

function showSuccessModal(message) {
    document.getElementById('successMessage').textContent = message;
    showModal('successModal');
}

function showErrorModal(message) {
    document.getElementById('errorMessage').textContent = message;
    showModal('errorModal');
}

// Fechar modais com a tecla ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    }
});

// Prevenir envio do formulário com Enter em campos de texto
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && event.target.tagName !== 'TEXTAREA' && event.target.type !== 'submit') {
        event.preventDefault();
    }
});

