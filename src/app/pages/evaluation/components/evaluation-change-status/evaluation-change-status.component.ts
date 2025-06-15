import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
  OnInit,
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
import { provideIcons } from '@ng-icons/core';
import { lucideClipboardCheck } from '@ng-icons/lucide';
import { EvaluationService } from '@services/evaluation.service';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { STATUS } from 'src/app/constants/evaluationStatus.constants';

@Component({
  selector: 'app-evaluation-change-status',
  imports: [ReactiveFormsModule, Dialog, ButtonModule, InputSelectComponent],
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

  ngOnInit() {
    this.statusForm = this.fb.group({
      status: new FormControl('', Validators.required),
    });
  }

  showDialog() {
    this.visible.set(true);
  }

  hiddenDialog() {
    this.visible.set(false);
  }

  onSubmit() {
    if (this.statusForm.valid) {
      this.evaluationService
        .updateStatus(this.evaluation_id(), this.statusForm.value.status)
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
