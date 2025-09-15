import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { SpinnerComponent } from '@components/spinner/spinner.component';
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
import { convertJsonToCsv } from 'src/app/helpers/json-csv-convert';
import { PdfService } from 'src/app/helpers/markdown-pdf-convert';

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
  private pdfService = inject(PdfService);

  visible = model(false);
  isLoading = signal<boolean>(false);
  analysis = rxResource({
    request: () => this.evalutationId(),
    loader: () => this.evaluationAnalysisService.getOne(this.evalutationId()),
  });
  copySuccess = signal<boolean>(false);
  isJsonExpanded = signal<boolean>(true);

  showDialog() {
    this.visible.set(true);
  }

  hiddenDialog() {
    this.visible.set(false);
    this.copySuccess.set(false);
    this.isJsonExpanded.set(true);
  }

  getTimestamp(): string {
    const date = this.analysis.value();
    if (!date) return '';

    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(date.created_at!));
  }

  getFormattedJson(): string {
    const analysisData = this.analysis.value()?.operative_view;
    if (!analysisData) return '';

    try {
      // Si operative_view ya es un string JSON, parsearlo primero
      const jsonData =
        typeof analysisData === 'string'
          ? JSON.parse(analysisData)
          : analysisData;

      return JSON.stringify(jsonData, null, 2);
    } catch {
      // Si no es JSON válido, devolver como string
      return analysisData;
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

  getAnalysisSize(): string {
    const analysis = this.analysis.value();
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
    const analysis = this.analysis.value()?.executive_view;
    if (!analysis) return;

    this.pdfService.markdownToPdf(analysis);
  }

  exportToCSV() {
    const analysis = this.analysis.value()?.operative_view;
    if (!analysis) return;

    try {
      // Parsear el JSON del operative_view
      const csvContent = convertJsonToCsv(analysis);

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'data.csv';
      link.click();
    } catch (error) {
      console.error('Error exporting to CSV:', error);
    }
  }
}
