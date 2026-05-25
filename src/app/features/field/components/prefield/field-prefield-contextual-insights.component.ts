import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** Filas sólo cuando el servidor (o estado explícito) da contexto · sin umbral cliente de “sparse”. */
export type PrefieldConsultiveInsightRowUi = {
  readonly id: string;
  readonly tone: 'warn' | 'ok';
  readonly message: string;
  readonly applyLabel: string;
  readonly showApply: boolean;
};

@Component({
  selector: 'field-prefield-contextual-insights',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './field-prefield-contextual-insights.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldPrefieldContextualInsightsComponent {
  readonly insights = input<readonly PrefieldConsultiveInsightRowUi[]>([]);

  readonly apply = output<string>();
  readonly dismiss = output<string>();
}
