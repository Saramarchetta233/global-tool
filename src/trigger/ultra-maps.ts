import { task } from "@trigger.dev/sdk/v3";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

// Inizializza OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Inizializza Supabase Admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper per aggiornare processing_metadata senza sovrascrivere altri campi (es. ultra_summary)
async function updateProcessingMetadata(sessionId: string, newMetadata: Record<string, any>) {
  try {
    // 1. Leggi il metadata esistente
    const { data: session, error: readError } = await supabaseAdmin
      .from('tutor_sessions')
      .select('processing_metadata')
      .eq('id', sessionId)
      .single();

    if (readError) {
      console.error('❌ [updateProcessingMetadata] Error reading session:', readError);
      return;
    }

    const existingMetadata = session?.processing_metadata || {};

    // 2. Merge: mantieni i campi esistenti, aggiungi/aggiorna solo quelli nuovi
    const mergedMetadata = {
      ...existingMetadata,
      ...newMetadata
    };

    // 3. Aggiorna con il merge
    const { error: updateError } = await supabaseAdmin
      .from('tutor_sessions')
      .update({ processing_metadata: mergedMetadata })
      .eq('id', sessionId);

    if (updateError) {
      console.error('❌ [updateProcessingMetadata] Error updating session:', updateError);
      return;
    }

    // VERIFICA: Rileggi per confermare che l'update sia stato applicato
    const { data: verifySession } = await supabaseAdmin
      .from('tutor_sessions')
      .select('processing_metadata')
      .eq('id', sessionId)
      .single();

    const verifiedMeta = verifySession?.processing_metadata || {};
    console.log(`✅ [updateProcessingMetadata] VERIFIED in DB: current_section=${verifiedMeta.current_section}, total_sections=${verifiedMeta.total_sections}`);
  } catch (err) {
    console.error('❌ [updateProcessingMetadata] Exception:', err);
  }
}

// Prompt per generare mappa concettuale da una sezione
const createUltraMapSectionPrompt = (section: string, sectionNumber: number, totalSections: number, documentTitle: string) => {
  return `Sei un ESPERTO in mappe concettuali e visualizzazione della conoscenza. Analizza questa sezione e crea nodi per una mappa concettuale ULTRA-DETTAGLIATA.

DOCUMENTO: ${documentTitle} - Sezione ${sectionNumber} di ${totalSections}

📌 REGOLA FONDAMENTALE - ADATTATI AL CONTENUTO:
- Estrai SOLO concetti REALMENTE presenti nel testo
- Se ci sono formule/teoremi → creane nodi specifici con type "formula"
- Se ci sono definizioni → creane nodi con type "definition"
- Se ci sono esempi → creane nodi con type "example"
- Se ci sono processi/procedure → creane nodi con type "process"
- NON inventare concetti che non esistono nel testo

🎯 OBIETTIVO: Creare nodi che aiutino lo studente a VISUALIZZARE e MEMORIZZARE i concetti.

TESTO DA ANALIZZARE:
${section}

GENERA JSON con questa struttura:

{
  "section_nodes": [
    {
      "id": "s${sectionNumber}_n1",
      "title": "Concetto Principale (max 50 caratteri)",
      "description": "Spiegazione breve ma completa del concetto (1-2 frasi)",
      "type": "concept|definition|formula|example|process|theory|law",
      "priority": "high|medium|low",
      "keywords": ["parola1", "parola2"],
      "children": [
        {
          "id": "s${sectionNumber}_n1_c1",
          "title": "Sottoconcetto",
          "description": "Spiegazione del sottoconcetto",
          "type": "concept|definition|formula|example|process",
          "priority": "medium|low"
        }
      ]
    }
  ],
  "section_connections": [
    {
      "from": "s${sectionNumber}_n1",
      "to": "s${sectionNumber}_n2",
      "label": "relazione tra i concetti"
    }
  ],
  "section_summary": "Breve riassunto dei concetti chiave di questa sezione"
}

REGOLE:
- Ogni sezione deve avere 3-8 nodi principali
- Ogni nodo principale può avere 2-5 children
- I titoli devono essere BREVI ma SIGNIFICATIVI
- Le descrizioni devono essere UTILI per lo studio
- Includi TUTTI i concetti importanti della sezione
- Collega concetti correlati con connections

IMPORTANTE: Rispondi SOLO con JSON valido, senza markdown o testo aggiuntivo.`;
};

interface UltraMapNode {
  id: string;
  title: string;
  description?: string;
  type: string;
  priority: string;
  keywords?: string[];
  children?: UltraMapNode[];
}

interface UltraMapConnection {
  from: string;
  to: string;
  label: string;
}

interface UltraMapsPayload {
  sessionId: string;
  userId: string;
  newCreditBalance: number;
}

