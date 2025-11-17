import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface OnboardingStep {
  title: string;
  description: string;
  target?: string;
}

@Component({
  selector: 'app-onboarding-tour',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isVisible && currentStep) {
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- Overlay -->
        <div 
          class="absolute inset-0 bg-black bg-opacity-50"
          (click)="onSkip()">
        </div>
        
        <!-- Tour Card -->
        <div class="relative z-10 w-full max-w-md mx-4 bg-white dark:bg-bunker-800 rounded-lg shadow-2xl">
          <!-- Header -->
          <div class="bg-primary-500 dark:bg-primary-600 px-6 py-4 rounded-t-lg">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-white">
                {{ currentStep.title }}
              </h3>
              <button
                (click)="onSkip()"
                class="text-white hover:text-gray-200 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Content -->
          <div class="px-6 py-6">
            <p class="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
              {{ currentStep.description }}
            </p>
            
            <!-- Progress -->
            <div class="mt-6 flex items-center gap-1">
              @for (step of steps; track $index) {
                <div 
                  class="h-2 flex-1 rounded-full transition-colors"
                  [class.bg-primary-500]="$index <= currentStepIndex"
                  [class.bg-gray-300]="$index > currentStepIndex">
                </div>
              }
            </div>
          </div>
          
          <!-- Footer -->
          <div class="px-6 py-4 bg-gray-50 dark:bg-bunker-900 rounded-b-lg flex items-center justify-between">
            <button
              (click)="onSkip()"
              class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
              Saltar Tour
            </button>
            
            <div class="flex items-center gap-2">
              @if (currentStepIndex > 0) {
                <button
                  (click)="previousStep()"
                  class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-bunker-700 hover:bg-gray-300 dark:hover:bg-bunker-600 rounded-md transition-colors">
                  Atrás
                </button>
              }
              
              @if (currentStepIndex < steps.length - 1) {
                <button
                  (click)="nextStep()"
                  class="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-md transition-colors">
                  Siguiente
                </button>
              } @else {
                <button
                  (click)="onComplete()"
                  class="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-md transition-colors">
                  Finalizar
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class OnboardingTourComponent {
  @Input() steps: OnboardingStep[] = [];
  @Input() isVisible = false;
  @Output() complete = new EventEmitter<void>();
  @Output() skip = new EventEmitter<void>();
  
  currentStepIndex = 0;
  
  get currentStep(): OnboardingStep | null {
    return this.steps[this.currentStepIndex] || null;
  }
  
  nextStep(): void {
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
    }
  }
  
  previousStep(): void {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
    }
  }
  
  onComplete(): void {
    this.complete.emit();
    this.isVisible = false;
  }
  
  onSkip(): void {
    this.skip.emit();
    this.isVisible = false;
  }
}
