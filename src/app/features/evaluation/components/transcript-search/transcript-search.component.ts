import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranscriptService, TranscriptSearchResult } from '../../transcript.service';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';

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
  
  @Output() resultSelected = new EventEmitter<TranscriptSearchResult>();
  
  // Search state
  searchQuery = signal<string>('');
  searchMode = signal<'keyword' | 'semantic'>('keyword');
  isSearching = signal<boolean>(false);
  results = signal<TranscriptSearchResult[]>([]);
  hasSearched = signal<boolean>(false);
  
  // Debounced search
  searchSubject = new Subject<string>();
  
  constructor() {
    // Setup debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.length < 2) {
          return [];
        }
        
        this.isSearching.set(true);
        
        if (this.searchMode() === 'semantic') {
          return this.transcriptService.semanticSearch(query);
        } else {
          return this.transcriptService.searchTranscripts(query);
        }
      })
    ).subscribe({
      next: (response: any) => {
        this.results.set(response?.results || []);
        this.isSearching.set(false);
        this.hasSearched.set(true);
      },
      error: () => {
        this.results.set([]);
        this.isSearching.set(false);
        this.hasSearched.set(true);
      }
    });
  }
  
  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.searchSubject.next(value);
  }
  
  setSearchMode(mode: 'keyword' | 'semantic') {
    this.searchMode.set(mode);
    // Re-search with new mode
    if (this.searchQuery().length >= 2) {
      this.searchSubject.next(this.searchQuery());
    }
  }
  
  selectResult(result: TranscriptSearchResult) {
    this.resultSelected.emit(result);
  }
  
  formatTime(seconds: number): string {
    return this.transcriptService.formatTime(seconds);
  }
  
  highlightMatch(text: string): string {
    const query = this.searchQuery();
    if (!query || this.searchMode() === 'semantic') return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
  
  clearSearch() {
    this.searchQuery.set('');
    this.results.set([]);
    this.hasSearched.set(false);
  }
}
