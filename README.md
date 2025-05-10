# Tech Challenge Fast Food - Fase 1

## Descrição do Projeto

Este projeto é um sistema de controle de pedidos para uma lanchonete de bairro em expansão, projetado para resolver problemas de atendimento ao cliente e de organização interna. Com um sistema de autoatendimento, os clientes podem montar seus pedidos sem precisar interagir com um atendente, melhorando a eficiência e a satisfação do cliente.

## Objetivos

1. **Gestão de Pedidos:** Permitir que os clientes criem e acompanhem pedidos por uma interface intuitiva.
2. **Pagamento Simplificado:** Utilizar QR Code via Mercado Pago para facilitar o processo de pagamento.
3. **Painel Administrativo:** Disponibilizar funcionalidades para o estabelecimento gerenciar clientes, produtos e pedidos em andamento.
4. **Organização do Backend:** Estruturar o backend com base na arquitetura hexagonal e documentar as APIs via Swagger para fácil integração e testes.

## Funcionalidades

### Para o Cliente
- **Montagem do Pedido:** Escolha de itens opcionais como lanche, acompanhamento, bebida e sobremesa.
- **Pagamento:** Pagamento rápido e seguro via QR Code.
- **Acompanhamento do Pedido:** Status atualizado em tempo real, desde "Recebido" até "Finalizado".

### Para o Administrador
- **Gestão de Produtos:** Criar, editar e remover produtos, categorizados em lanche, acompanhamento, bebida e sobremesa.
- **Gestão de Clientes:** Identificação e cadastro dos clientes para campanhas e fidelização.
- **Monitoramento de Pedidos:** Controle sobre o andamento dos pedidos e tempo de espera.

## Pré-requisitos

- Node 20.17
- Docker e Docker Compose instalados
- Acesso ao repositório privado (compartilhado com o usuário `soat-architecture`)

## Configuração do Ambiente

1. Clone o repositório:
   ```bash
   git clone https://github.com/tech-snack-fiap-soat-tech-challenge/fastfood-app
   cd fastfood-app
   ```

2. Instale as dependências do projeto:
    ```bash
    npm i
    ```

3. Inicie a aplicação: 
    ```bash
    npm run start:dev
    ```

4. Acesse o Swagger para visualizar e testar as APIs disponíveis:
   ```
   http://localhost:3000/docs   
   ```

### Rodando aplicação no docker

O a aplicação possui um Docker compose caso deseje rodar com Docker.

1. Construa e inicie os contêineres com Docker:
   ```bash
   docker-compose up --build
   ```

2. Acesse o Swagger para visualizar e testar as APIs disponíveis:
   ```
   http://localhost:3000/docs
   ```

## Estrutura do Projeto

- **APIs Principais**:
  - Cadastro e Identificação do Cliente
  - Criação, edição e remoção de produtos
  - Filtragem de produtos por categoria
  - Checkout e listagem de pedidos


### Banco de Dados

Foi utilizado PostgreSQL para persistência de dados. 

![Diagrama do Sistema](docs/fastfood_db-diagram.png)


- **Criação das tabelas** Para a criação das tabelas necessárias, é preciso iniciar o banco de dados e executar as migrações que realizam a criação.

   ```bash
   npx db-migrate up
   ```

- Para apagar as tabelas execute o comando:

   ```bash
   npx db-migrate reset
   ```


## AWS 
O projeto roda em infra AWS, segue o desenho da Arquitetura AWS.

![AWS](docs/aws-infra.png)

## Observações

- O foco do projeto é o backend; interfaces para o frontend não são necessárias nesta fase.
- Diagramas e documentações adicionais estão disponíveis no diretório `docs/`

### Demo
O vídeo demonstrando o funcionamento completo da API e a Infraestrutura está disponível em:
https://youtu.be/Pmx_SDKAbOQ