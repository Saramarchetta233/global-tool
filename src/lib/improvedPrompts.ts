export interface PromptConfig {
  language: string;
  text: string;
  targetLanguage?: string;
  documentLength?: number; // caratteri del documento
}

export const createImprovedSummaryPrompt = ({ language, text, targetLanguage, documentLength }: PromptConfig) => {
  // Calcola lunghezza target basata su documento
  const docChars = documentLength || text.length;
  const briefTarget = Math.min(Math.max(1500, docChars / 20), 2500); // 1.500-2.500 parole
  
  // Esteso proporzionale al documento
  let extendedTarget = '';
  if (docChars <= 150000) { // ~50 pagine
    extendedTarget = '2.000-4.000 parole';
  } else if (docChars <= 450000) { // ~150 pagine  
    extendedTarget = '4.000-8.000 parole';
  } else if (docChars <= 900000) { // ~300 pagine
    extendedTarget = '8.000-12.000 parole';
  } else {
    extendedTarget = '12.000-15.000 parole';
  }

  return `Analizza il seguente testo e crea due riassunti in ${targetLanguage || language} con formattazione HTML avanzata.

RIASSUNTO BREVE (${Math.round(briefTarget)} parole):
- Generato automaticamente al caricamento
- Panoramica del documento con concetti chiave
- Tempo di lettura: 5-10 minuti

RIASSUNTO ESTESO (${extendedTarget}):
- Completo e dettagliato per studio universitario
- Formattazione HTML professionale
- Massimo 10-15 sezioni principali

FORMATTAZIONE HTML OBBLIGATORIA:

1. **Headers e struttura:**
<div class="capitolo-header">
  <h2>📚 Capitolo 1 - [Titolo]</h2>
</div>

2. **Definizioni:**
<div class="definizione">
  <strong>📖 DEFINIZIONE - [Nome]</strong><br>
  [Testo definizione]
</div>

3. **Teoremi (se presenti):**
<div class="teorema">
  <strong>📐 TEOREMA - [Nome]</strong><br>
  [Enunciato]<br>
  <em>Dimostrazione:</em> [Se presente]
</div>

4. **Formule LaTeX (se presenti):**
<div class="formula">
  $[formula in LaTeX]$
  <p>Dove: $x$ = [significato], $y$ = [significato]</p>
</div>

5. **Esempi:**
<div class="esempio">
  <strong>✏️ ESEMPIO</strong><br>
  [Problema]<br>
  <em>Soluzione:</em>
  <ol>
    <li>Passo 1</li>
    <li>Passo 2</li>
  </ol>
</div>

6. **Tabelle (HTML funzionanti):**
<table class="styled-table">
  <thead>
    <tr><th>Colonna 1</th><th>Colonna 2</th></tr>
  </thead>
  <tbody>
    <tr><td>Dato 1</td><td>Dato 2</td></tr>
  </tbody>
</table>

7. **Punti chiave:**
<div class="punto-chiave">
  ⭐ <strong>Da ricordare:</strong> [Punto importante]
</div>

8. **Termini evidenziati:**
<span class="termine-chiave">termine importante</span>

REGOLE CONTENUTO:
- EMOJI CORRETTE: 📚 📖 📐 ✏️ ⭐ ⚠️ 💡 ✅ (MAI scrivere "(emoji)")
- Se non ci sono formule → NON mostrare sezione formule
- Se non ci sono teoremi → NON mostrare sezione teoremi  
- Includi TUTTI gli articoli di legge citati
- Includi TUTTE le definizioni importanti
- Includi date, nomi, riferimenti specifici
- Sezioni logiche e ben strutturate

ALLA FINE del riassunto esteso, aggiungi:
<div class="riassunto-ultra-cta">
  <h3>📚 Vuoi un riassunto ULTRA dettagliato?</h3>
  <p>Genera un riassunto completo capitolo per capitolo, con ogni dettaglio del documento.</p>
  <ul>
    <li>⏱️ Tempo di elaborazione: 20-40 minuti (in base alla lunghezza)</li>
    <li>🪙 Costo: 250 crediti</li>
    <li>📄 Potrai scaricarlo come PDF</li>
  </ul>
  <p><em>Puoi continuare a usare le altre funzioni mentre lo generiamo!</em></p>
  <button class="btn-ultra" onclick="generateUltraSummary()">
    🚀 Genera Riassunto Ultra (250 crediti)
  </button>
</div>

Testo da analizzare:
${text}

IMPORTANTE: Rispondi ESCLUSIVAMENTE con JSON valido nel formato:

{
  "riassunto_breve": "HTML del riassunto breve ben formattato",
  "riassunto_esteso": "HTML del riassunto esteso completo con tutte le formattazioni"
}`;
};

// Export anche la funzione originale per retrocompatibilità
export const createSummaryPrompt = createImprovedSummaryPrompt;