import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
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
