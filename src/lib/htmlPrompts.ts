export interface PromptConfig {
  language: string;
  text: string;
  targetLanguage?: string;
  documentLength?: number;
  pageCount?: number;
}

export const createHtmlSummaryPrompt = ({ language, text, targetLanguage, documentLength, pageCount }: PromptConfig) => {
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

FORMATTAZIONE HTML CON STILI INLINE:

<div style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 1000px; margin: 0 auto;">

<h1 style="color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; margin-bottom: 30px;">
📚 [TITOLO PRINCIPALE]
</h1>

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
<h2 style="margin: 0; color: white;">🔷 Sezione [Numero] - [Titolo Sezione]</h2>
</div>

<div style="background-color: #e8f4fd; border-left: 5px solid #3498db; padding: 15px; margin: 15px 0; border-radius: 5px;">
<h3 style="color: #2980b9; margin-top: 0;">💡 Concetti Chiave</h3>
<p>[Spiegazione completa e dettagliata dei concetti fondamentali]</p>
</div>

<div style="background-color: #fff3cd; border: 2px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
<h4 style="color: #856404; margin-top: 0; font-size: 18px;">📖 DEFINIZIONE - [Nome]</h4>
<p style="font-weight: bold; font-size: 16px; color: #333; margin: 10px 0;">[Definizione esatta dalla fonte]</p>
<p style="margin: 5px 0;"><strong style="color: #6c757d;">Contesto:</strong> [Dove si applica]</p>
<p style="margin: 5px 0;"><strong style="color: #6c757d;">Esempio:</strong> [Caso pratico]</p>
<p style="margin: 5px 0;"><strong style="color: #dc3545;">⚠️ Errori comuni:</strong> [Cosa evitare]</p>
</div>

<div style="background-color: #f8f9fa; border: 2px solid #6c757d; padding: 20px; margin: 20px 0; border-radius: 10px;">
<h4 style="color: #495057; margin-top: 0;">🧮 Formule e Calcoli</h4>
<p style="text-align: center; font-size: 20px; margin: 15px 0; padding: 10px; background-color: white; border-radius: 5px;">
$[formula LaTeX]$
</p>
<p><strong>Dove:</strong></p>
<ul style="margin: 10px 0; padding-left: 20px;">
<li style="margin: 5px 0;"><code style="background-color: #e9ecef; padding: 2px 6px; border-radius: 3px;">x</code> = [significato preciso]</li>
<li style="margin: 5px 0;"><code style="background-color: #e9ecef; padding: 2px 6px; border-radius: 3px;">y</code> = [significato preciso]</li>
</ul>
<p><strong style="color: #28a745;">Quando si usa:</strong> [contesto di applicazione]</p>
<div style="background-color: #d1ecf1; padding: 10px; border-radius: 5px; margin-top: 10px;">
<strong style="color: #0c5460;">📊 Esempio numerico:</strong>
<ul style="margin: 5px 0; padding-left: 20px;">
<li>Dato: [valori]</li>
<li>Calcolo: [passaggi]</li>
<li>Risultato: [soluzione]</li>
</ul>
</div>
</div>

<div style="background-color: #d4edda; border: 2px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 10px;">
<h4 style="color: #155724; margin-top: 0;">📐 TEOREMA [Nome]</h4>
<p style="font-weight: bold; font-style: italic; background-color: white; padding: 10px; border-radius: 5px;">[Enunciato completo]</p>
<div style="margin-top: 15px;">
<p style="color: #155724;"><strong>Dimostrazione:</strong></p>
<ol style="margin: 10px 0; padding-left: 20px;">
<li style="margin: 5px 0;">[Passo 1 con spiegazione]</li>
<li style="margin: 5px 0;">[Passo 2 con spiegazione]</li>
<li style="margin: 5px 0;">[Conclusione]</li>
</ol>
<p style="color: #155724;"><strong>Applicazioni pratiche:</strong></p>
<ul style="margin: 10px 0; padding-left: 20px;">
<li style="margin: 5px 0;">[Uso 1]</li>
<li style="margin: 5px 0;">[Uso 2]</li>
</ul>
</div>
</div>

<div style="background-color: #f0f8ff; border: 2px solid #007bff; padding: 20px; margin: 25px 0; border-radius: 10px;">
<h4 style="color: #004085; margin-top: 0;">✏️ ESEMPIO SVOLTO</h4>
<div style="background-color: #ffffff; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #007bff;">
<h5 style="color: #004085; margin-top: 0;">📝 Problema: [Titolo problema]</h5>
<p style="font-weight: bold;">[Testo completo del problema]</p>
</div>
<div style="background-color: #e7f3ff; padding: 15px; border-radius: 5px; margin: 10px 0;">
<h5 style="color: #004085; margin-top: 0;">🔧 Soluzione:</h5>
<ol style="margin: 10px 0; padding-left: 25px; line-height: 1.8;">
<li style="margin: 8px 0;"><strong style="color: #0056b3;">Analisi:</strong> [Cosa ci chiedono]</li>
<li style="margin: 8px 0;"><strong style="color: #0056b3;">Dati:</strong> [Informazioni disponibili]</li>
<li style="margin: 8px 0;"><strong style="color: #0056b3;">Formula:</strong> [Quale usare e perché]</li>
<li style="margin: 8px 0;"><strong style="color: #0056b3;">Calcolo:</strong> [Passaggi dettagliati]</li>
<li style="margin: 8px 0;"><strong style="color: #0056b3;">Verifica:</strong> [Controllo del risultato]</li>
<li style="margin: 8px 0;"><strong style="color: #28a745;">✅ Risposta:</strong> [Soluzione finale]</li>
</ol>
</div>
</div>

<div style="background-color: #ffffff; border: 2px solid #6c757d; padding: 20px; margin: 20px 0; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
<h4 style="color: #495057; margin-top: 0;">📊 Tabelle e Dati</h4>
<table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px;">
<thead>
<tr style="background-color: #495057; color: white;">
<th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Elemento</th>
<th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Valore</th>
<th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Descrizione</th>
<th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Note</th>
</tr>
</thead>
<tbody>
<tr style="background-color: #f8f9fa;">
<td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">[Dato 1]</td>
<td style="padding: 10px; border: 1px solid #ddd;">[Valore 1]</td>
<td style="padding: 10px; border: 1px solid #ddd;">[Spiegazione dettagliata]</td>
<td style="padding: 10px; border: 1px solid #ddd;">[Considerazioni]</td>
</tr>
<tr style="background-color: #ffffff;">
<td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">[Dato 2]</td>
<td style="padding: 10px; border: 1px solid #ddd;">[Valore 2]</td>
<td style="padding: 10px; border: 1px solid #ddd;">[Spiegazione dettagliata]</td>
<td style="padding: 10px; border: 1px solid #ddd;">[Considerazioni]</td>
</tr>
</tbody>
</table>
<div style="background-color: #e9ecef; padding: 10px; border-radius: 5px; margin-top: 15px;">
<p style="margin: 0;"><strong>📈 Interpretazione:</strong></p>
<ul style="margin: 10px 0; padding-left: 20px;">
<li>[Significato dei dati]</li>
<li>[Trend osservabili]</li>
<li>[Implicazioni pratiche]</li>
</ul>
</div>
</div>

<div style="background-color: #fff3cd; border: 3px solid #ffc107; padding: 25px; margin: 25px 0; border-radius: 15px; box-shadow: 0 4px 10px rgba(255,193,7,0.2);">
<h4 style="color: #856404; margin-top: 0; font-size: 20px;">⭐ PUNTI CHIAVE PER L'ESAME</h4>
<div style="background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h5 style="color: #d63384; margin-top: 0;">🎯 DA RICORDARE ASSOLUTAMENTE:</h5>
<ul style="list-style-type: none; padding: 0;">
<li style="margin: 10px 0; padding: 8px; background-color: #d1f2eb; border-left: 4px solid #20c997; border-radius: 4px;">✅ <strong>[Punto cruciale 1]</strong> - [Spiegazione]</li>
<li style="margin: 10px 0; padding: 8px; background-color: #d1f2eb; border-left: 4px solid #20c997; border-radius: 4px;">✅ <strong>[Punto cruciale 2]</strong> - [Spiegazione]</li>
<li style="margin: 10px 0; padding: 8px; background-color: #d1f2eb; border-left: 4px solid #20c997; border-radius: 4px;">✅ <strong>[Punto cruciale 3]</strong> - [Spiegazione]</li>
</ul>
</div>
<div style="background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h5 style="color: #dc3545; margin-top: 0;">🔥 DOMANDE TIPICHE D'ESAME:</h5>
<ul style="list-style-type: none; padding: 0;">
<li style="margin: 10px 0; padding: 8px; background-color: #f8d7da; border-left: 4px solid #dc3545; border-radius: 4px;">❓ <strong>[Possibile domanda 1]</strong> → [Come rispondere]</li>
<li style="margin: 10px 0; padding: 8px; background-color: #f8d7da; border-left: 4px solid #dc3545; border-radius: 4px;">❓ <strong>[Possibile domanda 2]</strong> → [Come rispondere]</li>
</ul>
</div>
<div style="background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
<h5 style="color: #fd7e14; margin-top: 0;">⚠️ ERRORI DA EVITARE:</h5>
<ul style="list-style-type: none; padding: 0;">
<li style="margin: 10px 0; padding: 8px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">❌ <strong>[Errore comune 1]</strong> → [Correzione]</li>
<li style="margin: 10px 0; padding: 8px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">❌ <strong>[Errore comune 2]</strong> → [Correzione]</li>
</ul>
</div>
</div>

</div>

---

QUALITÀ > VELOCITÀ:
- Ogni concetto deve avere almeno 2 esempi pratici
- Ogni formula deve essere accompagnata da esempio numerico
- Ogni definizione deve avere contesto e casi d'uso
- Usa TUTTI i colori e stili sopra per rendere tutto leggibile

Testo da analizzare:
${text}

IMPORTANTE: Rispondi ESCLUSIVAMENTE con JSON valido nel formato:

{
  "riassunto_breve": "[panoramica di 1500-2500 parole con HTML colorato]",
  "riassunto_esteso": "[riassunto completo di ${targetWords} con TUTTO l'HTML colorato sopra descritto]"
}

NOTA: USA l'HTML con stili inline sopra descritto per OGNI sezione. OGNI elemento deve essere colorato e ben formattato.`;
};

// Export per retrocompatibilità
export const createSummaryPrompt = createHtmlSummaryPrompt;