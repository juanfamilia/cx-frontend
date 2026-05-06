import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { FieldService } from './field.service';
import { FieldPrimaryNavTabsComponent } from './components/field-primary-nav-tabs.component';

@Component({
  selector: 'app-field-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, FieldPrimaryNavTabsComponent],
  templateUrl: './field-shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldShellComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly fieldSvc = inject(FieldService);

  private headerSub?: Subscription;

  readonly projectId = toSignal(
    this.route.paramMap.pipe(map(p => Number(p.get('projectId')))),
    { initialValue: NaN }
  );

  readonly projectName = signal<string>('Proyecto');
  readonly loadError = signal<string | null>(null);

  readonly tabs = computed(() => {
    const id = this.projectId();
    if (!Number.isFinite(id)) {
      return [];
    }
    const base = `/field/project/${id}`;
    return [
      { label: 'Control del proyecto', link: `${base}/dashboard`, fragment: undefined },
      { label: 'Hallazgos', link: `${base}/findings`, fragment: undefined },
      { label: 'Métricas y scoring', link: `${base}/scoring`, fragment: undefined },
      { label: 'Resumen ejecutivo', link: `${base}/executive-summary`, fragment: undefined },
    ];
  });

  ngOnInit(): void {
    this.headerSub = this.route.paramMap.subscribe(p => {
      const raw = p.get('projectId');
      const id = raw ? Number(raw) : NaN;
      if (!Number.isFinite(id)) {
        return;
      }
      this.loadError.set(null);
      this.fieldSvc.getProjectOverview(id, 4).subscribe({
        next: row => {
          this.projectName.set(row.project?.name ?? `Proyecto #${id}`);
        },
        error: () => {
          this.loadError.set(
            'No se pudo cargar la información del proyecto. Compruebe permisos o vuelva al resumen de proyectos.'
          );
          this.projectName.set(`Proyecto #${id}`);
        },
      });
    });
  }

  ngOnDestroy(): void {
    this.headerSub?.unsubscribe();
  }
}
