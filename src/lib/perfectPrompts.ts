export interface PromptConfig {
  language: string;
  text: string;
  targetLanguage?: string;
  documentLength?: number;
  pageCount?: number;
}

export const createPerfectSummaryPrompt = ({ language, text, targetLanguage, documentLength, pageCount }: PromptConfig) => {
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

REGOLE INDEROGABILI PER CONTENUTO RICCO:
1. **FORMULE**: Trascrivi OGNI formula in LaTeX ($formula$). Spiega ogni variabile, quando si usa, esempi numerici.
2. **DEFINIZIONI**: Riporta le definizioni ESATTE + contesto + esempi pratici + errori comuni.
3. **TEOREMI**: Enunciato completo + dimostrazione + applicazioni + esempi concreti.
4. **TABELLE**: Ricrea TUTTE le tabelle + spiegazione di ogni colonna + interpretazione dei dati.
5. **ESEMPI**: MINIMO 2-3 esempi svolti per ogni concetto principale, con passaggi dettagliatissimi.
6. **ELENCHI**: Se ci sono N elementi, riporta TUTTI gli N elementi con spiegazioni complete.
7. **NOMI/DATE/ARTICOLI**: Tutti i riferimenti precisi + contesto storico/normativo + significato.
8. **GRAFICI**: Descrizione dettagliata + significato di ogni asse + trend + interpretazione pratica.
9. **PROCESSI**: Ogni processo step-by-step con spiegazione del perché di ogni passo.
10. **CASI PRATICI**: Situazioni reali, problemi risolti, applicazioni concrete.
11. **COLLEGAMENTI**: Come ogni concetto si lega agli altri, cause-effetti, dipendenze.
12. **APPROFONDIMENTI**: Background storico, evoluzione del concetto, diverse scuole di pensiero.

STRUTTURA PER OGNI SEZIONE:

## [Numero] - [Titolo Sezione]

### Concetti Chiave
[Spiegazione completa dei concetti fondamentali]

### Definizioni
> **DEFINIZIONE - [Nome]**: [testo esatto dalla fonte]

### Formule Principali
$[formula]$

Dove:
- $x$ = [significato preciso]
- $y$ = [significato preciso]

Quando si usa: [contesto di applicazione]

### Teoremi e Leggi
> **TEOREMA/LEGGE [Nome]**: [enunciato completo]
> 
> *Dimostrazione/Spiegazione*: [passi chiave o logica]

### Esempi Svolti
**Esempio [numero]**: [problema completo]

*Soluzione*:
1. [passo 1 dettagliato]
2. [passo 2 dettagliato]
3. [risultato finale]

### Tabelle e Schemi
| Elemento | Valore | Descrizione |
|----------|--------|-------------|
| [dato 1] | [valore 1] | [spiegazione 1] |

### Classificazioni ed Elenchi
[Se il testo elenca 5 tipi di qualcosa, riporta TUTTI e 5 con spiegazioni]

### Casi Pratici / Giurisprudenza
[Per diritto: sentenze e principi]
[Per medicina: casi clinici]
[Per economia: esempi reali]

### Collegamenti Logici
[Come questa sezione si collega alle precedenti e successive]

### Punti Chiave per l'Esame
- ✓ [punto cruciale 1]
- ✓ [punto cruciale 2]
- ✓ [possibile domanda d'esame]

---

QUALITÀ > VELOCITÀ:
- Meglio riassunto lungo e completo che corto e inutile
- Ogni formula deve essere spiegata
- Ogni definizione deve essere precisa
- Ogni esempio deve essere dettagliato

FORMATTAZIONE HTML AVANZATA OBBLIGATORIA:

1. **Headers sezioni:**
<div class="section-header">
  <h2>📚 Sezione [Numero] - [Titolo]</h2>
</div>

2. **Definizioni evidenziate:**
<div class="definition-box">
  <h4>📖 DEFINIZIONE - [Nome]</h4>
  <p><strong>[Definizione esatta]</strong></p>
</div>

3. **Formule matematiche:**
<div class="formula-box">
  <p class="formula">$[formula LaTeX]$</p>
  <div class="formula-explanation">
    <p><strong>Dove:</strong></p>
    <ul>
      <li><code>x</code> = [significato]</li>
      <li><code>y</code> = [significato]</li>
    </ul>
    <p><strong>Quando si usa:</strong> [contesto]</p>
  </div>
</div>

4. **Teoremi evidenziati:**
<div class="theorem-box">
  <h4>📐 TEOREMA - [Nome]</h4>
  <p><strong>[Enunciato completo]</strong></p>
  <div class="proof">
    <p><em>Dimostrazione:</em></p>
    <p>[Passi della dimostrazione]</p>
  </div>
</div>

5. **Esempi pratici:**
<div class="example-box">
  <h4>✏️ ESEMPIO SVOLTO</h4>
  <div class="problem">
    <p><strong>Problema:</strong> [Testo del problema]</p>
  </div>
  <div class="solution">
    <p><strong>Soluzione:</strong></p>
    <ol>
      <li>[Passo 1 dettagliato]</li>
      <li>[Passo 2 dettagliato]</li>
      <li>[Risultato finale]</li>
    </ol>
  </div>
</div>

6. **Tabelle belle:**
<div class="styled-table">
  <table>
    <thead>
      <tr>
        <th>[Colonna 1]</th>
        <th>[Colonna 2]</th>
        <th>[Colonna 3]</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>[Dato 1]</strong></td>
        <td>[Valore 1]</td>
        <td>[Descrizione 1]</td>
      </tr>
    </tbody>
  </table>
</div>

7. **Punti chiave evidenziati:**
<div class="key-points">
  <h4>⭐ PUNTI CHIAVE PER L'ESAME</h4>
  <ul class="exam-points">
    <li><strong>[Punto cruciale 1]</strong> - [Spiegazione]</li>
    <li><strong>[Punto cruciale 2]</strong> - [Spiegazione]</li>
    <li><strong>[Possibile domanda d'esame]</strong> - [Come rispondere]</li>
  </ul>
</div>

8. **Evidenziazioni importanti:**
<div class="highlight-box">
  <p>💡 <strong>IMPORTANTE:</strong> [Concetto da ricordare assolutamente]</p>
</div>

<div class="warning-box">
  <p>⚠️ <strong>ATTENZIONE:</strong> [Errore comune da evitare]</p>
</div>

9. **Termini tecnici:**
<span class="term-highlight">[termine tecnico]</span>

10. **Collegamenti logici:**
<div class="connection-box">
  <h4>🔗 COLLEGAMENTI</h4>
  <p>Questa sezione si collega a: [riferimenti ad altre sezioni]</p>
</div>

FORMATO OUTPUT - Due riassunti:

1. **RIASSUNTO BREVE** (1500-2500 parole):
   - Panoramica generale del documento
   - Concetti chiave evidenziati
   - Definizioni principali
   - Formule essenziali
   - Punti cruciali per l'esame

2. **RIASSUNTO ESTESO** (${targetWords}):
   - Segue la struttura sopra descritta
   - Include TUTTO: formule, esempi, tabelle
   - Sostituisce completamente il libro
   - Organizzato per sezioni logiche

Testo da analizzare:
${text}

IMPORTANTE: Rispondi ESCLUSIVAMENTE con JSON valido nel formato:

{
  "riassunto_breve": "[riassunto breve con HTML e formule LaTeX]",
  "riassunto_esteso": "[riassunto esteso completo con tutta la formattazione HTML sopra descritta]"
}`;
};

// Export anche per retrocompatibilità
export const createSummaryPrompt = createPerfectSummaryPrompt;