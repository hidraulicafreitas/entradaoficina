// Configurações da API do Bling
const BLING_CONFIG = {
    clientId: '6b6ba3a8083c01e5680db675ab9b5b2717d2b775',
    clientSecret: 'dd7759bf9486cf0d8bc357f838f09e01601c722d23f86d3335e76de24228',
    redirectUri: 'https://hidraulicafreitas.github.io/entradaoficina/',
    baseUrl: 'https://5000-izv86tl7ud6aqdki674b9-17906309.manusvm.computer'
};

// Estado da aplicação
let accessToken = null;

// Elementos do DOM
const serviceForm = document.getElementById('serviceForm');
const submitBtn = document.getElementById('submitBtn');
const clearBtn = document.getElementById('clearBtn');
const authorizeBtn = document.getElementById('authorizeBtn');

const clienteInput = document.getElementById('cliente');
const nomePessoaInput = document.getElementById('responsavel');
const telefoneInput = document.getElementById('telefone');
const placaInput = document.getElementById('placa');
const reclamacaoInput = document.getElementById('reclamacao');

// Modais
const loadingModal = document.getElementById('loadingModal');
const successModal = document.getElementById('successModal');
const errorModal = document.getElementById('errorModal');
const errorMessage = document.getElementById('errorMessage');
const tryAgainBtn = document.getElementById('tryAgainBtn');

// Funções de utilidade
function showModal(modal) {
    modal.classList.remove('hidden');
}

function hideModal(modal) {
    modal.classList.add('hidden');
}

