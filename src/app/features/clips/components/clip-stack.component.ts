import { Component, Input, Output, EventEmitter, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClipService, Clip, SmartClip } from '../clip.service';

@Component({
  selector: 'app-clip-stack',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <!-- Header -->
      <div class="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-bold text-gray-900 dark:text-white">Evidence Stack</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Top {{ clips.length }} clips prioritarios</p>
          </div>
          @if (clips.length > 0) {
            <button 
              (click)="playAutoReel()"
              class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Auto-Reel ({{ totalDuration }}s)
            </button>
          }
        </div>
      </div>

      <!-- Clip List -->
      <div class="divide-y dark:divide-gray-700">
        @if (clips.length === 0) {
          <div class="p-8 text-center text-gray-500 dark:text-gray-400">
            <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
            <p>No hay clips disponibles</p>
          </div>
        }
        
        @for (clip of smartClips(); track clip.id; let i = $index) {
          <div 
            class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition group"
            (click)="onClipClick(clip, i)"
          >
            <div class="flex items-start gap-4">
              <!-- Rank Badge -->
              <div 
                class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                [class]="getRankClass(i)"
              >
                {{ i + 1 }}
              </div>
              
              <!-- Thumbnail -->
              <div class="flex-shrink-0 relative">
                @if (clip.thumbnail_url) {
                  <img 
                    [src]="clip.thumbnail_url" 
                    alt="Clip thumbnail"
                    class="w-24 h-14 object-cover rounded-lg"
                  />
                } @else {
                  <div class="w-24 h-14 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                  </div>
                }
                <!-- Play Overlay -->
                <div class="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg opacity-0 group-hover:opacity-100 transition">
                  <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                <!-- Duration Badge -->
                <span class="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                  {{ clip.clip_duration }}s
                </span>
              </div>
              
              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-lg">{{ getTypeIcon(clip.verbatim_type) }}</span>
                  <span 
                    class="text-xs font-medium px-2 py-0.5 rounded-full"
                    [class]="getTypeClass(clip.verbatim_type)"
                  >
                    {{ getTypeLabel(clip.verbatim_type) }}
                  </span>
                </div>
                <h4 class="font-medium text-gray-900 dark:text-white text-sm truncate">
                  {{ clip.smart_title }}
                </h4>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                  "{{ clip.verbatim_text }}"
                </p>
              </div>
              
              <!-- Play Button -->
              <button 
                class="flex-shrink-0 p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full transition opacity-0 group-hover:opacity-100"
                (click)="onClipClick(clip, i); $event.stopPropagation()"
              >
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ClipStackComponent {
  private clipService = inject(ClipService);
  
  @Input() clips: Clip[] = [];
  @Output() clipSelected = new EventEmitter<{ clip: Clip; index: number }>();
  @Output() autoReelRequested = new EventEmitter<void>();

  smartClips = computed(() => {
    return this.clips.map(clip => this.clipService.toSmartClip(clip));
  });

  get totalDuration(): number {
    return this.clips.reduce((sum, clip) => sum + clip.clip_duration, 0);
  }

  onClipClick(clip: SmartClip, index: number): void {
    this.clipSelected.emit({ clip, index });
  }

  playAutoReel(): void {
    this.autoReelRequested.emit();
  }

  getRankClass(index: number): string {
    if (index === 0) return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300';
    if (index === 1) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300';
    if (index === 2) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  }

  getTypeIcon(type: 'critical' | 'negative' | 'positive'): string {
    return this.clipService.getVerbatimConfig(type).icon;
  }

  getTypeClass(type: 'critical' | 'negative' | 'positive'): string {
    const classes = {
      critical: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
      negative: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
      positive: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
    };
    return classes[type];
  }

  getTypeLabel(type: 'critical' | 'negative' | 'positive'): string {
    const labels = {
      critical: 'Crítico',
      negative: 'Negativo',
      positive: 'Positivo'
    };
    return labels[type];
  }
}
