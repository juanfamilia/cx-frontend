import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  ResourceStatus,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { PageHeaderComponent } from '@shared/ui/page-header/page-header.component';
import { Campaign } from '@interfaces/campaign';
import { CampaignService } from '@pages/campaign/campaign.service';
import { EvaluationService } from '@pages/evaluation/evaluation.service';
import { ShareToasterService } from '@core/services/toast.service';
import { SelectChangeEvent, SelectModule } from 'primeng/select';
import { EvaluationFormComponent } from '../components/evaluation-form/evaluation-form.component';

@Component({
  selector: 'app-evaluation-create',
  imports: [PageHeaderComponent, SelectModule, EvaluationFormComponent],
  templateUrl: './evaluation-create.component.html',
  styleUrl: './evaluation-create.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvaluationCreateComponent {
  private router = inject(Router);
  private toastService = inject(ShareToasterService);
  private campaignService = inject(CampaignService);
  private evaluationService = inject(EvaluationService);

  assignmentsResource = rxResource({
    loader: () => this.campaignService.getAssignments(),
  });

  /** Fallo al cargar GET /campaign-assignment/ (p. ej. 404 si el backend exigía zonas). */
  assignmentsLoadFailed = computed(
    () => this.assignmentsResource.status() === ResourceStatus.Error
  );

  /** Mensaje derivado del error HTTP (402 pago, 401 token, 403 permiso, 0 red, etc.). */
  assignmentsLoadErrorDetail = computed(() => {
    if (this.assignmentsResource.status() !== ResourceStatus.Error) {
      return '';
    }
    return formatAssignmentsLoadError(this.assignmentsResource.error());
  });

  /** Respuesta OK pero sin campañas asignadas al evaluador. */
  assignmentsEmpty = computed(() => {
    if (this.assignmentsResource.isLoading()) return false;
    if (this.assignmentsResource.status() === ResourceStatus.Error) return false;
    const d = this.assignmentsResource.value();
    if (!d) return false;
    return (
      (d.by_user?.length ?? 0) === 0 && (d.by_zone?.length ?? 0) === 0
    );
  });

  assignments = computed(() => {
    const data = this.assignmentsResource.value();
    const list = [
      {
        label: '👤 Por Usuario',
        value: 'user',
        items:
          data?.by_user?.map(assignment => ({
            label: assignment.campaign?.name ?? '',
            value: assignment.campaign_id,
          })) ?? [],
      },
      {
        label: '📍 Por Zonas',
        value: 'zone',
        items:
          data?.by_zone?.map(assignment => ({
            label:
              (assignment.campaign?.name ?? '') +
              ' - ' +
              (assignment.zone?.name ?? ''),
            value: assignment.campaign_id,
          })) ?? [],
      },
    ];
    return list;
  });

  campaign = signal<Campaign | null>(null);
  byZone = signal<boolean>(false);

  isLoadingSubmit = signal<boolean>(false);

  isByZone(campaignId: number) {
    const campaignResult = this.assignmentsResource
      .value()
      ?.by_zone?.find(assignment => assignment.campaign_id === campaignId);

    this.byZone.set(!!campaignResult);
  }

  onCampaignSelected(event: SelectChangeEvent) {
    const raw = event.value;
    const id = typeof raw === 'number' ? raw : Number(raw);
    if (raw == null || !Number.isFinite(id)) {
      return;
    }
    this.selectCampaign(id);
    this.isByZone(id);
  }

  /** Vuelve a pedir GET /campaign-assignment/ (distinto de campaign-goals-progress). */
  retryLoadAssignments(): void {
    this.assignmentsResource.reload();
  }

  selectCampaign(id: number) {
    this.campaign.set(null);
    this.campaignService.getOne(id).subscribe({
      next: campaign => {
        this.campaign.set(campaign);
      },
      error: err => {
        this.toastService.showToast(
          'error',
          'Error al obtener la campaña',
          err.message
        );
        console.error('Error getting campaign:', err);
      },
    });
  }

  createEvaluation(data: FormData) {
    this.isLoadingSubmit.set(true);
    this.evaluationService
      .create(data)
      .pipe(finalize(() => this.isLoadingSubmit.set(false)))
      .subscribe({
        next: () => {
          this.toastService.showToast(
            'success',
            'Evaluación creada',
            'La evaluación ha sido creada exitosamente'
          );
          void this.router.navigate(['/']);
        },
        error: err => {
          const status = (err as { status?: number })?.status;
          let msg =
            (err as { error?: { detail?: string } })?.error?.detail ??
            (err as Error)?.message ??
            'Error desconocido';
          if (status === 0) {
            msg =
              'Sin respuesta del servidor (red, CORS o timeout). Comprueba en Railway las variables CORS_EXTRA_ORIGINS / CORS_ORIGIN_REGEX y la consola del navegador (F12).';
          }
          this.toastService.showToast('error', 'Error al crear la evaluación', msg);
          console.error('Error creating evaluation:', err);
        },
      });
  }
}

function formatAssignmentsLoadError(err: unknown): string {
  const fromHttp = extractHttpErrorDetail(err);
  if (fromHttp !== null) {
    const { status, detail, message } = fromHttp;
    switch (status) {
      case 401:
        return detail || 'Sesión expirada o token inválido. Cierra sesión y vuelve a entrar.';
      case 402:
        return (
          detail ||
          'Pago o suscripción de la empresa no vigente. Un administrador debe renovar el pago.'
        );
      case 403:
        return (
          detail ||
          'No tienes permiso para ver las campañas asignadas. Solo cuentas evaluador pueden usar esta pantalla; si deberías serlo, contacta al administrador.'
        );
      case 404:
        return detail || 'El servidor respondió que el recurso no existe.';
      case 0:
        return (
          detail ||
          'Sin respuesta del servidor (red, bloqueo o CORS). Comprueba conexión y que el API esté disponible.'
        );
      default:
        return detail || message || `Error del servidor (${status}).`;
    }
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return (
    'No se pudo interpretar el error. Abre F12 → Red, busca la petición ' +
    '"campaign-assignment" y revisa el código de estado y el cuerpo de la respuesta.'
  );
}

/** Cubre HttpErrorResponse y objetos con forma similar (p. ej. builds donde falla instanceof). */
function extractHttpErrorDetail(
  err: unknown
): { status: number; detail: string; message: string } | null {
  const cand = err as Partial<HttpErrorResponse> & {
    status?: number;
    error?: { detail?: string | { msg?: string }[] };
    message?: string;
  };
  const status = cand?.status;
  if (typeof status !== 'number') {
    return null;
  }

  let detail = '';
  const raw = cand.error as { detail?: string | { msg?: string }[] } | undefined;
  if (typeof raw?.detail === 'string') {
    detail = raw.detail;
  } else if (Array.isArray(raw?.detail)) {
    detail = raw.detail
      .map((x: { msg?: string }) => (typeof x?.msg === 'string' ? x.msg : ''))
      .filter(Boolean)
      .join('. ');
  }

  const message =
    typeof cand.message === 'string' ? cand.message : '';
  return { status, detail, message };
}
