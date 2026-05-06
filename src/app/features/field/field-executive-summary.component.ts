import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnDestroy, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { ShareToasterService } from '@core/services/toast.service';

import { FieldService } from './field.service';

@Component({
  selector: 'app-field-executive-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './field-executive-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldExecutiveSummaryComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly fieldSvc = inject(FieldService);
  private readonly toast = inject(ShareToasterService);

  private readonly routeSub: Subscription;

  readonly projectId = signal<number | null>(null);
  readonly busy = signal(false);
  readonly payload = signal<unknown>(null);
  readonly errorHint = signal<string | null>(null);

  constructor() {
    this.routeSub = this.route.parent!.paramMap.subscribe(p => {
      const id = Number(p.get('projectId'));
      this.projectId.set(Number.isFinite(id) ? id : null);
      this.payload.set(null);
      this.errorHint.set(null);
    });
  }

  ngOnDestroy(): void {
    this.routeSub.unsubscribe();
  }

  generate(): void {
    const id = this.projectId();
    if (id == null) {
      return;
    }
    this.busy.set(true);
    this.errorHint.set(null);
    this.fieldSvc.generateFieldExecutiveSummary({ field_project_id: id }).subscribe({
      next: body => {
        this.busy.set(false);
        this.payload.set(body);
      },
      error: (err: unknown) => {
        this.busy.set(false);
        this.payload.set(null);
        const hint =
          err instanceof HttpErrorResponse
            ? err.status === 404
              ? 'El resumen ejecutivo (Siete Clever) no está disponible en este entorno. Cuando el backend publique POST /clever/generate-summary, podrá generarlo desde aquí.'
              : `${err.status}: ${err.message || 'Error'}`
            : 'No se pudo generar el resumen.';
        this.errorHint.set(hint);
        this.toast.showToast('warn', 'Field', hint);
      },
    });
  }

  asRecord(v: unknown): Record<string, unknown> | null {
    return v != null && typeof v === 'object' ? (v as Record<string, unknown>) : null;
  }

  summarySections(pl: unknown): {
    risks?: unknown;
    impact?: unknown;
    recommendations?: unknown;
    hasStructured: boolean;
  } {
    const r = this.asRecord(pl);
    if (!r) {
      return { hasStructured: false };
    }
    const risks = r['risks'];
    const impact = r['impact'];
    const recommendations = r['recommendations'];
    const hasStructured =
      risks !== undefined || impact !== undefined || recommendations !== undefined;
    return { risks, impact, recommendations, hasStructured };
  }
}
