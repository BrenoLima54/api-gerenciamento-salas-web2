🔬 API de Gerenciamento de Laboratórios
Esta API permite o gerenciamento de laboratórios com autenticação via token, controle de acesso por dias da semana, geração de relatórios em PDF e persistência de dados em MongoDB. Ideal para instituições que desejam organizar e monitorar o uso de suas salas técnicas.

🚀 Funcionalidades
Autenticação JWT

Recebe email e senha e retorna um token JWT para acesso às rotas protegidas.

Cadastro de Laboratório

Permite o cadastro de um novo laboratório com os campos: nome, descrição, capacidade e foto.

Geração de Relatórios

Gera e permite o download de um arquivo PDF contendo a lista completa dos laboratórios cadastrados, com suas respectivas imagens.

Controle de Acesso por Dias da Semana

Middleware que restringe o uso da API a dias da semana

🧱 Stack
Node.js + Express

MongoDB (via Mongoose)

JWT para autenticação

Multer ou similar para upload de imagens

PDFKit (ou equivalente) para geração de relatórios em PDF

Jest ou Mocha/Chai para testes automatizados

Implantação: Vercel ou outro provedor de nuvem
