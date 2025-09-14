import { DatePipe } from '@angular/common';
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
import { lucideClipboard, lucideSparkles } from '@ng-icons/lucide';
import { EvaluationAnalysisService } from '@services/evaluation-analysis.service';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
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
    NgxJsonViewerModule,
    DatePipe,
  ],
  templateUrl: './evaluation-analysis.component.html',
  styleUrl: './evaluation-analysis.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ lucideSparkles, lucideClipboard })],
})
export class EvaluationAnalysisComponent {
  evalutationId = input.required<number>();

  private evaluationAnalysisService = inject(EvaluationAnalysisService);

  visible = model(false);
  isLoading = signal<boolean>(false);
  analysis = signal<EvaluationAnalysis | null>(null);

  parsedJson = {};

  showDialog() {
    this.visible.set(true);
    this.getAnalysis();
  }

  hiddenDialog() {
    this.visible.set(false);
  }

  getAnalysis() {
    this.isLoading.set(true);
    this.evaluationAnalysisService.getOne(this.evalutationId()).subscribe({
      next: data => {
        this.analysis.set(data);
        try {
          this.parsedJson = JSON.parse(data.operative_view);
        } catch {
          this.parsedJson = { raw: data.operative_view };
        }
        this.isLoading.set(false);
      },
      error: error => {
        console.error('Error getting evaluation analysis:', error);
        this.isLoading.set(false);
      },
    });
  }

  copyJson() {
    navigator.clipboard.writeText(JSON.stringify(this.parsedJson, null, 2));
  }

  expandAll() {
    // hack: ngx-json-viewer no trae expandAll, forzamos [expanded]=true
    this.parsedJson = { ...this.parsedJson }; // trigger rerender
  }

  exportCsv() {
    console.log('TODO: Exportar CSV');
  }

  exportPdf() {
    console.log('TODO: Exportar PDF');
  }
}