export const ultraMapsTask = task({
  id: "ultra-maps",
  // Massimo 1 ora di esecuzione (mappe sono più veloci dei riassunti)
  maxDuration: 3600,
  retry: {
    maxAttempts: 2,
    minTimeoutInMs: 5000,
    maxTimeoutInMs: 30000,
    factor: 2,
  },
  run: async (payload: UltraMapsPayload) => {
    const { sessionId, userId, newCreditBalance } = payload;

    console.log(`🗺️ [Trigger.dev] Ultra Maps Task started for session: ${sessionId}`);

    try {
      // 1. Recupera la sessione dal database
      const { data: session, error: sessionError } = await supabaseAdmin
        .from('tutor_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', userId)
        .single();

      if (sessionError || !session) {
        throw new Error('Sessione non trovata o non autorizzata');
      }

      // 2. Verifica che ci sia il testo PDF
      if (!session.pdf_text || session.pdf_text.length < 100) {
        throw new Error('Testo del documento non disponibile o troppo breve');
      }

      const fullText = session.pdf_text;
      const documentTitle = session.title || session.file_name || 'Documento';

      console.log(`📚 [Trigger.dev] Processing maps for: ${documentTitle}`);
      console.log(`📄 [Trigger.dev] Text length: ${fullText.length} characters`);

      // 3. Divisione adattiva del testo (simile a ultra-summary ma con sezioni più piccole)
      const documentLength = fullText.length;
      let targetSectionSize: number;
      let maxSections: number;

      // Per le mappe usiamo sezioni più piccole per avere nodi più precisi
      if (documentLength > 300000) {
        targetSectionSize = 5000;
        maxSections = 30;
      } else if (documentLength > 150000) {
        targetSectionSize = 6000;
        maxSections = 25;
      } else {
        targetSectionSize = 7000;
        maxSections = 20;
      }

      console.log(`📊 [Trigger.dev] Section size: ${targetSectionSize}, max sections: ${maxSections}`);

      // 4. Split del testo
      const sections: string[] = [];
      let paragraphs = fullText.split(/\n\s*\n/);

      if (paragraphs.length < 5 || paragraphs.some((p: string) => p.length > targetSectionSize * 2)) {
        paragraphs = fullText.split(/(?<=[.!?])\s+/);

        if (paragraphs.length < 10) {
          paragraphs = [];
          for (let i = 0; i < fullText.length; i += targetSectionSize) {
            paragraphs.push(fullText.slice(i, i + targetSectionSize));
          }
        }
      }

      let currentSection = '';

      for (const paragraph of paragraphs) {
        if (sections.length >= maxSections) {
          if (sections.length > 0) {
            sections[sections.length - 1] += '\n\n' + paragraph;
          }
          continue;
        }

        if (currentSection.length + paragraph.length > targetSectionSize && currentSection.length > 1000) {
          sections.push(currentSection.trim());
          currentSection = paragraph;
        } else {
          currentSection += (currentSection.length > 0 ? '\n\n' : '') + paragraph;
        }
      }

      if (currentSection.trim().length > 0) {
        sections.push(currentSection.trim());
      }

      console.log(`📊 [Trigger.dev] Divided into ${sections.length} sections for mapping`);

      // 5. Aggiorna SUBITO il total_sections nel database (così il frontend può mostrare progresso reale)
      await updateProcessingMetadata(sessionId, {
        ultra_maps_status: 'in_progress',
        current_section: 0,
        total_sections: sections.length,
        estimated_completion: new Date(Date.now() + sections.length * 2 * 60 * 1000).toISOString()
      });
      console.log(`📊 [ULTRA-v9] Initial metadata set: 0/${sections.length} sections (version v9)`);

      // 6. Processa ogni sezione con OpenAI
      const allNodes: UltraMapNode[] = [];
      const allConnections: UltraMapConnection[] = [];
      const sectionSummaries: string[] = [];

      for (let i = 0; i < sections.length; i++) {
        const sectionNumber = i + 1;
        console.log(`🔄 [ULTRA-v9] Processing map section ${sectionNumber}/${sections.length}`);

        // Aggiorna progresso nel database PRIMA di elaborare
        console.log(`🔄 [ULTRA-v9] >>> ABOUT TO UPDATE DB: section ${sectionNumber}/${sections.length}`);
        try {
          await updateProcessingMetadata(sessionId, {
            current_section: sectionNumber,
            estimated_completion: new Date(Date.now() + (sections.length - sectionNumber) * 2 * 60 * 1000).toISOString()
          });
          console.log(`✅ [ULTRA-v9] <<< DB UPDATE DONE: section ${sectionNumber}/${sections.length}`);
        } catch (metaError) {
          console.error(`❌ [ULTRA-v9] METADATA UPDATE FAILED:`, metaError);
        }

        try {
          const prompt = createUltraMapSectionPrompt(
            sections[i],
            sectionNumber,
            sections.length,
            documentTitle
          );

          const startTime = Date.now();

          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
            max_tokens: 4000,
          });

          const elapsed = Date.now() - startTime;
          const content = response.choices[0].message.content || '';

          // Parse JSON response
          try {
            let cleanContent = content.trim()
              .replace(/```json\s*/gi, '')
              .replace(/```\s*$/g, '')
              .trim();

            const firstBrace = cleanContent.indexOf('{');
            const lastBrace = cleanContent.lastIndexOf('}');

            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
              cleanContent = cleanContent.substring(firstBrace, lastBrace + 1);
            }

            const sectionData = JSON.parse(cleanContent);

            if (sectionData.section_nodes && Array.isArray(sectionData.section_nodes)) {
              allNodes.push(...sectionData.section_nodes);
            }

            if (sectionData.section_connections && Array.isArray(sectionData.section_connections)) {
              allConnections.push(...sectionData.section_connections);
            }

            if (sectionData.section_summary) {
              sectionSummaries.push(`Sezione ${sectionNumber}: ${sectionData.section_summary}`);
            }

            console.log(`✅ [Trigger.dev] Section ${sectionNumber} completed in ${elapsed}ms: ${sectionData.section_nodes?.length || 0} nodes`);

          } catch (parseError) {
            console.error(`⚠️ [Trigger.dev] JSON parse error for section ${sectionNumber}:`, parseError);
            // Crea un nodo placeholder per la sezione
            allNodes.push({
              id: `s${sectionNumber}_fallback`,
              title: `Sezione ${sectionNumber}`,
              description: `Contenuto della sezione ${sectionNumber} del documento`,
              type: 'concept',
              priority: 'medium'
            });
          }

          // Delay tra le richieste per rispettare i rate limits
          if (i < sections.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }

        } catch (sectionError) {
          console.error(`❌ [Trigger.dev] Error processing map section ${sectionNumber}:`, sectionError);
          // Crea un nodo placeholder per la sezione fallita
          allNodes.push({
            id: `s${sectionNumber}_error`,
            title: `Sezione ${sectionNumber} - Errore`,
            description: `Si è verificato un errore nell'elaborazione di questa sezione`,
            type: 'concept',
            priority: 'low'
          });
        }
      }

      console.log(`🎉 [Trigger.dev] All ${sections.length} sections processed for maps`);

      // 6. Crea la struttura finale della mappa
      // Raggruppa i nodi per tipo/priorità per creare una struttura gerarchica
      const groupedNodes = organizeNodesIntoHierarchy(allNodes, documentTitle);

      // Aggiungi connessioni tra sezioni (collegando concetti simili)
      const crossSectionConnections = createCrossSectionConnections(allNodes);
      allConnections.push(...crossSectionConnections);

      const ultraMapData = {
        nodes: groupedNodes,
        connections: allConnections,
        stats: {
          total_nodes: countAllNodes(groupedNodes),
          total_connections: allConnections.length,
          sections_processed: sections.length,
          max_depth: calculateMaxDepth(groupedNodes),
          generated_at: new Date().toISOString()
        },
        section_summaries: sectionSummaries
      };

      // 7. Salva nel database
      console.log(`💾 [Trigger.dev] Saving maps to database for session: ${sessionId}`);

      // Prima aggiorna processing_metadata con merge
      await updateProcessingMetadata(sessionId, {
        ultra_maps_status: 'completed',
        ultra_maps_started_at: new Date().toISOString(),
        ultra_maps_completed_at: new Date().toISOString(),
        total_sections: sections.length,
        total_nodes: ultraMapData.stats.total_nodes
      });

      // Poi salva la mappa
      const { data: updateData, error: saveError } = await supabaseAdmin
        .from('tutor_sessions')
        .update({
          mappa_ultra: ultraMapData
        })
        .eq('id', sessionId)
        .select('id, mappa_ultra');

      if (saveError) {
        console.error(`❌ [Trigger.dev] Save error:`, saveError);
        throw new Error('Errore nel salvare la Mappa Ultra');
      }

      console.log(`✅ [Trigger.dev] Save result:`, updateData ? `Updated ${updateData.length} rows` : 'No data returned');

      console.log(`🎉 [Trigger.dev] Ultra Maps completed! ${ultraMapData.stats.total_nodes} nodes`);

      return {
        success: true,
        sessionId,
        sectionsProcessed: sections.length,
        totalNodes: ultraMapData.stats.total_nodes,
        newCreditBalance,
      };

    } catch (error) {
      console.error('❌ [Trigger.dev] Ultra Maps Task Error:', error);

      // Marca come fallito nel database (merge per non sovrascrivere ultra_summary)
      await updateProcessingMetadata(sessionId, {
        ultra_maps_status: 'failed',
        ultra_maps_error: error instanceof Error ? error.message : 'Errore sconosciuto',
        ultra_maps_failed_at: new Date().toISOString()
      });

      throw error;
    }
  },
});

