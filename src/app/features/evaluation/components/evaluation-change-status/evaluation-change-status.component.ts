import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
import { InputSelectComponent } from '@shared/ui/inputs/input-select/input-select.component';
import { InputTextareaComponent } from '@shared/ui/inputs/input-textarea/input-textarea.component';
import { provideIcons } from '@ng-icons/core';
import { lucideClipboardCheck } from '@ng-icons/lucide';
import { EvaluationService } from '@pages/evaluation/evaluation.service';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { ShareToasterService } from '@core/services/toast.service';
import { STATUS } from '../../../../shared/constants/evaluationStatus.constants';

const REJECTION_TYPES = [
  { name: 'Descartar — no requiere acción', value: 'descartado' },
  { name: 'Discrepancia — revisar diferencia', value: 'discrepancia' },
];

@Component({
  selector: 'app-evaluation-change-status',
  imports: [
    ReactiveFormsModule,
    Dialog,
    ButtonModule,
    CheckboxModule,
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
  private toastService = inject(ShareToasterService);

  visible = model(false);
  isSubmitting = signal(false);

  readonly statusOptions = STATUS;
  readonly rejectionTypeOptions = REJECTION_TYPES;

  statusForm!: FormGroup;

  // Derived UI state
  selectedStatus = signal<string>('');
  isRejection = computed(() => this.selectedStatus() === 'rechazado');
  isEdit = computed(() => this.selectedStatus() === 'editar');
  isApproval = computed(() => this.selectedStatus() === 'aprobado');
  showDiscrepancyOptions = computed(
    () =>
      this.isRejection() &&
      this.statusForm?.get('rejection_type')?.value === 'discrepancia'
  );

  ngOnInit() {
    this.statusForm = this.fb.group({
      status: new FormControl('', Validators.required),
      comment: new FormControl<string | null>(null),
      rejection_type: new FormControl<string | null>(null),
      requires_revisit: new FormControl<boolean>(false),
    });
  }

  showDialog() {
    this.statusForm.reset({ status: '', comment: null, rejection_type: null, requires_revisit: false });
    this.selectedStatus.set('');
    this.visible.set(true);
  }

  hiddenDialog() {
    this.visible.set(false);
  }

  onStatusChange(value: string) {
    this.selectedStatus.set(value);
    const commentCtrl = this.statusForm.get('comment')!;
    const rejTypeCtrl = this.statusForm.get('rejection_type')!;

    // Comment is required when sending back to edit or rejecting
    if (value === 'editar' || value === 'rechazado') {
      commentCtrl.setValidators(Validators.required);
    } else {
      commentCtrl.clearValidators();
    }
    commentCtrl.updateValueAndValidity();

    // Rejection type required only when rejecting
    if (value === 'rechazado') {
      rejTypeCtrl.setValidators(Validators.required);
    } else {
      rejTypeCtrl.clearValidators();
      rejTypeCtrl.setValue(null);
    }
    rejTypeCtrl.updateValueAndValidity();
  }

  onRejectionTypeChange(value: string) {
    // Reset revisit if switching away from discrepancy
    if (value !== 'discrepancia') {
      this.statusForm.get('requires_revisit')?.setValue(false);
    }
    // Force re-evaluation of computed signal
    this.statusForm.updateValueAndValidity();
  }

  onSubmit() {
    if (this.statusForm.invalid || this.isSubmitting()) return;

    const { status, comment, rejection_type, requires_revisit } = this.statusForm.value;
    const payload: Record<string, unknown> = { status };
    if (comment) payload['comment'] = comment;
    if (rejection_type) payload['rejection_type'] = rejection_type;
    if (requires_revisit) payload['requires_revisit'] = requires_revisit;

    this.isSubmitting.set(true);
    this.evaluationService
      .updateStatus(this.evaluation_id(), payload as Parameters<EvaluationService['updateStatus']>[1])
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.hiddenDialog();
          this.toastService.showToast('success', 'Estado actualizado', 'La evaluación fue actualizada correctamente.');
          void this.router.navigate(['/evaluations']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const msg = err?.error?.detail ?? 'No se pudo cambiar el estado.';
          this.toastService.showToast('error', 'Error', msg);
        },
      });
  }
}
