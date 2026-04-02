import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  computed,
  inject,
  signal,
} from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { CompanyList } from '@interfaces/company';
import { CompaniesService } from '@pages/companies/companies.service';
import {
  TranscriptService,
  TranscriptSearchResult,
  TranscriptSearchResponse,
} from '../../transcript.service';
import { ShareToasterService } from '@core/services/toast.service';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  Subject,
  switchMap,
} from 'rxjs';

type SearchFlow =
  | { kind: 'idle' }
  | { kind: 'ok'; response: TranscriptSearchResponse }
  | { kind: 'fail' };

@Component({
  selector: 'app-transcript-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transcript-search.component.html',
  styleUrl: './transcript-search.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TranscriptSearchComponent {
  private transcriptService = inject(TranscriptService);
  private router = inject(Router);
  private toastService = inject(ShareToasterService);
  private authService = inject(AuthService);
  private companiesService = inject(CompaniesService);

  @Output() resultSelected = new EventEmitter<TranscriptSearchResult>();

  searchQuery = signal<string>('');
  searchMode = signal<'keyword' | 'semantic'>('keyword');
  isSearching = signal<boolean>(false);
  results = signal<TranscriptSearchResult[]>([]);
  hasSearched = signal<boolean>(false);

  /** Admin sin `company_id` en el token: debe elegir empresa (misma regla que el API). */
  selectedCompanyId = signal<number | undefined>(undefined);

  searchSubject = new Subject<string>();

  pickerNeeded = computed(() => {
    try {
      const u = this.authService.getCurrentUser();
      return u.role === 0 && !(u.company_id != null && u.company_id > 0);
    } catch {
      return false;
    }
  });

  searchScoped = computed(() => {
    try {
      const u = this.authService.getCurrentUser();
      if (u.role !== 0) {
        return true;
      }
      if (u.company_id != null && u.company_id > 0) {
        return true;
      }
      const id = this.selectedCompanyId();
      return id != null && id > 0;
    } catch {
      return false;
    }
  });

  awaitingCompanySelection = computed(
    () => this.pickerNeeded() && !this.searchScoped()
  );

  companySelectModel = computed(() => {
    const id = this.selectedCompanyId();
    return id != null && id > 0 ? String(id) : '';
  });

  companiesResource = rxResource<CompanyList, boolean>({
    request: () => this.pickerNeeded(),
    loader: ({ request }) =>
      request
        ? this.companiesService.getAll(0, 100)
        : of({ data: [], pagination: { first: 0, rows: 0, total: 0 } }),
  });

  constructor() {
    this.searchSubject
      .pipe(
        takeUntilDestroyed(),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(raw => {
          const query = raw.trim();
          if (query.length < 2) {
            return of<SearchFlow>({ kind: 'idle' });
          }
          if (!this.searchScoped()) {
            return of<SearchFlow>({ kind: 'idle' });
          }
          this.isSearching.set(true);
          const companyId = this.getCompanyIdForSearch();
          const req =
            this.searchMode() === 'semantic'
              ? this.transcriptService.semanticSearch(query, 20, companyId)
              : this.transcriptService.searchTranscripts(query, undefined, 50, companyId);
          return req.pipe(
            map(
              (response): SearchFlow => ({
                kind: 'ok',
                response,
              })
            ),
            catchError((err: HttpErrorResponse) => {
              this.toastService.showToast(
                'error',
                'Error en la búsqueda',
                this.httpErrorMessage(err)
              );
              return of<SearchFlow>({ kind: 'fail' });
            })
          );
        })
      )
      .subscribe({
        next: (flow: SearchFlow) => {
          this.isSearching.set(false);
          if (flow.kind === 'idle') {
            this.results.set([]);
            this.hasSearched.set(false);
            return;
          }
          if (flow.kind === 'fail') {
            this.results.set([]);
            this.hasSearched.set(true);
            return;
          }
          this.results.set(flow.response.results ?? []);
          this.hasSearched.set(true);
        },
      });
  }

  /**
   * Solo rol 0 envía `company_id` al API (explícito). Otros roles: el backend usa el token.
   */
  private getCompanyIdForSearch(): number | undefined {
    try {
      const u = this.authService.getCurrentUser();
      if (u.role !== 0) {
        return undefined;
      }
      if (u.company_id != null && u.company_id > 0) {
        return u.company_id;
      }
      const id = this.selectedCompanyId();
      return id != null && id > 0 ? id : undefined;
    } catch {
      return undefined;
    }
  }

  private httpErrorMessage(err: HttpErrorResponse): string {
    const body = err.error;
    if (body && typeof body === 'object') {
      const d = (body as { detail?: unknown; message?: unknown }).detail;
      if (typeof d === 'string' && d.length > 0) {
        return d;
      }
      if (Array.isArray(d) && d.length > 0) {
        const first = d[0] as { msg?: string };
        if (typeof first?.msg === 'string') {
          return first.msg;
        }
      }
      const m = (body as { message?: unknown }).message;
      if (typeof m === 'string' && m.length > 0) {
        return m;
      }
    }
    if (typeof body === 'string' && body.length > 0) {
      return body;
    }
    if (err.status === 0) {
      return 'Sin conexión o servidor no disponible';
    }
    return `Error ${err.status}`;
  }

  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.searchSubject.next(value);
  }

  setSearchMode(mode: 'keyword' | 'semantic') {
    this.searchMode.set(mode);
    if (this.searchQuery().trim().length >= 2) {
      this.searchSubject.next(this.searchQuery());
    }
  }

  onCompanyChange(raw: string) {
    const id = raw ? Number(raw) : NaN;
    this.selectedCompanyId.set(
      Number.isFinite(id) && id > 0 ? id : undefined
    );
    if (this.searchQuery().trim().length >= 2) {
      this.searchSubject.next(this.searchQuery());
    }
  }

  selectResult(result: TranscriptSearchResult) {
    this.resultSelected.emit(result);
    void this.router.navigate(['/evaluations/detail', result.evaluation_id], {
      queryParams: { tab: 'player', t: result.start_time },
    });
  }

  formatTime(seconds: number): string {
    return this.transcriptService.formatTime(seconds);
  }

  highlightChunks(text: string): { text: string; mark: boolean }[] {
    const query = this.searchQuery().trim();
    if (!query || this.searchMode() === 'semantic') {
      return [{ text, mark: false }];
    }
    let escaped: string;
    try {
      escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    } catch {
      return [{ text, mark: false }];
    }
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return parts.map((part, i) => ({
      text: part,
      mark: i % 2 === 1,
    }));
  }

  clearSearch() {
    this.searchQuery.set('');
    this.results.set([]);
    this.hasSearched.set(false);
    this.searchSubject.next('');
  }
}
