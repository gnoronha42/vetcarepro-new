# 🐾 VETCARE-PRO

**Automatizador para clínicas e consultórios veterinários.**
Monorepo **React (Vite) + NestJS** — prontuário digital inteligente, agendamento, diagnóstico assistido por IA, comunicação com tutores, gestão administrativa, BI e chatbot.

---

## ✨ Funcionalidades (todas ativas)

| Módulo | Descrição |
|---|---|
| 🩺 **Prontuário digital** | Histórico clínico por paciente, anamnese, exame físico, peso/temperatura, retornos. |
| 📅 **Agendamento inteligente** | Sugestão automática de horários livres (08h–18h), detecção de conflitos, notificação ao tutor. |
| 🧠 **Diagnóstico assistido por IA** | Motor clínico local baseado em regras (10 condições + sinônimos), ranqueado por confiança e sinais de alerta. Funciona offline. Hook opcional para `ANTHROPIC_API_KEY`. |
| 🔔 **Comunicação com tutores** | Notificações (lembrete, vacina, retorno, financeiro) por app/e-mail/WhatsApp. |
| 💰 **Gestão administrativa** | Faturamento (cobranças, baixa de pagamento, resumo) e estoque (alertas de estoque baixo, movimentação). |
| 📊 **Relatórios de BI** | Dashboard com faturamento mensal, distribuição por espécie, próximos atendimentos. |
| 💬 **Chatbot FAQ** | Tira-dúvidas com base de conhecimento, sem dependência externa. |
| 🏷️ **Microchip / RFID** | Campo de microchip (padrão ISO) por paciente + busca por código — base para rastreabilidade futura. |

---

## 🧱 Arquitetura

```
vetcare-pro/
├─ apps/
│  ├─ api/        # NestJS — REST API (prefixo /api), TypeORM, JWT, Throttler
│  └─ web/        # React + Vite — SPA responsiva
├─ docker-compose.yml   # Postgres + API + Web (para a VPS futura)
└─ package.json          # npm workspaces
```

- **Banco de dados:** auto-detecção. Sem `DATABASE_URL` → **SQLite** local (zero config). Com `DATABASE_URL` → **PostgreSQL** (produção/VPS).
- **Segurança:** Helmet, CORS configurável, JWT (bcrypt), `ValidationPipe` global, rate limiting (120 req/min global; login/registro mais restritos).
- **Cores:** paleta clínica (teal/verde saúde + coral de acolhimento).

---

## 🚀 Início rápido (local — 3 passos)

> Requisito: **Node.js ≥ 18**.

```bash
# 1. Instalar dependências (na raiz — instala os dois apps)
npm install

# 2. Popular dados de demonstração (cria admin + pacientes + agenda…)
npm run seed

# 3. Subir API (3001) + Web (5173) juntos
npm run dev
```

Acesse **http://localhost:5173**

**Login de demonstração:**
- E-mail: `admin@vetcare.pro`
- Senha: `admin123`

> O primeiro usuário registrado vira **admin** automaticamente. Em produção, registre o seu e remova/ignore o seed.

### Scripts úteis (raiz)

| Comando | Ação |
|---|---|
| `npm run dev` | API + Web em paralelo (hot reload) |
| `npm run dev:api` / `npm run dev:web` | Apenas um dos apps |
| `npm run seed` | Recria dados de demonstração |
| `npm run build` | Build de produção (API + Web) |
| `npm run start:api` | Roda a API já buildada |

---

## ⚙️ Variáveis de ambiente

**`apps/api/.env`** (copie de `.env.example`)

```ini
PORT=3001
JWT_SECRET=troque-isto-por-um-segredo-forte
JWT_EXPIRES=8h
CORS_ORIGIN=http://localhost:5173      # vírgula para múltiplas origens
DATABASE_URL=                          # vazio = SQLite | postgres://... = Postgres
ANTHROPIC_API_KEY=                     # opcional: reforça o diagnóstico por IA
```

**`apps/web/.env`** (copie de `.env.example`)

```ini
VITE_API_URL=                          # vazio em dev (usa proxy) | https://api.seu-dominio.com/api em prod
```

---

## ☁️ Deploy

### Opção A — Vercel (frontend) + API separada

O frontend é uma SPA estática; a API NestJS é um servidor de longa duração (melhor numa VPS/Render/Railway).

**Frontend na Vercel:**
1. *New Project* → importe o repositório.
2. **Root Directory:** `apps/web`
3. Build/Output já definidos em `apps/web/vercel.json` (`npm run build` → `dist`, com rewrites de SPA).
4. Em *Environment Variables*, defina `VITE_API_URL = https://SUA-API/api`.

**API:** hospede `apps/api` em qualquer plataforma Node (defina `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN` apontando para o domínio da Vercel).

### Opção B — VPS com Docker (tudo junto)

```bash
# na raiz, defina os segredos e suba
export JWT_SECRET="um-segredo-bem-forte"
export DB_PASSWORD="senha-do-postgres"
export CORS_ORIGIN="https://seu-dominio.com"
export VITE_API_URL="https://seu-dominio.com/api"

docker compose up -d --build
```

- **Web:** porta `8080` (nginx) · **API:** porta `3001` · **Postgres:** volume persistente `pgdata`.
- Recomendado: um proxy reverso (Caddy/Nginx/Traefik) na frente para TLS e roteamento de `/api`.
- Rode o seed uma vez dentro do container da API, se desejar dados iniciais.

---

## 🔌 Principais rotas da API (prefixo `/api`)

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/register` · `/auth/login` | Cadastro (1º = admin) e login |
| GET | `/patients` · `/patients/microchip/:code` | Pacientes e busca por RFID |
| GET/POST | `/records?patientId=` | Prontuário |
| GET | `/appointments/slots?date=&duration=` | Horários livres sugeridos |
| POST | `/ai/diagnose` | Sugestão de diagnóstico (espécie + sintomas) |
| GET | `/billing/summary` · `/inventory/low-stock` | Resumo financeiro / estoque baixo |
| GET | `/reports/dashboard` | Dados do BI |
| POST | `/chatbot` | FAQ |

---

## ⚠️ Observações

- O diagnóstico por IA é **apoio à decisão** e **não substitui** o médico-veterinário.
- SQLite é ótimo para desenvolvimento; use **PostgreSQL** em produção.
- `synchronize: true` está ligado para agilizar o MVP — em produção avançada, migre para *migrations*.

---

Feito com 💚 para a saúde animal — **VETCARE-PRO**.
