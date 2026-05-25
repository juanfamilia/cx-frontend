import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

import { FieldContextualInsightCardComponent } from './field-contextual-insight-card.component';
import type { JourneyPhasePreview } from './participant-journey.types';

@Component({
  selector: 'field-participant-phase-card',
  standalone: true,
  imports: [NgClass, FieldContextualInsightCardComponent],
  templateUrl: './field-participant-phase-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldParticipantPhaseCardComponent {
  readonly phase = input.required<JourneyPhasePreview>();

  /** Borde lateral cuando hay señales automáticas o abandono esperado — destacado sin gritar. */
  protected phaseAccentSignals(): boolean {
    const p = this.phase();
    return !!(p.expectedRisk || p.automaticSignals.length > 0);
  }

  protected cardShell(state: JourneyPhasePreview['uiState']): Record<string, boolean> {
    return {
      'border-indigo-200/80 bg-gradient-to-br from-indigo-50/70 via-white to-white shadow-md dark:border-indigo-900/45 dark:from-indigo-950/35 dark:via-slate-900/70 dark:to-slate-900/85':
        state === 'rich',
      'border-slate-200/80 bg-white dark:border-slate-700 dark:bg-slate-900/50': state === 'light',
      'border-dashed border-slate-300/90 bg-slate-50/60 dark:border-slate-600 dark:bg-slate-950/25':
        state === 'waiting',
    };
  }

  protected badgeClass(kind: 'risk' | 'fatigue' | 'emotion'): string {
    const base =
      'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium tracking-tight';
    if (kind === 'risk') {
      return `${base} bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100`;
    }
    if (kind === 'fatigue') {
      return `${base} bg-violet-50 text-violet-900 dark:bg-violet-950/40 dark:text-violet-100`;
    }
    return `${base} bg-sky-50 text-sky-900 dark:bg-sky-950/40 dark:text-sky-100`;
  }
}
