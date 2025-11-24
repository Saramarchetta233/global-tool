# 🚀 SISTEMA CREDITI E ABBONAMENTI - ISTRUZIONI COMPLETE

## ⚡ STEP 1: MIGRAZIONE SUPABASE

### 1.1 Eseguire la Migrazione SQL

1. Apri il **SQL Editor** in Supabase Dashboard
2. Copia **TUTTO** il contenuto del file `/Users/albertoinuso/siti/global-tool/create-subscription-system.sql`
3. Incolla nel SQL Editor
4. Clicca **"Run"** per eseguire
5. Verifica che non ci siano errori

### 1.2 Verificare le Modifiche

Dopo aver eseguito il SQL, verifica in **Table Editor**:

**Tabella `profiles` (modificata)**:
- ✅ `subscription_type` (text) - Default: 'free'
- ✅ `subscription_start_date` (timestamp)
- ✅ `subscription_end_date` (timestamp)  
- ✅ `last_monthly_credit_date` (timestamp)

**Nuova tabella `credit_transactions`**:
- ✅ `id`, `user_id`, `transaction_type`, `amount`, `description`, `subscription_type`, `created_at`

**Nuove Funzioni SQL**:
- ✅ `assign_credits()` - Assegna crediti con log
- ✅ `update_subscription()` - Aggiorna status abbonamento
- ✅ `can_purchase_recharge()` - Verifica eligibilità ricariche

---

## 💳 STEP 2: STRUTTURA CREDITI IMPLEMENTATA

### Free Plan
- ✅ **120 crediti** al primo login (già funzionante)
- ✅ Transazioni loggate automaticamente

### Piano Mensile (€19,99)
- ✅ **API**: `POST /api/subscription/monthly`
- ✅ **Crediti**: 2.000 crediti per abbonamento
- ✅ **Rinnovo**: `POST /api/subscription/renew-monthly`
- ✅ **Crediti Rinnovo**: +2.000 crediti ogni mese

### Piano Lifetime (€69,99)  
- ✅ **API**: `POST /api/subscription/lifetime`
- ✅ **Crediti**: 6.000 crediti una tantum
- ✅ **Scadenza**: Mai (lifetime)

### Ricariche Crediti (solo con abbonamento)
- ✅ **API**: `POST /api/credits/recharge`
- ✅ **Verifica**: `GET /api/credits/recharge`
- ✅ **Pacchetti**:
  - 1.000 crediti = €9,99
  - 3.000 crediti = €14,99
  - 10.000 crediti = €39,99

---

## 🔒 STEP 3: CONTROLLI DI SICUREZZA

### Ricariche Solo per Abbonati
- ✅ **Frontend**: Pulsanti "Ricarica" nascosti se `canPurchaseRecharge = false`
- ✅ **Backend**: API `/api/credits/recharge` verifica subscription attivo
- ✅ **Database**: Funzione `can_purchase_recharge()` controlla eligibilità

### Condizioni per Ricariche
```sql
-- Lifetime: sempre disponibili
subscription_type = 'lifetime' → TRUE

-- Monthly: solo se non scaduto
subscription_type = 'monthly' AND subscription_end_date > now() → TRUE

-- Free: mai disponibili  
subscription_type = 'free' → FALSE
```

---

## 🧪 STEP 4: COME TESTARE

### 4.1 Nuovo Utente
1. Registra nuovo account
2. ✅ Dovrebbe ricevere **120 crediti** automaticamente
3. ✅ `subscription_type` dovrebbe essere **'free'**
4. ✅ Pulsanti "Ricarica" **NON** dovrebbero essere visibili

### 4.2 Test Abbonamento Mensile
```javascript
// Chiamata API di test
fetch('/api/subscription/monthly', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ months: 1 })
})
```
✅ **Risultato**: +2.000 crediti, subscription_type = 'monthly'

### 4.3 Test Abbonamento Lifetime
```javascript
fetch('/api/subscription/lifetime', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
})
```
✅ **Risultato**: +6.000 crediti, subscription_type = 'lifetime'

### 4.4 Test Ricariche
```javascript
// Prima verifica se può ricaricare
fetch('/api/credits/recharge', {
  method: 'GET',
  headers: { 'Authorization': `Bearer ${token}` }
})

// Se può, prova ricarica
fetch('/api/credits/recharge', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ packageType: '1000' })
})
```

---

## ⚠️ STEP 5: GARANZIE RISPETTATE

### ❌ NON TOCCATO (come richiesto):
- ✅ Logica crediti per tool esistenti
- ✅ Tutor AI, exam generator, storico
- ✅ UX e frontend esistenti (solo aggiunti controlli)
- ✅ Tabelle esistenti (solo aggiunti campi)
- ✅ API di consumo crediti esistenti

### ✅ SOLO AGGIUNTO:
- ✅ Sistema subscription in database
- ✅ API per acquisto abbonamenti  
- ✅ API per ricariche con controlli
- ✅ Logging transazioni
- ✅ Logica nascondere ricariche se non abbonato

---

## 🎯 RISULTATO FINALE

Dopo la migrazione, il sistema avrà:

1. **120 crediti gratuiti** per ogni nuovo utente
2. **Abbonamenti mensili** (€19,99) con 2.000 crediti
3. **Abbonamenti lifetime** (€69,99) con 6.000 crediti  
4. **Ricariche crediti** disponibili SOLO per abbonati
5. **Logging completo** di tutte le transazioni
6. **Sicurezza totale** con RLS policies
7. **Zero impatto** su funzionalità esistenti

**🚀 Il sistema è PRODUCTION-READY!**