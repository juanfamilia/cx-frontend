import { Component, Input, Output, EventEmitter, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClipService, Clip, SmartClip } from '../clip.service';

@Component({
  selector: 'app-evidence-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Modal Backdrop -->
    <div 
      class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      (click)="onBackdropClick($event)"
    >
      <!-- Modal Content -->
      <div class="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div class="flex items-center gap-3">
            <span class="text-2xl">{{ getTypeIcon() }}</span>
            <div>
              <h2 class="font-bold text-gray-900 dark:text-white text-lg">{{ smartClip()?.smart_title }}</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ smartClip()?.impact_label }} • {{ smartClip()?.timestamp_display }}</p>
            </div>
          </div>
          <button 
            (click)="close.emit()"
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
          >
            <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Main Content -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-0">
          
          <!-- Video Player (2/3) -->
          <div class="lg:col-span-2 bg-black">
            @if (clip && clip.cloudflare_uid) {
              <div class="relative aspect-video">
                <iframe
                  [src]="embedUrl()"
                  class="w-full h-full"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                  allowfullscreen
                ></iframe>
              </div>
            } @else {
              <div class="aspect-video flex items-center justify-center">
                <div class="text-center text-gray-400">
                  <svg class="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                  <p>Video no disponible</p>
                </div>
              </div>
            }
          </div>

          <!-- Transcript Panel (1/3) -->
          <div class="bg-gray-50 dark:bg-gray-800 p-4 lg:border-l dark:border-gray-700 max-h-[400px] lg:max-h-none overflow-y-auto">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wide">
              Transcripción
            </h3>
            
            @if (clip) {
              <!-- Speaker Label -->
              <div class="mb-2">
                <span 
                  class="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
                  [class]="clip.verbatim_origin === 'cliente' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' 
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'"
                >
                  <span>{{ clip.verbatim_origin === 'cliente' ? '👤' : '🎧' }}</span>
                  {{ clip.verbatim_origin === 'cliente' ? 'Cliente' : 'Agente' }}
                </span>
              </div>

              <!-- Verbatim Text -->
              <div class="relative">
                <!-- Highlighted Quote -->
                <blockquote 
                  class="border-l-4 pl-4 py-2 italic text-gray-800 dark:text-gray-200"
                  [class.border-red-500]="clip.verbatim_type === 'critical'"
                  [class.border-orange-500]="clip.verbatim_type === 'negative'"
                  [class.border-green-500]="clip.verbatim_type === 'positive'"
                >
                  "{{ clip.verbatim_text }}"
                </blockquote>
              </div>

              <!-- Metadata -->
              <div class="mt-4 pt-4 border-t dark:border-gray-700 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div class="flex justify-between">
                  <span>Timestamp</span>
                  <span class="font-mono">{{ smartClip()?.timestamp_display }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Duración</span>
                  <span>{{ clip.clip_duration }}s</span>
                </div>
                <div class="flex justify-between">
                  <span>Impacto</span>
                  <span class="font-semibold" [class]="getPriorityColor()">
                    {{ clip.priority_score.toFixed(0) }} pts
                  </span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Footer with Navigation -->
        @if (hasMultipleClips()) {
          <div class="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div class="flex items-center justify-between">
              <button 
                (click)="previous.emit()"
                [disabled]="!hasPrevious"
                class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                Anterior
              </button>
              
              <span class="text-sm text-gray-500 dark:text-gray-400">
                Clip {{ currentIndex + 1 }} de {{ totalClips }}
              </span>
              
              <button 
                (click)="next.emit()"
                [disabled]="!hasNext"
                class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class EvidenceViewerComponent {
  private clipService = inject(ClipService);
  
  @Input() clip: Clip | null = null;
  @Input() currentIndex = 0;
  @Input() totalClips = 1;
  @Input() hasPrevious = false;
  @Input() hasNext = false;
  
  @Output() close = new EventEmitter<void>();
  @Output() previous = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  smartClip = computed(() => {
    if (!this.clip) return null;
    return this.clipService.toSmartClip(this.clip);
  });

  embedUrl(): string {
    if (!this.clip) return '';
    return this.clipService.getEmbedUrl(this.clip);
  }

  getTypeIcon(): string {
    if (!this.clip) return '📹';
    return this.clipService.getVerbatimConfig(this.clip.verbatim_type).icon;
  }

  getPriorityColor(): string {
    if (!this.clip) return '';
    if (this.clip.priority_score >= 100) return 'text-red-600';
    if (this.clip.priority_score >= 70) return 'text-orange-600';
    if (this.clip.priority_score >= 40) return 'text-yellow-600';
    return 'text-blue-600';
  }

  hasMultipleClips(): boolean {
    return this.totalClips > 1;
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('fixed')) {
      this.close.emit();
    }
  }
}
