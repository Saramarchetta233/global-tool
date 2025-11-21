# 🧠 Studius AI - Sistema Completo di Studio AI

Studius AI è una piattaforma completa che trasforma i tuoi PDF in materiali di studio intelligenti usando l'intelligenza artificiale. Include un sistema di crediti, autenticazione utenti, tutor AI e molto altro.

## 📋 Indice

1. [Caratteristiche Principali](#caratteristiche-principali)
2. [Architettura del Sistema](#architettura-del-sistema)
3. [Setup e Configurazione](#setup-e-configurazione)
4. [Database Setup (Supabase)](#database-setup-supabase)
5. [API Endpoints](#api-endpoints)
6. [Sistema di Crediti](#sistema-di-crediti)
7. [Componenti UI](#componenti-ui)
8. [Come Usare](#come-usare)
9. [Sviluppo e Customizzazione](#sviluppo-e-customizzazione)

## 🚀 Caratteristiche Principali

### ✨ Generazione Materiali AI
- **Riassunti Intelligenti**: Brevi e approfonditi con struttura a capitoli
- **Flashcard Avanzate**: 20 carte ottimizzate per la memorizzazione
- **Quiz Interattivi**: 10 domande con spiegazioni dettagliate
- **Mappe Concettuali**: Visualizzazione gerarchica dei concetti
- **Piani di Studio**: Guida strategica "Studia in 1 ora"

### 🤖 Tutor AI Conversazionale
- Chat intelligente con contesto del documento
- Risposte pedagogiche e personalizzate
- Memorizzazione conversazioni lato client
- Integrazione con tutti i materiali generati

### 💰 Sistema di Crediti Completo
- Gestione crediti per ogni operazione
- 100 crediti gratuiti alla registrazione
- Tracking dettagliato dell'uso dei crediti
- API per acquisti futuri (Stripe ready)

### 🔐 Autenticazione Sicura
- Registrazione/Login con JWT
- Password hashate con bcrypt
- Gestione sessioni sicure
- Protezione endpoint API

### 🎨 UX Moderna e Responsive
- Design glassmorphism avanzato
- Loading screen animati
- Feedback visivi in tempo reale
- Mobile-first approach

## 🏗️ Architettura del Sistema

```
src/
├── app/
│   ├── api/
│   │   ├── auth/              # Endpoints autenticazione
│   │   ├── credits/           # Gestione crediti
│   │   ├── tutor/             # Chat AI e sessioni
│   │   ├── process-pdf/       # Elaborazione PDF originale
│   │   └── process-pdf-v2/    # Elaborazione con crediti
│   ├── test-v2/               # Nuova pagina principale
│   └── tutor/                 # Pagina chat tutor
├── lib/
│   ├── auth-context.tsx       # Context autenticazione
│   ├── middleware.ts          # Middleware API con crediti
│   ├── prompts.ts             # Prompt AI centralizzati
│   └── supabase.ts           # Configurazione database
└── components/
    ├── AuthModal.tsx          # Modal login/registrazione
    ├── CreditBar.tsx          # Barra crediti
    └── LoadingScreen.tsx      # Loading animato
```

## ⚙️ Setup e Configurazione

### 1. Installazione Dipendenze

```bash
npm install @supabase/supabase-js bcryptjs jsonwebtoken
npm install --save-dev @types/bcryptjs @types/jsonwebtoken
```

### 2. Variabili d'Ambiente

Copia `.env.local.template` in `.env.local` e configura:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# PDF.co Configuration for PDF text extraction
PDFCO_API_KEY=your_pdfco_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# JWT Secret for authentication
JWT_SECRET=your_secure_jwt_secret_here
```

### 3. Chiavi API Necessarie

#### OpenAI API Key
1. Vai su [OpenAI Platform](https://platform.openai.com/api-keys)
2. Crea una nuova secret key
3. Sostituisci nel file `.env.local`

#### PDF.co API Key
1. Vai su [PDF.co Account](https://app.pdf.co/account)
2. Ottieni la tua chiave gratuita (100 richieste/mese)
3. Sostituisci nel file `.env.local`

#### Supabase Setup
1. Crea un progetto su [Supabase](https://supabase.com/dashboard)
2. Vai in Settings > API
3. Copia URL e Anon Key nel file `.env.local`

#### JWT Secret
```bash
# Genera una stringa sicura
openssl rand -base64 32
# Copiala nel file .env.local
```

## 🗄️ Database Setup (Supabase)

Esegui questi script SQL nel tuo progetto Supabase:

### 1. Tabella Users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  credits INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index per performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_credits ON users(credits);
```

### 2. Tabella Credit Logs

```sql
CREATE TYPE credit_operation_type AS ENUM (
  'summary', 'flashcard', 'quiz', 'tutor', 'map', 'extraction', 'purchase'
);

CREATE TABLE credit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type credit_operation_type NOT NULL,
  credits_used INTEGER NOT NULL, -- Negativo per aggiunte
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index per performance e analytics
CREATE INDEX idx_credit_logs_user_id ON credit_logs(user_id);
CREATE INDEX idx_credit_logs_type ON credit_logs(type);
CREATE INDEX idx_credit_logs_timestamp ON credit_logs(timestamp DESC);
```

### 3. Tabella Tutor Sessions

```sql
CREATE TABLE tutor_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  pdf_text TEXT NOT NULL,
  riassunto_breve TEXT NOT NULL,
  riassunto_esteso TEXT NOT NULL,
  flashcard JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index per performance
CREATE INDEX idx_tutor_sessions_user_id ON tutor_sessions(user_id);
CREATE INDEX idx_tutor_sessions_created_at ON tutor_sessions(created_at DESC);
```

### 4. Row Level Security (RLS)

```sql
-- Abilita RLS per sicurezza
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_sessions ENABLE ROW LEVEL SECURITY;

-- Policy per users (solo i propri dati)
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Policy per credit_logs (solo i propri log)
CREATE POLICY "Users can view own credit logs" ON credit_logs
  FOR SELECT USING (user_id = auth.uid());

-- Policy per tutor_sessions (solo le proprie sessioni)
CREATE POLICY "Users can view own tutor sessions" ON tutor_sessions
  FOR ALL USING (user_id = auth.uid());
```

## 🛠️ API Endpoints

### Autenticazione

#### POST `/api/auth/register`
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### POST `/api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Elaborazione PDF

#### POST `/api/process-pdf-v2`
- **Auth**: Bearer token richiesto
- **Costi**: 5 crediti
- **Input**: FormData con file PDF e lingua
- **Output**: Materiali di studio + sessionId per tutor

### Tutor AI

#### POST `/api/tutor`
```json
{
  "message": "Spiegami il concetto X",
  "sessionId": "uuid-sessione"
}
```

#### POST `/api/tutor/sessions`
- Crea nuova sessione tutor
- GET per recuperare sessioni esistenti

### Gestione Crediti

#### POST `/api/credits/add`
```json
{
  "credits": 100,
  "type": "purchase"
}
```

## 💳 Sistema di Crediti

### Costi Operazioni

```typescript
export const CREDIT_COSTS = {
  summary: 10,      // Riassunti
  flashcard: 8,     // Flashcard
  quiz: 8,          // Quiz
  map: 6,           // Mappe concettuali
  tutor: 5,         // Messaggio tutor
  extraction: 5     // Estrazione PDF (semplificato)
} as const;
```

### Flow Controllo Crediti

1. **Verifica Auth**: JWT token valido
2. **Controllo Crediti**: Sufficienti per operazione
3. **Esecuzione**: Operazione AI
4. **Scalaggio**: Deduzione crediti
5. **Logging**: Registrazione uso

### Gestione Errori

- **401**: Token non valido
- **402**: Crediti insufficienti
- **500**: Errori server

## 🎨 Componenti UI

### AuthModal
Modal completo per login/registrazione con:
- Validazione form
- Loading states
- Error handling
- Design glassmorphism

### CreditBar
Barra crediti sempre visibile con:
- Display crediti correnti
- Menu utente
- Pulsante acquisto crediti

### LoadingScreen
Loading screen animato con:
- Progresso multi-stage
- Animazioni fluide
- Indicatori di stato

## 📖 Come Usare

### Sviluppatore

1. **Setup iniziale**:
```bash
git clone <repository>
npm install
cp .env.local.template .env.local
# Configura le variabili d'ambiente
```

2. **Database setup**:
```bash
# Crea progetto Supabase
# Esegui SQL scripts
# Configura RLS policies
```

3. **Sviluppo**:
```bash
npm run dev
# Vai su /test-v2 per la nuova versione
```

### Utente Finale

1. **Registrazione**: 100 crediti gratuiti
2. **Upload PDF**: Carica documento di studio
3. **Elaborazione**: 5 crediti per generazione completa
4. **Studio**: Usa riassunti, flashcard, quiz
5. **Tutor**: Chat AI personalizzata (5 crediti/messaggio)

## 🔧 Sviluppo e Customizzazione

### Aggiungere Nuove Operazioni

1. **Aggiungi costo** in `lib/prompts.ts`:
```typescript
export const CREDIT_COSTS = {
  // ... esistenti
  new_operation: 7
} as const;
```

2. **Crea endpoint** con middleware:
```typescript
export const POST = withCredits('new_operation', async (request, user, newBalance) => {
  // La tua logica qui
});
```

### Personalizzare Prompt AI

Modifica i prompt in `lib/prompts.ts`:

```typescript
export const createCustomPrompt = ({ language, text }: PromptConfig) => `
  Il tuo prompt personalizzato qui...
  Lingua: ${language}
  Testo: ${text}
`;
```

### Temi e Styling

I componenti usano Tailwind con classi personalizzate:
- `bg-white/10 backdrop-blur-xl` per glassmorphism
- Gradienti con `/20` opacity per glow effects
- `border border-white/20` per bordi sottili

### Monitoraggio e Analytics

Usa i `credit_logs` per analytics:

```sql
-- Utilizzo crediti per utente
SELECT user_id, SUM(credits_used) as total_used 
FROM credit_logs 
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY user_id;

-- Operazioni più popolari
SELECT type, COUNT(*) as usage_count
FROM credit_logs 
WHERE credits_used > 0
GROUP BY type
ORDER BY usage_count DESC;
```

## 🚀 Deploy in Produzione

### Vercel Deploy

1. **Push su GitHub**
2. **Connetti Vercel**
3. **Configura Environment Variables**
4. **Deploy automatico**

### Environment Variables Produzione

```env
OPENAI_API_KEY=
PDFCO_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
JWT_SECRET=
```

### Security Checklist

- ✅ JWT secret sicuro (32+ chars)
- ✅ RLS abilitato su Supabase
- ✅ Password hashate con bcrypt
- ✅ Validazione input API
- ✅ Rate limiting (da implementare)
- ✅ HTTPS in produzione

## 📊 Monitoring e Maintenance

### Queries Utili

```sql
-- Utenti attivi oggi
SELECT COUNT(*) FROM users 
WHERE updated_at >= CURRENT_DATE;

-- Crediti totali nel sistema
SELECT SUM(credits) FROM users;

-- Sessioni tutor create oggi
SELECT COUNT(*) FROM tutor_sessions 
WHERE created_at >= CURRENT_DATE;
```

### Backup Database

```bash
# Backup automatico Supabase attivo
# Considera backup aggiuntivi per dati critici
```

---

## 🆘 Support & Troubleshooting

### Problemi Comuni

**Q: "Crediti insufficienti" ma ne ho abbastanza**
A: Controlla che il JWT token sia valido e non scaduto

**Q: PDF non viene processato**
A: Verifica chiave PDF.co e che il PDF contenga testo (non solo immagini)

**Q: Tutor non risponde**
A: Controlla che la sessione esista e appartenga all'utente autenticato

### Log e Debug

```typescript
// Abilita logging dettagliato in sviluppo
console.log('Debug info:', { user, credits, operation });
```

---

**🎯 Studius AI - Transforming Learning with AI**

Questo sistema è pronto per la produzione e può scalare facilmente. Per domande o support, consulta la documentazione tecnica o contatta il team di sviluppo.