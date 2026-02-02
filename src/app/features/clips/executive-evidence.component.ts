import { Component, Input, OnInit, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClipService, Clip, ClipsResponse, ClipsStatus } from './clip.service';
import { ClipStackComponent } from './components/clip-stack.component';
import { EvidenceViewerComponent } from './components/evidence-viewer.component';

@Component({
  selector: 'app-executive-evidence',
  standalone: true,
  imports: [CommonModule, ClipStackComponent, EvidenceViewerComponent],
  template: `
    <!-- Loading State -->
    @if (loading()) {
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div class="flex items-center justify-center gap-3">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span class="text-gray-600 dark:text-gray-400">Cargando evidencia...</span>
        </div>
        
        @if (status()) {
          <div class="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            {{ status()!.ready }} de {{ status()!.total }} clips listos
            @if (status()!.processing > 0) {
              <span class="ml-2">• {{ status()!.processing }} procesando</span>
            }
          </div>
        }
      </div>
    }

    <!-- No Evaluation Selected -->
    @if (!evaluationId && !loading()) {
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Selecciona una evaluación</h3>
        <p class="text-gray-500 dark:text-gray-400">Los clips de evidencia aparecerán aquí</p>
      </div>
    }

    <!-- No Clips Available -->
    @if (evaluationId && !loading() && clips().length === 0) {
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"/>
        </svg>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Sin clips disponibles</h3>
        <p class="text-gray-500 dark:text-gray-400">No se encontraron momentos clave en esta evaluación</p>
      </div>
    }

    <!-- Clips Available -->
    @if (evaluationId && !loading() && clips().length > 0) {
      <!-- Summary Cards (Executive View) -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div 
          class="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white cursor-pointer hover:shadow-lg transition"
          (click)="filterByType('critical')"
        >
          <div class="flex items-center justify-between">
            <span class="text-3xl">🔴</span>
            <span class="text-3xl font-bold">{{ criticalCount() }}</span>
          </div>
          <div class="mt-2 text-sm opacity-90">Críticos</div>
        </div>
        
        <div 
          class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white cursor-pointer hover:shadow-lg transition"
          (click)="filterByType('negative')"
        >
          <div class="flex items-center justify-between">
            <span class="text-3xl">🟠</span>
            <span class="text-3xl font-bold">{{ negativeCount() }}</span>
          </div>
          <div class="mt-2 text-sm opacity-90">Negativos</div>
        </div>
        
        <div 
          class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white cursor-pointer hover:shadow-lg transition"
          (click)="filterByType('positive')"
        >
          <div class="flex items-center justify-between">
            <span class="text-3xl">🟢</span>
            <span class="text-3xl font-bold">{{ positiveCount() }}</span>
          </div>
          <div class="mt-2 text-sm opacity-90">Positivos</div>
        </div>
      </div>

      <!-- Clip Stack -->
      <app-clip-stack
        [clips]="filteredClips()"
        (clipSelected)="openViewer($event.clip, $event.index)"
        (autoReelRequested)="startAutoReel()"
      />
    }

    <!-- Evidence Viewer Modal -->
    @if (viewerOpen()) {
      <app-evidence-viewer
        [clip]="currentClip()"
        [currentIndex]="currentIndex()"
        [totalClips]="filteredClips().length"
        [hasPrevious]="currentIndex() > 0"
        [hasNext]="currentIndex() < filteredClips().length - 1"
        (close)="closeViewer()"
        (previous)="previousClip()"
        (next)="nextClip()"
      />
    }
  `
})
export class ExecutiveEvidenceComponent implements OnInit, OnChanges {
  private clipService = inject(ClipService);

  @Input() evaluationId: number | null = null;

  // State
  loading = signal(false);
  clips = signal<Clip[]>([]);
  status = signal<ClipsStatus | null>(null);
  selectedType = signal<'critical' | 'negative' | 'positive' | null>(null);
  viewerOpen = signal(false);
  currentClip = signal<Clip | null>(null);
  currentIndex = signal(0);
  autoReelMode = signal(false);

  // Computed
  filteredClips = () => {
    const type = this.selectedType();
    if (!type) return this.clips();
    return this.clips().filter(c => c.verbatim_type === type);
  };

  criticalCount = () => this.clips().filter(c => c.verbatim_type === 'critical').length;
  negativeCount = () => this.clips().filter(c => c.verbatim_type === 'negative').length;
  positiveCount = () => this.clips().filter(c => c.verbatim_type === 'positive').length;

  ngOnInit(): void {
    if (this.evaluationId) {
      this.loadClips();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['evaluationId'] && this.evaluationId) {
      this.loadClips();
    }
  }

  loadClips(): void {
    if (!this.evaluationId) return;

    this.loading.set(true);
    this.selectedType.set(null);

    // First check status
    this.clipService.getClipsStatus(this.evaluationId).subscribe({
      next: (status) => {
        this.status.set(status);
        
        if (!status.is_complete && status.processing > 0) {
          // Still processing, poll again in 5 seconds
          setTimeout(() => this.loadClips(), 5000);
        }
      },
      error: () => this.status.set(null)
    });

    // Load clips (delivered only by default for executives)
    this.clipService.getClipsForEvaluation(this.evaluationId, true).subscribe({
      next: (response) => {
        this.clips.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading clips:', err);
        this.clips.set([]);
        this.loading.set(false);
      }
    });
  }

  filterByType(type: 'critical' | 'negative' | 'positive'): void {
    if (this.selectedType() === type) {
      this.selectedType.set(null); // Toggle off
    } else {
      this.selectedType.set(type);
    }
  }

  openViewer(clip: Clip, index: number): void {
    this.currentClip.set(clip);
    this.currentIndex.set(index);
    this.viewerOpen.set(true);
  }

  closeViewer(): void {
    this.viewerOpen.set(false);
    this.currentClip.set(null);
    this.autoReelMode.set(false);
  }

  previousClip(): void {
    const newIndex = this.currentIndex() - 1;
    if (newIndex >= 0) {
      this.currentIndex.set(newIndex);
      this.currentClip.set(this.filteredClips()[newIndex]);
    }
  }

  nextClip(): void {
    const clips = this.filteredClips();
    const newIndex = this.currentIndex() + 1;
    if (newIndex < clips.length) {
      this.currentIndex.set(newIndex);
      this.currentClip.set(clips[newIndex]);
    } else if (this.autoReelMode()) {
      // End of auto-reel
      this.closeViewer();
    }
  }

  startAutoReel(): void {
    const clips = this.filteredClips();
    if (clips.length === 0) return;

    this.autoReelMode.set(true);
    this.currentIndex.set(0);
    this.currentClip.set(clips[0]);
    this.viewerOpen.set(true);
  }
}