// Funzione per organizzare i nodi in una struttura gerarchica
function organizeNodesIntoHierarchy(nodes: UltraMapNode[], documentTitle: string): UltraMapNode[] {
  // Raggruppa per tipo
  const conceptNodes = nodes.filter(n => n.type === 'concept' || n.type === 'theory');
  const definitionNodes = nodes.filter(n => n.type === 'definition');
  const formulaNodes = nodes.filter(n => n.type === 'formula');
  const exampleNodes = nodes.filter(n => n.type === 'example');
  const processNodes = nodes.filter(n => n.type === 'process');
  const lawNodes = nodes.filter(n => n.type === 'law');
  const otherNodes = nodes.filter(n => !['concept', 'theory', 'definition', 'formula', 'example', 'process', 'law'].includes(n.type));

  const hierarchy: UltraMapNode[] = [
    {
      id: 'root',
      title: documentTitle,
      description: 'Mappa concettuale completa del documento',
      type: 'concept',
      priority: 'high',
      children: []
    }
  ];

  // Aggiungi categorie solo se hanno nodi
  if (conceptNodes.length > 0) {
    hierarchy[0].children!.push({
      id: 'cat_concepts',
      title: 'Concetti Chiave',
      description: 'I concetti fondamentali del documento',
      type: 'concept',
      priority: 'high',
      children: conceptNodes.slice(0, 15) // Limita per non sovraccaricare
    });
  }

  if (definitionNodes.length > 0) {
    hierarchy[0].children!.push({
      id: 'cat_definitions',
      title: 'Definizioni',
      description: 'Termini e definizioni importanti',
      type: 'definition',
      priority: 'high',
      children: definitionNodes.slice(0, 15)
    });
  }

  if (formulaNodes.length > 0) {
    hierarchy[0].children!.push({
      id: 'cat_formulas',
      title: 'Formule e Calcoli',
      description: 'Formule matematiche e calcoli',
      type: 'formula',
      priority: 'high',
      children: formulaNodes.slice(0, 10)
    });
  }

  if (lawNodes.length > 0) {
    hierarchy[0].children!.push({
      id: 'cat_laws',
      title: 'Leggi e Normative',
      description: 'Articoli di legge e normative',
      type: 'law',
      priority: 'high',
      children: lawNodes.slice(0, 15)
    });
  }

  if (processNodes.length > 0) {
    hierarchy[0].children!.push({
      id: 'cat_processes',
      title: 'Processi e Procedure',
      description: 'Procedure e flussi di lavoro',
      type: 'process',
      priority: 'medium',
      children: processNodes.slice(0, 10)
    });
  }

  if (exampleNodes.length > 0) {
    hierarchy[0].children!.push({
      id: 'cat_examples',
      title: 'Esempi Pratici',
      description: 'Esempi e casi pratici',
      type: 'example',
      priority: 'medium',
      children: exampleNodes.slice(0, 10)
    });
  }

  if (otherNodes.length > 0) {
    hierarchy[0].children!.push({
      id: 'cat_other',
      title: 'Altri Contenuti',
      description: 'Altri contenuti rilevanti',
      type: 'concept',
      priority: 'low',
      children: otherNodes.slice(0, 10)
    });
  }

  return hierarchy;
}

