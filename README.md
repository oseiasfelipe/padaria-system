# 🥖 PadariaSystem — Deploy Completo

Sistema PDV + Comanda Digital para padaria com mercadoria integrada.

---

## 📋 Pré-requisitos

- Conta gratuita no [GitHub](https://github.com)
- Conta gratuita no [Render.com](https://render.com)
- Git instalado no seu computador

---

## 🚀 PASSO 1 — Criar conta no Render.com

1. Acesse **render.com** e clique em **"Get Started for Free"**
2. Crie a conta com seu **e-mail** ou pelo **GitHub** (recomendado)
3. Confirme o e-mail se necessário

---

## 🐙 PASSO 2 — Criar repositório no GitHub

### Opção A — Pelo site do GitHub (mais fácil)

1. Acesse **github.com** e faça login (crie conta se não tiver)
2. Clique em **"New repository"** (botão verde `+`)
3. Nome: `padaria-system`
4. Deixe **público** (necessário para Render gratuito)
5. Clique em **"Create repository"**

### Opção B — Pelo terminal

```bash
# Na pasta do projeto
git init
git add .
git commit -m "feat: PadariaSystem inicial"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/padaria-system.git
git push -u origin main
```

---

## ☁️ PASSO 3 — Deploy no Render (automático via render.yaml)

### 3.1 — Conectar GitHub ao Render

1. No Render, clique em **"New +"** → **"Blueprint"**
2. Conecte sua conta GitHub
3. Selecione o repositório `padaria-system`
4. O Render vai ler o arquivo `render.yaml` automaticamente

### 3.2 — O Render vai criar automaticamente:

| Serviço | Nome | URL |
|---------|------|-----|
| Banco PostgreSQL | padariadb | (interno) |
| Backend Node.js | padaria-api | https://padaria-api.onrender.com |
| Frontend React | padaria-web | https://padaria-web.onrender.com |

### 3.3 — Ajustar URLs (importante!)

Após o primeiro deploy, atualize as variáveis de ambiente:

**No serviço `padaria-api`:**
- `FRONTEND_URL` → URL real do seu frontend (ex: `https://padaria-web.onrender.com`)

**No serviço `padaria-web`:**
- `VITE_API_URL` → URL real do seu backend (ex: `https://padaria-api.onrender.com`)

Após alterar, clique em **"Manual Deploy"** para cada serviço.

---

## 📱 Instalar como App (PWA)

### No iPhone/iPad (Safari):
1. Acesse a URL do frontend no Safari
2. Toque no ícone de **compartilhar** (□↑)
3. Role para baixo e toque **"Adicionar à Tela de Início"**
4. Confirme — o app aparece na tela inicial como um app nativo

### No Android (Chrome):
1. Acesse a URL no Chrome
2. Toque nos **3 pontinhos** (⋮) no canto superior direito
3. Toque em **"Adicionar à tela inicial"**

---

## 🔐 Login padrão

| Campo | Valor |
|-------|-------|
| Email | admin@padaria.com |
| Senha | padaria123 |

> ⚠️ **Altere a senha após o primeiro acesso!**

---

## 💻 Rodar localmente (com Docker)

```bash
# Clonar repositório
git clone https://github.com/SEU_USUARIO/padaria-system.git
cd padaria-system

# Subir tudo
docker-compose up -d

# Acessar
# Frontend: http://localhost:5173
# Backend:  http://localhost:3001
# Banco:    localhost:5432
```

---

## 🔄 Atualizar o sistema

Após qualquer mudança no código:

```bash
git add .
git commit -m "atualização"
git push
```

O Render faz o **deploy automático** em ~2 minutos.

---

## 📁 Estrutura do Projeto

```
padariaSystem/
├── backend/
│   ├── src/
│   │   ├── config/db.js          # Conexão PostgreSQL
│   │   ├── middlewares/auth.js   # JWT
│   │   ├── migrations/           # Schema SQL
│   │   └── routes/               # auth, produtos, comandas, relatorios
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Roteamento + autenticação
│   │   ├── Login.jsx             # Tela de login
│   │   ├── Sistema.jsx           # ← Cole aqui o padaria-system.jsx
│   │   ├── api.js                # Axios + interceptor JWT
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml            # Para rodar local
├── render.yaml                   # Deploy automático Render
└── README.md
```

---

## ❓ Problemas comuns

**Backend não inicia:**
- Verifique se `DATABASE_URL` está preenchido nas env vars do Render

**Frontend não conecta na API:**
- Verifique se `VITE_API_URL` aponta para a URL correta do backend
- Certifique-se que não há barra `/` no final da URL

**Plano gratuito "adormece":**
- No Render gratuito, serviços inativos por 15min ficam em standby
- O primeiro acesso do dia pode demorar ~30 segundos para "acordar"
- Para evitar: use o plano Starter ($7/mês) ou configure um cron de ping

---

## 💰 Custos estimados

| Configuração | Custo mensal |
|---|---|
| Render gratuito (banco expira em 90 dias) | R$ 0 |
| Render Starter (banco permanente) | ~R$ 40/mês |
| VPS DigitalOcean (mais controle) | ~R$ 30/mês |
