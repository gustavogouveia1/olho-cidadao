# 👁️ Olho-Cidadão

**Olho-Cidadão** é um sistema web para **denúncias anônimas**, criado com o objetivo de motivar e facilitar a participação dos cidadãos na construção de uma cidade melhor — **garantindo total anonimato e segurança aos usuários**.

## 🚀 Objetivo

Promover um ambiente seguro e confiável onde qualquer pessoa possa relatar problemas ou irregularidades em sua cidade, sem medo de retaliações ou exposição.

## ⚙️ Tecnologias Utilizadas

- **Backend:** PHP (Laravel)
- **Banco de Dados:** MySQL
- **Frontend:** HTML, CSS e JavaScript (vanilla)

## 📁 Estrutura do Projeto

```bash
olho-cidadao/
├── backend/ # Aplicação Laravel
├── frontend/ # Interface web com HTML, CSS e JS
```

## 🧪 Status do Projeto

> ✅ **MVP funcional**  
> 🔧 Em constante evolução com melhorias contínuas.

## 🛠️ Como Rodar o Projeto

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/olho-cidadao.git
cd olho-cidadao

cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

Acesse o frontend
Abra o arquivo index.html dentro da pasta frontend no navegador, ou sirva com um servidor local (como o Live Server do VS Code).

### 🤝 Contribuição
Este projeto é desenvolvido por Gustavo Gouveia e Marco Fonseca como parte de um trabalho acadêmico, mas está em desenvolvimento ativo e aberto a colaborações futuras.

