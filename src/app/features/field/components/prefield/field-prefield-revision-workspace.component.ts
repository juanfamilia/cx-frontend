import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import type {
  FieldFrameworkWaiverPublic,
  FieldInstrumentRevisionWithSpec,
  FieldReadinessGatePublic,
} from '../../field.service';
import {
  executiveQaConsistencySummaryGuided,
  executiveReadinessBlocking,
  executiveStakeholderRole,
  readinessAggregateBadgeNgClass,
  readinessAggregateSurfaceLabel,
  revisionLifecycleLabel,
} from '../../field-ui.helpers';

/**
 * Área contextual previa a publicar · sin inferencia propia — solo muestra estado y textos desde backend/helpers de etiquetas.
 */
@Component({
  selector: 'field-prefield-revision-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './field-prefield-revision-workspace.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldPrefieldRevisionWorkspaceComponent {
  revision = input.required<FieldInstrumentRevisionWithSpec>();
  readinessGate = input<FieldReadinessGatePublic | null>(null);
  detailWaivers = input<FieldFrameworkWaiverPublic[]>([]);
  detailWaiversLoading = input(false);

  waiverRationale = model('');
  waiverSectionsJson = model('');
  waiverSubmitting = input(false);

  closed = output<void>();
  waiverSubmitted = output<void>();

  protected readonly lifecycleLabel = revisionLifecycleLabel;
  protected readonly qaGuidedSummary = executiveQaConsistencySummaryGuided;
  protected readonly readinessBadgeClass = readinessAggregateBadgeNgClass;
  protected readonly readinessLabel = readinessAggregateSurfaceLabel;
  protected readonly stakeholderRole = executiveStakeholderRole;
  protected readonly readinessBlockingHuman = executiveReadinessBlocking;

  draftStatus(): boolean {
    return this.revision().status === 'draft';
  }
}
