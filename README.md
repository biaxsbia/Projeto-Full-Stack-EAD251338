# Gerenciador de promoções

**Gestão de Projetos para Micro e Pequenas Empresas**  
Este é um trabalho de extensão desenvolvido como parte do curso de Análise e desenvolvimento de sistemas. A aplicação permite a gestão de promoções para micro e pequenas empresas, com foco em mercados locais.

---

## Funcionalidades

- Cadastro, visualização, edição e exclusão de promoções.
- Cadastro, visualização, edição e exclusão de categorias.
- Valor com desconto calculado automaticamente de acordo com a porcentagem preenchida pelo usuário.
- Notificações em tela de confirmação de exclusão/ atualização.
- Dashboard para visualização de métricas das promoções.
- Interface amigável desenvolvida em React.
- Backend em Flask com banco de dados MongoDB.
- Implantação utilizando Docker.

---

## Tecnologias Utilizadas

- **Frontend**: React.js, HTML, CSS, JavaScript
- **Backend**: Flask, Python
- **Banco de Dados**: MongoDB  
- **Infraestrutura**: Docker e Docker Compose  
- **Outras Ferramentas**: Bootstrap, Axios

---

## Como Executar o Projeto
1. Abra o terminal na pasta do projeto. 
2. Execute o comando abaixo para iniciar todos os serviços: 
docker-compose up --build 
3. O Docker irá construir as imagens e rodar os contêineres para o backend, frontend 
e banco de dados MongoDB. 
Onde acessar? 
Acesse o frontend no seu navegador: http://localhost:3000
A API do backend estará disponível em: http://localhost:5000

### Pré-requisitos
- Node.js e npm instalados
- Python 3 e pip instalados
- Docker e Docker Compose instalados em sua máquina.


