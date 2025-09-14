import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { SpinnerComponent } from '@components/spinner/spinner.component';
import { EvaluationAnalysis } from '@interfaces/evaluation-analysis';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideChartBar,
  lucideCheck,
  lucideChevronDown,
  lucideChevronUp,
  lucideCircleAlert,
  lucideCode,
  lucideCopy,
  lucideDownload,
  lucideRefreshCw,
  lucideSparkles,
  lucideTable,
} from '@ng-icons/lucide';
import { EvaluationAnalysisService } from '@services/evaluation-analysis.service';
import { MarkdownComponent } from 'ngx-markdown';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-evaluation-analysis',
  imports: [
    Dialog,
    SpinnerComponent,
    NgIcon,
    ButtonModule,
    Tooltip,
    MarkdownComponent,
    TabsModule,
  ],
  templateUrl: './evaluation-analysis.component.html',
  styleUrl: './evaluation-analysis.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    provideIcons({
      lucideSparkles,
      lucideDownload,
      lucideTable,
      lucideChartBar,
      lucideCode,
      lucideChevronUp,
      lucideChevronDown,
      lucideCopy,
      lucideCheck,
      lucideCircleAlert,
      lucideRefreshCw,
    }),
  ],
})
export class EvaluationAnalysisComponent {
  evalutationId = input.required<number>();

  private evaluationAnalysisService = inject(EvaluationAnalysisService);

  visible = model(false);
  isLoading = signal<boolean>(false);
  analysis = signal<EvaluationAnalysis | null>(null);
  copySuccess = signal<boolean>(false);
  isJsonExpanded = signal<boolean>(true);
  generatedAt = signal<Date | null>(null);

  showDialog() {
    this.visible.set(true);
    this.getAnalysis();
  }

  hiddenDialog() {
    this.visible.set(false);
    // Reset states
    this.copySuccess.set(false);
    this.isJsonExpanded.set(true);
  }

  getAnalysis() {
    this.isLoading.set(true);
    this.evaluationAnalysisService.getOne(this.evalutationId()).subscribe({
      next: data => {
        this.analysis.set(data);
        this.generatedAt.set(new Date());
        this.isLoading.set(false);
      },
      error: error => {
        console.error('Error getting evaluation analysis:', error);
        this.isLoading.set(false);
      },
    });
  }

  getTimestamp(): string {
    const date = this.generatedAt();
    if (!date) return '';

    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  }

  getFormattedJson(): string {
    const analysisData = this.analysis();
    if (!analysisData?.operative_view) return '';

    try {
      // Si operative_view ya es un string JSON, parsearlo primero
      const jsonData =
        typeof analysisData.operative_view === 'string'
          ? JSON.parse(analysisData.operative_view)
          : analysisData.operative_view;

      return JSON.stringify(jsonData, null, 2);
    } catch (error) {
      console.log('Error parsing JSON:', error);
      return analysisData.operative_view;
    }
  }

  async copyJsonToClipboard() {
    try {
      const jsonText = this.getFormattedJson();
      await navigator.clipboard.writeText(jsonText);
      this.copySuccess.set(true);

      // Reset después de 2 segundos
      setTimeout(() => {
        this.copySuccess.set(false);
      }, 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  }

  toggleJsonExpansion() {
    this.isJsonExpanded.set(!this.isJsonExpanded());
    // Aquí podrías implementar lógica para colapsar/expandir el JSON
    // Por ejemplo, usando una librería como json-viewer o implementando
    // tu propia lógica de colapso
  }

  getAnalysisSize(): string {
    const analysis = this.analysis();
    if (!analysis) return '0';

    const totalSize =
      (analysis.executive_view?.length || 0) +
      (this.getFormattedJson()?.length || 0);

    if (totalSize < 1000) {
      return totalSize.toString();
    } else if (totalSize < 1000000) {
      return `${(totalSize / 1000).toFixed(1)}K`;
    } else {
      return `${(totalSize / 1000000).toFixed(1)}M`;
    }
  }

  exportToPDF() {
    const analysis = this.analysis();
    if (!analysis) return;

    // Implementa la lógica de exportación a PDF
    // Podrías usar jsPDF o similar
    console.log('Exporting to PDF...', analysis);

    // Ejemplo básico con window.print (podrías mejorar esto)
    const printContent = `
      <html>
        <head>
          <title>Análisis IA - ${this.getTimestamp()}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin: 30px 0; }
            .json { background: #f5f5f5; padding: 20px; border-radius: 8px; white-space: pre-wrap; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🤖 Análisis IA</h1>
            <p>Generado: ${this.getTimestamp()}</p>
          </div>
          <div class="section">
            <h2>Vista Ejecutiva</h2>
            <div>${analysis.executive_view}</div>
          </div>
          <div class="section">
            <h2>Vista Operativa</h2>
            <div class="json">${this.getFormattedJson()}</div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  }

  exportToCSV() {
    const analysis = this.analysis();
    if (!analysis?.operative_view) return;

    try {
      // Intenta convertir el JSON a CSV
      const jsonData =
        typeof analysis.operative_view === 'string'
          ? JSON.parse(analysis.operative_view)
          : analysis.operative_view;

      // Función simple para convertir JSON a CSV
      type SimpleObject = Record<
        string,
        string | number | boolean | null | undefined
      >;

      type JsonToCsvInput = SimpleObject | SimpleObject[];

      const jsonToCSV = (obj: JsonToCsvInput): string => {
        if (Array.isArray(obj)) {
          if (obj.length === 0) return '';

          const headers = Object.keys(obj[0]);
          const csvHeaders = headers.join(',');
          const csvRows = obj.map((row: SimpleObject) =>
            headers
              .map(header => {
                const value = row[header];
                // Escapar comillas y comas
                if (
                  typeof value === 'string' &&
                  (value.includes(',') || value.includes('"'))
                ) {
                  return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
              })
              .join(',')
          );

          return [csvHeaders, ...csvRows].join('\n');
        } else {
          // Para objetos simples, crear CSV de clave-valor
          const entries = Object.entries(obj);
          return (
            'Key,Value\n' +
            entries.map(([key, value]) => `"${key}","${value}"`).join('\n')
          );
        }
      };

      const csvContent = jsonToCSV(jsonData);

      // Descargar archivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `analisis-${Date.now()}.csv`;
      link.click();
    } catch (error) {
      console.error('Error exporting to CSV:', error);
    }
  }
}
