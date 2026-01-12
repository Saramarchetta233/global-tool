export interface PromptConfig {
  language: string;
  text: string;
  targetLanguage?: string;
  documentLength?: number;
  pageCount?: number;
}

export const createFinalSummaryPrompt = ({ language, text, targetLanguage, documentLength, pageCount }: PromptConfig) => {
  // Calcola lunghezza target basata su pagine reali
  const pages = pageCount || Math.ceil((documentLength || text.length) / 3000);
  let targetWords = '';
  
  if (pages <= 20) {
    targetWords = 'MINIMO 2000+ parole';
  } else if (pages <= 50) {
    targetWords = 'MINIMO 4000+ parole';
  } else if (pages <= 100) {
    targetWords = 'MINIMO 7000+ parole';
  } else if (pages <= 200) {
    targetWords = 'MINIMO 12000+ parole';
  } else if (pages <= 500) {
    targetWords = 'MINIMO 20000+ parole';
  } else {
    targetWords = 'MINIMO 30000+ parole';
  }

  return `Sei un professore universitario che prepara materiale di studio. Devi creare un riassunto COMPLETO che SOSTITUISCA il libro per lo studente.

DOCUMENTO: ${pages} pagine circa - TARGET: ${targetWords}

OBIETTIVO CRITICO: Lo studente deve poter studiare SOLO da questo riassunto e passare l'esame.

REGOLE INDEROGABILI:
1. **FORMULE**: Trascrivi OGNI formula in LaTeX ($formula$). Spiega ogni variabile, esempi numerici.
2. **DEFINIZIONI**: Riporta le definizioni ESATTE + contesto + esempi pratici + errori comuni.
3. **TEOREMI**: Enunciato completo + dimostrazione + applicazioni + esempi concreti.
4. **TABELLE**: Ricrea TUTTE le tabelle + spiegazione di ogni colonna + interpretazione dei dati.
5. **ESEMPI**: MINIMO 2-3 esempi svolti per ogni concetto principale, con passaggi dettagliatissimi.
6. **ELENCHI**: Se ci sono N elementi, riporta TUTTI gli N elementi con spiegazioni complete.
7. **NOMI/DATE/ARTICOLI**: Tutti i riferimenti precisi + contesto storico/normativo + significato.

GENERA HTML STRUTTURATO CON QUESTA STRUTTURA ESATTA:

<h1>📚 [Titolo Documento]</h1>
<div class="section-intro">
  <h2>💎 Introduzione</h2>
  <p>[Paragrafo introduttivo completo]</p>
</div>
<div class="section-concepts">
  <h3>💡 Concetti Chiave</h3>
  <ul class="concept-list">
    <li><span class="term">[Termine]</span>: [Spiegazione dettagliata]</li>
    <li><span class="term">[Termine]</span>: [Spiegazione dettagliata]</li>
  </ul>
</div>
<div class="section-definitions">
  <h3>📖 Definizioni</h3>
  <div class="definition-box">
    <div class="definition-title">📌 DEFINIZIONE - [Nome]</div>
    <p class="definition-text">[Testo definizione esatta]</p>
    <p><span class="label">Contesto</span>: [Contesto applicazione]</p>
    <p><span class="label">Esempio</span>: [Esempio pratico]</p>
    <p><span class="label">Errori comuni</span>: [Errori da evitare]</p>
  </div>
</div>
<div class="section-formulas">
  <h3>🔢 Formule e Calcoli</h3>
  <div class="formula-box">
    <div class="formula-title">Formula principale:</div>
    <div class="formula">$[formula LaTeX]$</div>
    <p><span class="label">Dove</span>:</p>
    <ul>
      <li><code>[variabile]</code> = [significato]</li>
    </ul>
    <p><span class="label">Quando si usa</span>: [Spiegazione]</p>
    <p><span class="label">Esempio numerico</span>: [Esempio con numeri]</p>
  </div>
</div>
<div class="section-theorems">
  <h3>📐 Teoremi e Leggi</h3>
  <div class="theorem-box">
    <div class="theorem-title">🎯 TEOREMA - [Nome]</div>
    <p class="theorem-text">[Enunciato teorema]</p>
    <div class="proof">
      <p><strong>Dimostrazione:</strong></p>
      <ol>
        <li>[Passo 1]</li>
        <li>[Passo 2]</li>
      </ol>
    </div>
    <p><span class="label">Applicazioni pratiche</span>: [Dove si usa]</p>
  </div>
</div>
<div class="section-examples">
  <h3>✏️ Esempi Svolti</h3>
  <div class="example-box">
    <div class="example-title">ESEMPIO 1: [Titolo]</div>
    <p><span class="label">Problema</span>: [Testo problema]</p>
    <p><span class="label">Soluzione</span>:</p>
    <ol>
      <li><span class="step">Analisi</span>: [Analisi]</li>
      <li><span class="step">Dati</span>: [Dati]</li>
      <li><span class="step">Formula</span>: [Formula usata]</li>
      <li><span class="step">Calcolo</span>: [Calcolo]</li>
      <li><span class="step">Verifica</span>: [Verifica]</li>
      <li><span class="step">Risposta</span>: [Risposta finale]</li>
    </ol>
  </div>
</div>
<div class="section-tables">
  <h3>📊 Tabelle e Schemi</h3>
  <table class="styled-table">
    <thead>
      <tr>
        <th>[Colonna 1]</th>
        <th>[Colonna 2]</th>
        <th>[Colonna 3]</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>[Dato]</td>
        <td>[Dato]</td>
        <td>[Dato]</td>
      </tr>
    </tbody>
  </table>
  <p class="table-interpretation"><span class="label">Interpretazione</span>: [Spiegazione tabella]</p>
</div>
<div class="section-classifications">
  <h3>📋 Classificazioni ed Elenchi</h3>
  <div class="classification">
    <h4>[Nome Classificazione]</h4>
    <ol>
      <li>
        <span class="term">[Tipo 1]</span>
        <ul>
          <li>Caratteristiche: [...]</li>
          <li>Vantaggi: [...]</li>
          <li>Svantaggi: [...]</li>
          <li>Esempi: [...]</li>
        </ul>
      </li>
    </ol>
  </div>
</div>
<div class="section-cases">
  <h3>⚖️ Casi Pratici / Giurisprudenza</h3>
  <div class="case-box">
    <p><span class="label">Caso pratico</span>: [Descrizione caso]</p>
  </div>
</div>
<div class="section-connections">
  <h3>🔗 Collegamenti Logici</h3>
  <ul>
    <li>[Collegamento con altro argomento]</li>
  </ul>
</div>
<div class="section-exam">
  <h3>⭐ PUNTI CHIAVE PER L'ESAME</h3>
  <div class="exam-remember">
    <h4>DA RICORDARE ASSOLUTAMENTE:</h4>
    <ul>
      <li>[Punto chiave 1]</li>
      <li>[Punto chiave 2]</li>
    </ul>
  </div>
  <div class="exam-questions">
    <h4>DOMANDE TIPICHE D'ESAME:</h4>
    <ul>
      <li>[Domanda 1]</li>
      <li>[Domanda 2]</li>
    </ul>
  </div>
  <div class="exam-errors">
    <h4>ERRORI DA EVITARE:</h4>
    <ul>
      <li>[Errore 1]</li>
      <li>[Errore 2]</li>
    </ul>
  </div>
</div>

REGOLE IMPORTANTI:
- Genera SOLO HTML valido, niente Markdown
- Usa SEMPRE le classi CSS indicate
- Includi SOLO le sezioni che hanno contenuto reale (se non ci sono formule, ometti section-formulas)
- Per le formule matematiche usa $formula$ (verrà renderizzato con KaTeX)
- Ogni sezione deve essere completa e dettagliata

Testo da analizzare:
${text}

IMPORTANTE: Rispondi ESCLUSIVAMENTE con JSON valido nel formato:

{
  "riassunto_breve": "[panoramica di 1500-2500 parole con HTML strutturato]",
  "riassunto_esteso": "[riassunto completo di ${targetWords} con TUTTA la struttura HTML sopra descritta]"
}

ATTENZIONE PER JSON VALIDO:
- Esci tutti i caratteri HTML speciali (&lt; &gt; &quot; &amp;)
- NON usare simboli matematici speciali nel JSON (∑, ∞, ≤, ≥, ∈, ∂, ∫, etc.)
- Sostituisci simboli matematici con TESTO o usa formule LaTeX: "sommatoria di", "infinito", "minore uguale"
- Usa solo caratteri ASCII standard per garantire JSON valido

NOTA: Genera HTML pulito con le classi CSS esatte come specificato sopra.`;
};

// Export per retrocompatibilità
export const createSummaryPrompt = createFinalSummaryPrompt;