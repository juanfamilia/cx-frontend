import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import type {
  FieldFrameworkWaiverPublic,
  FieldInstrumentRevision,
  FieldInstrumentRevisionWithSpec,
  FieldStudyBriefPublic,
} from '../../field.service';

import { formatHashSnippet } from '../../field-ui.helpers';

/**
 * Progressive disclosure PRE-FIELD: huellas y JSON bajo demanda.
 * Sin análisis: solo muestra datos que ya vienen del backend.
 */
@Component({
  selector: 'field-prefield-technical-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './field-prefield-technical-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldPrefieldTechnicalDetailsComponent {
  brief = input<FieldStudyBriefPublic | null>(null);
  detailRevision = input<FieldInstrumentRevisionWithSpec | null>(null);
  revisions = input<FieldInstrumentRevision[]>([]);
  detailWaivers = input<FieldFrameworkWaiverPublic[]>([]);

  briefPayloadText = model('');
  briefCompletenessStr = model('');
  briefSaving = input(false);

  saveBriefRequested = output<void>();

  protected readonly snippet = formatHashSnippet;
}
