import { Component, computed, effect, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourGuideService, TourStep } from '@services/tour-guide.service';

@Component({
  selector: 'app-tour-spotlight',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Overlay with spotlight -->
    @if (isVisible()) {
      <div class="tour-overlay">
        <!-- Dark overlay -->
        <div 
          class="fixed inset-0 bg-black transition-opacity duration-300 z-[9998]"
          [class.opacity-60]="isVisible()"
          [class.opacity-0]="!isVisible()"
          (click)="onOverlayClick()">
        </div>
        
        <!-- Spotlight highlight -->
        @if (targetElement) {
          <div 
            class="tour-spotlight-ring"
            [style.top.px]="spotlightPosition.top"
            [style.left.px]="spotlightPosition.left"
            [style.width.px]="spotlightPosition.width"
            [style.height.px]="spotlightPosition.height">
          </div>
        }
        
        <!-- Tooltip -->
        @if (currentStep()) {
          <div 
            #tooltip
            class="tour-tooltip"
            [style.top.px]="tooltipPosition.top"
            [style.left.px]="tooltipPosition.left"
            [class]="'tour-tooltip-' + (currentStep()?.position || 'bottom')">
            
            <!-- Header -->
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ currentStep()?.title }}
                </h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Paso {{ tourService.getCurrentStepNumber() }} de {{ tourService.getTotalSteps() }}
                </p>
              </div>
              <button
                (click)="onSkip()"
                class="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="Cerrar tour">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <!-- Description -->
            <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {{ currentStep()?.description }}
            </p>
            
            <!-- Progress bar -->
            <div class="mb-4">
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div 
                  class="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
                  [style.width.%]="tourService.getProgress()">
                </div>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="flex items-center justify-between gap-3">
              <button
                (click)="onSkip()"
                class="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                Saltar Tour
              </button>
              
              <div class="flex items-center gap-2">
                @if (!tourService.isFirstStep()) {
                  <button
                    (click)="onPrevious()"
                    class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-bunker-700 hover:bg-gray-300 dark:hover:bg-bunker-600 rounded-md transition-colors">
                    Atrás
                  </button>
                }
                
                @if (tourService.isLastStep()) {
                  <button
                    (click)="onFinish()"
                    class="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-md transition-colors shadow-sm">
                    Finalizar
                  </button>
                } @else {
                  <button
                    (click)="onNext()"
                    class="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-md transition-colors shadow-sm">
                    Siguiente
                  </button>
                }
              </div>
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .tour-overlay {
      position: fixed;
      inset: 0;
      pointer-events: none;
    }
    
    .tour-overlay * {
      pointer-events: auto;
    }
    
    .tour-spotlight-ring {
      position: fixed;
      z-index: 9999;
      border-radius: 8px;
      box-shadow: 
        0 0 0 4px rgba(59, 130, 246, 0.5),
        0 0 0 9999px rgba(0, 0, 0, 0.6);
      pointer-events: none;
      transition: all 0.3s ease-in-out;
    }
    
    .tour-tooltip {
      position: fixed;
      z-index: 10000;
      background: white;
      border-radius: 12px;
      padding: 20px;
      max-width: 400px;
      min-width: 320px;
      box-shadow: 
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
      transition: all 0.3s ease-in-out;
    }
    
    :host-context(.dark) .tour-tooltip {
      background: #1f2937;
      border: 1px solid #374151;
    }
    
    .tour-tooltip::before {
      content: '';
      position: absolute;
      width: 0;
      height: 0;
      border: 8px solid transparent;
    }
    
    .tour-tooltip-top::before {
      bottom: -16px;
      left: 50%;
      transform: translateX(-50%);
      border-top-color: white;
    }
    
    :host-context(.dark) .tour-tooltip-top::before {
      border-top-color: #1f2937;
    }
    
    .tour-tooltip-bottom::before {
      top: -16px;
      left: 50%;
      transform: translateX(-50%);
      border-bottom-color: white;
    }
    
    :host-context(.dark) .tour-tooltip-bottom::before {
      border-bottom-color: #1f2937;
    }
    
    .tour-tooltip-left::before {
      right: -16px;
      top: 50%;
      transform: translateY(-50%);
      border-left-color: white;
    }
    
    :host-context(.dark) .tour-tooltip-left::before {
      border-left-color: #1f2937;
    }
    
    .tour-tooltip-right::before {
      left: -16px;
      top: 50%;
      transform: translateY(-50%);
      border-right-color: white;
    }
    
    :host-context(.dark) .tour-tooltip-right::before {
      border-right-color: #1f2937;
    }
  `]
})
export class TourSpotlightComponent {
  @ViewChild('tooltip') tooltipRef?: ElementRef;
  
  readonly isVisible = this.tourService.isVisible;
  readonly currentStep = this.tourService.currentStep;
  
  targetElement: HTMLElement | null = null;
  spotlightPosition = { top: 0, left: 0, width: 0, height: 0 };
  tooltipPosition = { top: 0, left: 0 };
  
  constructor(public tourService: TourGuideService) {
    // Watch for step changes and update positions
    effect(() => {
      const step = this.currentStep();
      if (step && this.isVisible()) {
        setTimeout(() => this.updatePositions(), 100);
      }
    });
    
    // Update positions on window resize
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => this.updatePositions());
      window.addEventListener('scroll', () => this.updatePositions(), true);
    }
  }
  
  private updatePositions(): void {
    const step = this.currentStep();
    if (!step) return;
    
    // Find target element
    this.targetElement = document.querySelector(step.target);
    
    if (!this.targetElement) {
      // If target not found, center tooltip
      this.centerTooltip();
      return;
    }
    
    // Update spotlight position
    const rect = this.targetElement.getBoundingClientRect();
    const padding = step.highlightPadding || 8;
    
    this.spotlightPosition = {
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + (padding * 2),
      height: rect.height + (padding * 2)
    };
    
    // Update tooltip position
    this.positionTooltip(step.position || 'bottom');
  }
  
  private positionTooltip(position: 'top' | 'bottom' | 'left' | 'right'): void {
    if (!this.targetElement || !this.tooltipRef) {
      this.centerTooltip();
      return;
    }
    
    const targetRect = this.targetElement.getBoundingClientRect();
    const tooltipEl = this.tooltipRef.nativeElement;
    const tooltipRect = tooltipEl.getBoundingClientRect();
    const spacing = 20;
    
    let top = 0;
    let left = 0;
    
    switch (position) {
      case 'top':
        top = targetRect.top - tooltipRect.height - spacing;
        left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
        break;
      
      case 'bottom':
        top = targetRect.bottom + spacing;
        left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
        break;
      
      case 'left':
        top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
        left = targetRect.left - tooltipRect.width - spacing;
        break;
      
      case 'right':
        top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
        left = targetRect.right + spacing;
        break;
    }
    
    // Ensure tooltip stays within viewport
    const padding = 16;
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));
    
    this.tooltipPosition = { top, left };
  }
  
  private centerTooltip(): void {
    setTimeout(() => {
      if (!this.tooltipRef) return;
      
      const tooltipEl = this.tooltipRef.nativeElement;
      const tooltipRect = tooltipEl.getBoundingClientRect();
      
      this.tooltipPosition = {
        top: (window.innerHeight / 2) - (tooltipRect.height / 2),
        left: (window.innerWidth / 2) - (tooltipRect.width / 2)
      };
    }, 0);
  }
  
  onNext(): void {
    this.tourService.nextStep();
  }
  
  onPrevious(): void {
    this.tourService.previousStep();
  }
  
  onSkip(): void {
    this.tourService.stopTour();
  }
  
  onFinish(): void {
    // Get user info from auth service to mark as complete
    // For now, just stop tour
    this.tourService.stopTour();
  }
  
  onOverlayClick(): void {
    // Optionally allow clicking overlay to skip
    // this.onSkip();
  }
}
