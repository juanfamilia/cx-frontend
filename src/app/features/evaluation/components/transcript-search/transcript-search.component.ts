import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
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
  of,
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

  @Output() resultSelected = new EventEmitter<TranscriptSearchResult>();

  searchQuery = signal<string>('');
  searchMode = signal<'keyword' | 'semantic'>('keyword');
  isSearching = signal<boolean>(false);
  results = signal<TranscriptSearchResult[]>([]);
  hasSearched = signal<boolean>(false);

  searchSubject = new Subject<string>();

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
          this.isSearching.set(true);
          const req =
            this.searchMode() === 'semantic'
              ? this.transcriptService.semanticSearch(query)
              : this.transcriptService.searchTranscripts(query);
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

  private httpErrorMessage(err: HttpErrorResponse): string {
    const body = err.error;
    if (
      body &&
      typeof body === 'object' &&
      'message' in body &&
      typeof (body as { message: unknown }).message === 'string'
    ) {
      return (body as { message: string }).message;
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

  selectResult(result: TranscriptSearchResult) {
    this.resultSelected.emit(result);
    void this.router.navigate(['/evaluations/detail', result.evaluation_id], {
      queryParams: { tab: 'player', t: result.start_time },
    });
  }

  formatTime(seconds: number): string {
    return this.transcriptService.formatTime(seconds);
  }

  /**
   * Safe highlighting for keyword mode (no innerHTML from raw query).
   */
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
