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
import { finalize, of } from 'rxjs';
import { TranscriptService, TranscriptSegment } from '../../transcript.service';
import { ShareToasterService } from '@core/services/toast.service';

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
  private toastService = inject(ShareToasterService);

  evaluationId = input.required<number>();
  videoUrl = input<string | null>(null);
  /** Seconds to seek after metadata loads (e.g. from search deep-link). */
  initialSeekSeconds = input<number | null>(null);

  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('transcriptContainer') transcriptContainer!: ElementRef<HTMLDivElement>;

  currentTime = signal<number>(0);
  isPlaying = signal<boolean>(false);
  duration = signal<number>(0);

  activeSegmentId = signal<number | null>(null);
  autoScroll = signal<boolean>(true);

  embeddingsLoading = signal<boolean>(false);

  private timeUpdateInterval: ReturnType<typeof setInterval> | null = null;
  private lastAppliedSeekKey: string | null = null;

  transcriptResource = rxResource<TranscriptSegment[], number>({
    request: () => this.evaluationId(),
    loader: ({ request }) => {
      if (request == null || !Number.isFinite(request) || request <= 0) {
        return of([]);
      }
      return this.transcriptService.getEvaluationSegments(request);
    },
  });

  segments = computed(() => {
    const data = this.transcriptResource.value() || [];
    const currentT = this.currentTime();

    return data.map(seg => ({
      ...seg,
      isActive: currentT >= seg.start_time && currentT < seg.end_time,
      formattedTime: this.transcriptService.formatTime(seg.start_time),
    }));
  });

  constructor() {
    effect(() => {
      const segs = this.segments();
      const activeSeg = segs.find(s => s.isActive);

      if (activeSeg && activeSeg.id !== this.activeSegmentId()) {
        this.activeSegmentId.set(activeSeg.id);

        if (this.autoScroll() && this.transcriptContainer) {
          setTimeout(() => this.scrollToSegment(activeSeg.id), 50);
        }
      }
    });

    effect(() => {
      const t = this.initialSeekSeconds();
      const evId = this.evaluationId();
      queueMicrotask(() => this.trySeekFromRoute(t, evId));
    });
  }

  ngOnDestroy() {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
    }
  }

  onVideoLoadedMetadata(event: Event) {
    const video = event.target as HTMLVideoElement;
    this.duration.set(video.duration);
    this.trySeekFromRoute(this.initialSeekSeconds(), this.evaluationId());
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

  seekTo(seconds: number) {
    if (this.videoPlayer?.nativeElement) {
      this.videoPlayer.nativeElement.currentTime = seconds;
      this.currentTime.set(seconds);

      if (!this.isPlaying()) {
        void this.videoPlayer.nativeElement.play();
      }
    }
  }

  private trySeekFromRoute(t: number | null, evId: number): void {
    if (t == null || t < 0 || !Number.isFinite(t)) {
      return;
    }
    const video = this.videoPlayer?.nativeElement;
    if (!video || video.readyState < HTMLMediaElement.HAVE_METADATA) {
      return;
    }
    const key = `${evId}-${t}`;
    if (this.lastAppliedSeekKey === key) {
      return;
    }
    this.lastAppliedSeekKey = key;
    this.seekTo(t);
  }

  private scrollToSegment(segmentId: number) {
    if (!this.transcriptContainer?.nativeElement) {
      return;
    }

    const container = this.transcriptContainer.nativeElement;
    const element = container.querySelector(`[data-segment-id="${segmentId}"]`);

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }

  toggleAutoScroll() {
    this.autoScroll.update(v => !v);
  }

  formatTime(seconds: number): string {
    return this.transcriptService.formatTime(seconds);
  }

  generateEmbeddings() {
    if (this.embeddingsLoading()) {
      return;
    }
    this.embeddingsLoading.set(true);
    this.transcriptService
      .generateEmbeddings(this.evaluationId())
      .pipe(finalize(() => this.embeddingsLoading.set(false)))
      .subscribe({
        next: res => {
          const message =
            res &&
            typeof res === 'object' &&
            'message' in res &&
            typeof (res as { message: unknown }).message === 'string'
              ? (res as { message: string }).message
              : 'Solicitud registrada. El proceso puede tardar unos minutos.';
          this.toastService.showToast('success', 'Embeddings', message);
        },
        error: () => {
          this.toastService.showToast(
            'error',
            'Embeddings',
            'No se pudieron generar los embeddings. Intente de nuevo más tarde.'
          );
        },
      });
  }
}
