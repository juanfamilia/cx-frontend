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
import { lucideSparkles } from '@ng-icons/lucide';
import { EvaluationAnalysisService } from '@services/evaluation-analysis.service';
import { MarkdownComponent } from 'ngx-markdown';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
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
  ],
  templateUrl: './evaluation-analysis.component.html',
  styleUrl: './evaluation-analysis.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ lucideSparkles })],
})
export class EvaluationAnalysisComponent {
  evalutationId = input.required<number>();

  private evaluationAnalysisService = inject(EvaluationAnalysisService);

  visible = model(false);
  isLoading = signal<boolean>(false);
  analysis = signal<EvaluationAnalysis | null>(null);

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
        this.isLoading.set(false);
      },
      error: error => {
        console.error('Error getting evaluation analysis:', error);
        this.isLoading.set(false);
      },
    });
  }
}
