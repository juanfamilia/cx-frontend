import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranscriptService, TranscriptSegment } from '../../transcript.service';
import { of } from 'rxjs';

@Component({
  selector: 'app-interaction-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './interaction-player.component.html',
  styleUrl: './interaction-player.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InteractionPlayerComponent implements OnDestroy {
  private transcriptService = inject(TranscriptService);
  
  // Inputs
  evaluationId = input.required<number>();
  videoUrl = input<string | null>(null);
  
  // Video element reference
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('transcriptContainer') transcriptContainer!: ElementRef<HTMLDivElement>;
  
  // State signals
  currentTime = signal<number>(0);
  isPlaying = signal<boolean>(false);
  duration = signal<number>(0);
  
  // Active segment tracking
  activeSegmentId = signal<number | null>(null);
  
  // Auto-scroll toggle
  autoScroll = signal<boolean>(true);
  
  // Interval for time updates
  private timeUpdateInterval: ReturnType<typeof setInterval> | null = null;
  
  // Load transcript segments
  transcriptResource = rxResource<TranscriptSegment[], number>({
    request: () => this.evaluationId(),
    loader: ({ request }) => {
      if (!request) return of([]);
      return this.transcriptService.getEvaluationTranscript(request).pipe(
        // Extract data array from response
        // @ts-ignore
        map((response: any) => response.data || [])
      );
    },
  });
  
  // Computed: segments with active state
  segments = computed(() => {
    const data = this.transcriptResource.value() || [];
    const currentT = this.currentTime();
    
    return data.map(seg => ({
      ...seg,
      isActive: currentT >= seg.start_time && currentT < seg.end_time,
      formattedTime: this.transcriptService.formatTime(seg.start_time),
    }));
  });
  
  // Track active segment and auto-scroll
  constructor() {
    effect(() => {
      const segs = this.segments();
      const activeSeg = segs.find(s => s.isActive);
      
      if (activeSeg && activeSeg.id !== this.activeSegmentId()) {
        this.activeSegmentId.set(activeSeg.id);
        
        // Auto-scroll to active segment
        if (this.autoScroll() && this.transcriptContainer) {
          setTimeout(() => this.scrollToSegment(activeSeg.id), 50);
        }
      }
    });
  }
  
  ngOnDestroy() {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
    }
  }
  
  // Video event handlers
  onVideoLoadedMetadata(event: Event) {
    const video = event.target as HTMLVideoElement;
    this.duration.set(video.duration);
  }
  
  onVideoTimeUpdate(event: Event) {
    const video = event.target as HTMLVideoElement;
    this.currentTime.set(video.currentTime);
  }
  
  onVideoPlay() {
    this.isPlaying.set(true);
  }
  
  onVideoPause() {
    this.isPlaying.set(false);
  }
  
  // Jump to specific timestamp
  seekTo(seconds: number) {
    if (this.videoPlayer?.nativeElement) {
      this.videoPlayer.nativeElement.currentTime = seconds;
      this.currentTime.set(seconds);
      
      // Auto-play when clicking transcript
      if (!this.isPlaying()) {
        this.videoPlayer.nativeElement.play();
      }
    }
  }
  
  // Scroll transcript to segment
  private scrollToSegment(segmentId: number) {
    if (!this.transcriptContainer?.nativeElement) return;
    
    const container = this.transcriptContainer.nativeElement;
    const element = container.querySelector(`[data-segment-id="${segmentId}"]`);
    
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }
  
  // Toggle auto-scroll
  toggleAutoScroll() {
    this.autoScroll.update(v => !v);
  }
  
  // Format time helper
  formatTime(seconds: number): string {
    return this.transcriptService.formatTime(seconds);
  }
}

// Import map operator
import { map } from 'rxjs/operators';
