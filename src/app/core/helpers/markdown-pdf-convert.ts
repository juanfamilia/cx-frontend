import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces';

(pdfMake as typeof pdfMake).vfs = pdfFonts.vfs;

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  public markdownToPdf(markdown: string) {
    const cleanedMarkdown = markdown.replace(
      /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
      ''
    );

    const lines = cleanedMarkdown.split('\n');
    const content: Content[] = [];

    // Convertir Markdown a pdfMake content
    lines.forEach(line => {
      if (line.startsWith('# ')) {
        content.push({ text: line.replace('# ', ''), style: 'header' });
      } else if (line.startsWith('## ')) {
        content.push({ text: line.replace('## ', ''), style: 'subheader' });
      } else if (line.match(/^\d+\./)) {
        content.push({ text: line, style: 'listItem', margin: [0, 2, 0, 2] });
      } else if (line.startsWith('- ')) {
        content.push({
          text: line.replace('- ', '• '),
          style: 'listItem',
          margin: [15, 1, 0, 1],
        });
      } else if (line.trim() === '') {
        // Saltar líneas vacías para que no haya espacio extra
      } else {
        content.push({ text: line, style: 'normal', margin: [0, 2, 0, 2] });
      }
    });

    // Documento con estilo profesional
    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageMargins: [40, 20, 40, 30], // reducir espacio superior
      content: [
        { text: 'Informe Ejecutivo', style: 'title', margin: [0, 0, 0, 10] },
        ...content,
      ],
      styles: {
        title: {
          fontSize: 22,
          bold: true,
          color: '#1F618D',
          margin: [0, 0, 0, 15],
        },
        header: {
          fontSize: 18,
          bold: true,
          color: '#2874A6',
          margin: [0, 10, 0, 8],
        },
        subheader: {
          fontSize: 14,
          bold: true,
          color: '#2E4053',
          margin: [0, 6, 0, 5],
        },
        listItem: { fontSize: 12, color: '#1C2833', margin: [0, 2, 0, 2] },
        normal: { fontSize: 12, color: '#000', lineHeight: 1.3 },
      },
      defaultStyle: { font: 'Roboto' },
      footer: (currentPage, pageCount) => ({
        text: `Página ${currentPage} de ${pageCount}`,
        alignment: 'center',
        fontSize: 10,
        margin: [0, 0, 0, 10],
        color: '#7F8C8D',
      }),
      background: () => {
        return {
          canvas: [{ type: 'rect', x: 0, y: 0, w: 595, h: 842, color: '#fff' }],
        };
      },
    };

    pdfMake.createPdf(docDefinition).open();
  }
}