function formatPhoneNumber(value) {
    if (!value) return '';
    value = value.replace(/\D/g, '');
    if (value.length > 10) {
        value = value.replace(/^(\d\d)(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (value.length > 5) {
        value = value.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (value.length > 2) {
        value = value.replace(/^(\d\d)(\d{0,5})/, '($1) $2');
    } else {
        value = value.replace(/^(\d*)/, '($1');
    }
    return value;
}

function formatPlate(value) {
    if (!value) return '';
    value = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length > 3) {
        value = value.replace(/^([A-Z]{3})(\d{0,4}).*/, '$1-$2');
    }
    return value;
}

function validateForm() {
    const fields = [
        { element: clienteInput, name: 'Cliente' },
        { element: nomePessoaInput, name: 'Nome da Pessoa que Deixou o Serviço' },
        { element: placaInput, name: 'Placa do Equipamento' },
        { element: reclamacaoInput, name: 'Reclamação do Cliente' }
    ];

    for (const field of fields) {
        if (!field.element.value.trim()) {
            alert(`Por favor, preencha o campo obrigatório: ${field.name}`);
            field.element.focus();
            return false;
        }
    }
    return true;
}

// Funções de integração com Bling
async function getAccessToken(code) {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', BLING_CONFIG.redirectUri);
    params.append('client_id', BLING_CONFIG.clientId);
    params.append('client_secret', BLING_CONFIG.clientSecret);

    try {
        const response = await fetch(`${BLING_CONFIG.baseUrl}/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erro ao obter token de acesso: ${errorData.error_description || errorData.message || JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Erro na troca do código por token:', error);
        throw new Error('Erro na autorização. Tente novamente.');
    }
}

async function validateAccessToken(token) {
    try {
        // Tenta fazer uma requisição simples, como listar contatos, para validar o token
        const response = await fetch(`${BLING_CONFIG.baseUrl}/contatos?filters=nome[]`, { // Filtro vazio para pegar qualquer contato ou nenhum
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.ok; // Retorna true se a requisição for bem-sucedida (token válido)
    } catch (error) {
        console.error('Erro ao validar token:', error);
        return false; // Retorna false se houver erro (token inválido)
    }
}

async function searchContact(nome, token) {
    try {
        const response = await fetch(`${BLING_CONFIG.baseUrl}/contatos?filters=nome[${nome}]`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erro ao pesquisar contato: ${errorData.message || JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        if (data.data && data.data.length > 0) {
            return data.data[0].id; // Retorna o ID do primeiro contato encontrado
        } else {
            return null; // Contato não encontrado
        }
    } catch (error) {
        console.error('Erro ao pesquisar contato:', error);
        throw new Error('Erro ao pesquisar contato existente.');
    }
}

async function createContact(nome, telefone, token) {
    const contactData = {
        nome: nome,
        tipoPessoa: 'F',
        contribuinte: '1',
        telefone: telefone.replace(/\D/g, '') // Remove formatação para enviar
    };

    try {
        const response = await fetch(`${BLING_CONFIG.baseUrl}/contatos`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contactData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erro ao criar contato: ${errorData.message || JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        return data.data.id; // Retorna o ID do novo contato
    } catch (error) {
        console.error('Erro ao criar contato:', error);
        throw new Error('Erro ao criar novo contato.');
    }
}

async function createSalesOrder(formData, token) {
    const { cliente, nomePessoa, telefone, placa, reclamacao } = formData;

    let contactId = await searchContact(cliente, token);

    if (!contactId) {
        contactId = await createContact(cliente, telefone, token);
    }

    const orderData = {
        data: {
            tipo: 'VENDA',
            contato: {
                id: contactId
            },
            itens: [
                {
                    descricao: `Serviço: ${reclamacao}`,
                    codigo: 'SERVICO_OFICINA',
                    unidade: 'UN',
                    quantidade: 1,
                    valor: 0.01 // Valor mínimo para o item de serviço
                }
            ],
            observacoes: `Placa do Equipamento: ${placa}\nNome da Pessoa que Deixou o Serviço: ${nomePessoa}\nTelefone: ${telefone}`
        }
    };

    try {
        const response = await fetch(`${BLING_CONFIG.baseUrl}/pedidos/vendas`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erro ao criar pedido de venda: ${errorData.message || JSON.stringify(errorData)}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Erro ao criar pedido de venda:', error);
        throw new Error('Erro ao registrar entrada no Bling. Verifique os dados e tente novamente.');
    }
}

// Funções de manipulação de eventos
async function handleFormSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
        return;
    }

    if (!accessToken) {
        showModal(errorModal);
        errorMessage.textContent = 'Aplicativo não autorizado. Por favor, clique em "Autorizar Bling" para conectar.';
        return;
    }

    showModal(loadingModal);

    const formData = {
        cliente: clienteInput.value.trim(),
        nomePessoa: nomePessoaInput.value.trim(),
        telefone: telefoneInput.value.trim(),
        placa: placaInput.value.trim(),
        reclamacao: reclamacaoInput.value.trim()
    };

    try {
        await createSalesOrder(formData, accessToken);
        hideModal(loadingModal);
        showModal(successModal);
        document.getElementById('successMessage').textContent = 'Pedido de venda criado com sucesso no Bling!';
        serviceForm.reset(); // Limpa o formulário após o sucesso
        localStorage.removeItem('blingAccessToken'); // Força nova autorização para evitar tokens expirados
        initializeApp(); // Re-inicializa para mostrar o botão de autorização
    } catch (error) {
        hideModal(loadingModal);
        showModal(errorModal);
        errorMessage.textContent = error.message;
    }
}

function handleAuthorizeClick() {
    const authUrl = `https://www.bling.com.br/b/Api/v3/oauth/authorize?response_type=code&client_id=${BLING_CONFIG.clientId}&state=random_state&redirect_uri=${BLING_CONFIG.redirectUri}`;
    window.location.href = authUrl;
}

function handleClearForm() {
    serviceForm.reset();
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    hideModal(modal);
}

function setupEventListeners() {
    // Adiciona event listeners apenas se os elementos existirem
    if (serviceForm) serviceForm.addEventListener('submit', handleFormSubmit);
    if (authorizeBtn) authorizeBtn.addEventListener('click', handleAuthorizeClick);
    if (clearBtn) clearBtn.addEventListener('click', handleClearForm);
    if (tryAgainBtn) tryAgainBtn.addEventListener('click', () => closeModal('errorModal'));

    if (telefoneInput) {
        telefoneInput.addEventListener('input', (e) => {
            e.target.value = formatPhoneNumber(e.target.value);
        });
    }

    if (placaInput) {
        placaInput.addEventListener('input', (e) => {
            e.target.value = formatPlate(e.target.value);
        });
    }
}

async function initializeApp() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    // Garante que o formulário e o botão de autorização estejam visíveis por padrão
    if (serviceForm) serviceForm.style.display = 'block';
    if (authorizeBtn) authorizeBtn.style.display = 'block';

    if (code) {
        showModal(loadingModal);
        getAccessToken(code)
            .then(token => {
                accessToken = token;
                localStorage.setItem('blingAccessToken', accessToken);
                hideModal(loadingModal);
                window.history.replaceState({}, document.title, window.location.pathname); // Limpa o código da URL
                // Após autorização, esconde o botão de autorização e mostra o formulário
                if (authorizeBtn) authorizeBtn.style.display = 'none';
                if (serviceForm) serviceForm.style.display = 'block';
            })
            .catch(error => {
                hideModal(loadingModal);
                showModal(errorModal);
                errorMessage.textContent = error.message;
                // Em caso de erro na autorização, mantém o botão de autorização visível e o formulário escondido
                if (authorizeBtn) authorizeBtn.style.display = 'block';
                if (serviceForm) serviceForm.style.display = 'none';
            });
    } else if (localStorage.getItem('blingAccessToken')) {
        accessToken = localStorage.getItem('blingAccessToken');
        const isValid = await validateAccessToken(accessToken);
        if (isValid) {
            // Token válido, esconde o botão de autorização e mostra o formulário
            if (authorizeBtn) authorizeBtn.style.display = 'none';
            if (serviceForm) serviceForm.style.display = 'block';
        } else {
            localStorage.removeItem('blingAccessToken');
            accessToken = null;
            // Token inválido/expirado, mantém o botão de autorização visível e o formulário escondido
            if (authorizeBtn) authorizeBtn.style.display = 'block';
            if (serviceForm) serviceForm.style.display = 'none';
            console.warn('Token de acesso inválido ou expirado. Por favor, autorize novamente.');
        }
    } else {
        // Não há código na URL nem token no localStorage, mantém o botão de autorização visível e o formulário escondido
        if (authorizeBtn) authorizeBtn.style.display = 'block';
        if (serviceForm) serviceForm.style.display = 'none';
    }
    setupEventListeners();
}

// Inicializa o aplicativo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initializeApp);