// Funzione per creare connessioni tra sezioni basate su keywords simili
function createCrossSectionConnections(nodes: UltraMapNode[]): UltraMapConnection[] {
  const connections: UltraMapConnection[] = [];

  // Trova nodi con keywords simili e collegali
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const node1 = nodes[i];
      const node2 = nodes[j];

      if (node1.keywords && node2.keywords) {
        const commonKeywords = node1.keywords.filter(k =>
          node2.keywords!.some(k2 => k.toLowerCase() === k2.toLowerCase())
        );

        if (commonKeywords.length > 0) {
          connections.push({
            from: node1.id,
            to: node2.id,
            label: `Collegamento: ${commonKeywords[0]}`
          });
        }
      }
    }
  }

  return connections.slice(0, 20); // Limita il numero di connessioni
}

// Conta tutti i nodi ricorsivamente
function countAllNodes(nodes: UltraMapNode[]): number {
  let count = 0;
  for (const node of nodes) {
    count++;
    if (node.children) {
      count += countAllNodes(node.children);
    }
  }
  return count;
}

// Calcola la profondità massima
function calculateMaxDepth(nodes: UltraMapNode[], currentDepth: number = 1): number {
  let maxDepth = currentDepth;
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      const childDepth = calculateMaxDepth(node.children, currentDepth + 1);
      maxDepth = Math.max(maxDepth, childDepth);
    }
  }
  return maxDepth;
}
