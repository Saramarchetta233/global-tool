import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { riassuntoBreve, riassuntoEsteso, format = 'html', isUltraSummary = false } = await request.json();

    if (!riassuntoBreve && !riassuntoEsteso) {
      return NextResponse.json({ error: 'Nessun riassunto fornito' }, { status: 400 });
    }

    const content = riassuntoEsteso || riassuntoBreve;
    
    if (format === 'html') {
      // Generate HTML document for PDF conversion
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${isUltraSummary ? 'Riassunto Ultra' : 'Riassunto'} - Studius AI</title>
          <style>
            body { 
              font-family: 'Times New Roman', serif; 
              line-height: 1.8; 
              margin: 2cm; 
              color: #333; 
              font-size: 12pt;
            }
            h1 { 
              color: #2d3748; 
              border-bottom: 3px solid #4f46e5; 
              padding-bottom: 15px; 
              margin-bottom: 30px;
              font-size: 24pt;
            }
            h2 { 
              color: #4f46e5; 
              margin-top: 35px; 
              margin-bottom: 20px;
              font-size: 18pt;
            }
            h3 { 
              color: #6366f1; 
              margin-top: 25px; 
              margin-bottom: 15px;
              font-size: 14pt;
            }
            .summary-section { 
              background: #f8fafc; 
              padding: 25px; 
              border-left: 5px solid #4f46e5; 
              margin: 25px 0;
              border-radius: 8px;
            }
            .highlight {
              background: #fef3c7;
              padding: 2px 4px;
              border-radius: 3px;
            }
            .footer { 
              position: fixed; 
              bottom: 2cm; 
              right: 2cm; 
              font-size: 10pt; 
              color: #718096; 
            }
            p {
              margin-bottom: 15px;
              text-align: justify;
            }
            .page-break { 
              page-break-before: always; 
            }
            @media print {
              body { margin: 1.5cm; }
              .summary-section { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <h1>${isUltraSummary ? '🚀 Riassunto Ultra' : '📚 Riassunto di Studio'} - Studius AI</h1>
          
          ${riassuntoBreve ? `
          <div class="summary-section">
            <h2>📝 Riassunto Breve</h2>
            <div>${riassuntoBreve.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong class="highlight">$1</strong>')}</div>
          </div>
          ` : ''}
          
          ${riassuntoEsteso && riassuntoEsteso !== riassuntoBreve ? `
          <div class="page-break"></div>
          <div class="summary-section">
            <h2>${isUltraSummary ? '🚀 Riassunto Ultra Dettagliato' : '📖 Riassunto Esteso'}</h2>
            <div>${riassuntoEsteso.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong class="highlight">$1</strong>')}</div>
          </div>
          ` : ''}
          
          <div class="footer">
            Generato da Studius AI - ${new Date().toLocaleDateString('it-IT')}
          </div>
        </body>
        </html>
      `;

      return new NextResponse(htmlContent, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `attachment; filename="${isUltraSummary ? 'riassunto-ultra-studius.html' : 'riassunto-studius.html'}"`,
          'Cache-Control': 'no-cache'
        }
      });
    }

    // Default: return plain text for now (can add DOCX generation later)
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'attachment; filename="riassunto-studius.txt"'
      }
    });

  } catch (error) {
    console.error('Error generating summary download:', error);
    return NextResponse.json(
      { error: 'Errore durante la generazione del download' }, 
      { status: 500 }
    );
  }
}