import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { InputSelectComponent } from '@components/inputs/input-select/input-select.component';
import { InputTextareaComponent } from '@components/inputs/input-textarea/input-textarea.component';
import { provideIcons } from '@ng-icons/core';
import { lucideClipboardCheck } from '@ng-icons/lucide';
import { EvaluationService } from '@services/evaluation.service';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { STATUS } from 'src/app/constants/evaluationStatus.constants';

@Component({
  selector: 'app-evaluation-change-status',
  imports: [
    ReactiveFormsModule,
    Dialog,
    ButtonModule,
    InputSelectComponent,
    InputTextareaComponent,
  ],
  templateUrl: './evaluation-change-status.component.html',
  styleUrl: './evaluation-change-status.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ lucideClipboardCheck })],
})
export class EvaluationChangeStatusComponent implements OnInit {
  evaluation_id = input.required<number>();

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private evaluationService = inject(EvaluationService);

  visible = model(false);
  status = STATUS;

  statusForm!: FormGroup;

  showComment = signal(false);

  ngOnInit() {
    this.statusForm = this.fb.group({
      status: new FormControl('', Validators.required),
      comment: new FormControl(),
    });
  }

  showDialog() {
    this.visible.set(true);
  }

  hiddenDialog() {
    this.visible.set(false);
  }

  setStatus(status: string) {
    if (status === 'editar' || status === 'rechazado') {
      this.showComment.set(true);
      this.statusForm.get('comment')?.setValidators(Validators.required);
      this.statusForm.get('comment')?.updateValueAndValidity();
    } else {
      this.showComment.set(false);
      this.statusForm.get('comment')?.clearValidators();
      this.statusForm.get('comment')?.updateValueAndValidity();
    }
  }

  onSubmit() {
    if (this.statusForm.valid) {
      this.evaluationService
        .updateStatus(this.evaluation_id(), this.statusForm.value)
        .subscribe({
          next: () => {
            this.hiddenDialog();
            this.router.navigate(['/evaluations']);
          },
          error: error => {
            console.error('Error updating evaluation status:', error);
          },
        });
    }
  }
}
