# HIDRAULICA FREITAS - REGISTRO DE ENTRADA EM OFICINA

## Descrição
Aplicativo mobile responsivo desenvolvido para registrar entradas de serviços na oficina da Hidraulica Freitas. O aplicativo coleta informações essenciais do cliente e do equipamento, criando automaticamente um pedido de venda no sistema Bling.com.br que pode ser posteriormente convertido em uma ordem de serviço.

## Funcionalidades
- **Interface moderna e responsiva** com design profissional
- **Campos obrigatórios**: Cliente, Placa do Equipamento, Reclamação do Cliente, Nome da Pessoa que deixou o serviço
- **Campo opcional**: Número de Telefone
- **Formatação automática** para telefone e placa de equipamento
- **Integração com Bling.com.br** via API OAuth 2.0
- **Validação de formulário** em tempo real
- **Tratamento de erros** e mensagens de feedback
- **Design responsivo** para dispositivos móveis e desktop

## Cores da Empresa
- Cinza escuro (#1a1a1a, #2d2d2d)
- Preto (#000000)
- Prata (#c0c0c0, #808080)
- Laranja (#ff6b35, #ff8c42)

## Tecnologias Utilizadas
- HTML5
- CSS3 (com animações e gradientes)
- JavaScript (ES6+)
- API Bling v3
- OAuth 2.0 para autenticação
- Font Awesome para ícones
- Google Fonts (Inter)

## Configuração da API Bling
O aplicativo utiliza as seguintes credenciais para integração com o Bling:
- **Client ID**: 6b6ba3a8083c01e5680db675ab9b5b2717d2b775
- **Client Secret**: dd7759bf9486cf0d8bc357f838f09e01601c722d23f86d3335e76de24228
- **Escopos**: Pedidos de Venda (Gerenciar, Exclusão, Situações)

## Como Usar
1. **Autorização**: Na primeira utilização, clique em "Autorizar Bling" para conectar o aplicativo ao sistema Bling
2. **Preenchimento**: Complete todos os campos obrigatórios do formulário
3. **Registro**: Clique em "Registrar Entrada" para criar o pedido de venda no Bling
4. **Conversão**: No sistema Bling, converta manualmente o pedido de venda em ordem de serviço

## Estrutura de Arquivos
```
hidraulica-freitas-app/
├── index.html          # Página principal do aplicativo
├── styles.css          # Estilos CSS com design responsivo
├── script.js           # Lógica JavaScript e integração com API
└── README.md           # Documentação do projeto
```

## URL de Produção
O aplicativo está disponível em: https://ziabovqs.manus.space

## Recursos Implementados
- ✅ Design moderno com fundo escuro
- ✅ Formulário responsivo com validação
- ✅ Formatação automática de campos
- ✅ Integração OAuth 2.0 com Bling
- ✅ Tratamento de erros e feedback visual
- ✅ Modais para loading, sucesso e erro
- ✅ Botões com animações e efeitos hover
- ✅ Layout otimizado para mobile e desktop

## Observações Técnicas
- O aplicativo cria pedidos de venda no Bling que devem ser convertidos manualmente em ordens de serviço
- A autorização OAuth é persistida no localStorage do navegador
- O aplicativo funciona offline após a primeira autorização (exceto para envio de dados)
- Todos os campos obrigatórios são validados antes do envio
- O design segue as cores e identidade visual da empresa

## Suporte
Para suporte técnico ou dúvidas sobre o aplicativo, entre em contato com a equipe de desenvolvimento.

