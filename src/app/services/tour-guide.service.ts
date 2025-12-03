import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector
  route?: string; // Navigate to route before showing step
  position?: 'top' | 'bottom' | 'left' | 'right';
  highlightPadding?: number;
  action?: {
    label: string;
    callback: () => void;
  };
}

export interface TourConfig {
  id: string;
  name: string;
  steps: TourStep[];
  role: number; // User role for this tour
}

@Injectable({
  providedIn: 'root'
})
export class TourGuideService {
  
  private currentTour = signal<TourConfig | null>(null);
  private currentStepIndex = signal<number>(0);
  private isActive = signal<boolean>(false);
  
  readonly currentStep = signal<TourStep | null>(null);
  readonly isVisible = signal<boolean>(false);
  
  constructor(private router: Router) {}
  
  /**
   * Check if user has completed onboarding for their role
   */
  hasCompletedOnboarding(userId: number, role: number): boolean {
    const key = `onboarding_completed_${userId}_${role}`;
    return localStorage.getItem(key) === 'true';
  }
  
  /**
   * Mark onboarding as completed for user
   */
  markOnboardingComplete(userId: number, role: number): void {
    const key = `onboarding_completed_${userId}_${role}`;
    localStorage.setItem(key, 'true');
    this.stopTour();
  }
  
  /**
   * Reset onboarding for user (for testing)
   */
  resetOnboarding(userId: number, role: number): void {
    const key = `onboarding_completed_${userId}_${role}`;
    localStorage.removeItem(key);
  }
  
  /**
   * Start a tour
   */
  startTour(tourConfig: TourConfig): void {
    this.currentTour.set(tourConfig);
    this.currentStepIndex.set(0);
    this.isActive.set(true);
    this.showCurrentStep();
  }
  
  /**
   * Stop the tour
   */
  stopTour(): void {
    this.isActive.set(false);
    this.isVisible.set(false);
    this.currentTour.set(null);
    this.currentStep.set(null);
    this.currentStepIndex.set(0);
  }
  
  /**
   * Go to next step
   */
  nextStep(): void {
    const tour = this.currentTour();
    if (!tour) return;
    
    const nextIndex = this.currentStepIndex() + 1;
    if (nextIndex < tour.steps.length) {
      this.currentStepIndex.set(nextIndex);
      this.showCurrentStep();
    } else {
      this.completeTour();
    }
  }
  
  /**
   * Go to previous step
   */
  previousStep(): void {
    const prevIndex = this.currentStepIndex() - 1;
    if (prevIndex >= 0) {
      this.currentStepIndex.set(prevIndex);
      this.showCurrentStep();
    }
  }
  
  /**
   * Skip to specific step
   */
  goToStep(stepIndex: number): void {
    const tour = this.currentTour();
    if (!tour || stepIndex < 0 || stepIndex >= tour.steps.length) return;
    
    this.currentStepIndex.set(stepIndex);
    this.showCurrentStep();
  }
  
  /**
   * Complete the tour
   */
  private completeTour(): void {
    this.stopTour();
  }
  
  /**
   * Show current step
   */
  private async showCurrentStep(): Promise<void> {
    const tour = this.currentTour();
    if (!tour) return;
    
    const step = tour.steps[this.currentStepIndex()];
    if (!step) return;
    
    // Navigate to route if specified
    if (step.route) {
      await this.router.navigate([step.route]);
      // Wait for navigation and DOM to settle
      await this.delay(500);
    }
    
    // Set current step
    this.currentStep.set(step);
    this.isVisible.set(true);
    
    // Scroll to target element if it exists
    this.scrollToTarget(step.target);
  }
  
  /**
   * Scroll to target element
   */
  private scrollToTarget(selector: string): void {
    setTimeout(() => {
      const element = document.querySelector(selector);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 100);
  }
  
  /**
   * Get progress percentage
   */
  getProgress(): number {
    const tour = this.currentTour();
    if (!tour) return 0;
    return ((this.currentStepIndex() + 1) / tour.steps.length) * 100;
  }
  
  /**
   * Check if this is the first step
   */
  isFirstStep(): boolean {
    return this.currentStepIndex() === 0;
  }
  
  /**
   * Check if this is the last step
   */
  isLastStep(): boolean {
    const tour = this.currentTour();
    if (!tour) return false;
    return this.currentStepIndex() === tour.steps.length - 1;
  }
  
  /**
   * Get current step number (1-based)
   */
  getCurrentStepNumber(): number {
    return this.currentStepIndex() + 1;
  }
  
  /**
   * Get total steps
   */
  getTotalSteps(): number {
    const tour = this.currentTour();
    return tour ? tour.steps.length : 0;
  }
  
  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Get evaluator (role 3) onboarding tour
   */
  getEvaluatorTour(): TourConfig {
    return {
      id: 'evaluator-onboarding',
      name: 'Tour de Bienvenida para Evaluadores',
      role: 3,
      steps: [
        {
          id: 'welcome',
          title: '¡Bienvenido a Siete CX! 👋',
          description: 'Te guiaremos paso a paso para que aprendas a usar la plataforma. Este tour te tomará aproximadamente 2 minutos.',
          target: 'body',
          position: 'bottom'
        },
        {
          id: 'dashboard',
          title: 'Tu Dashboard Personal',
          description: 'Aquí verás un resumen de tus evaluaciones: pendientes, completadas y tu progreso general.',
          target: '[data-tour="dashboard-overview"]',
          route: '/',
          position: 'bottom'
        },
        {
          id: 'sidebar-evaluations',
          title: 'Menú de Evaluaciones',
          description: 'Haz clic aquí para ver todas tus evaluaciones asignadas.',
          target: '[data-tour="sidebar-evaluations"]',
          position: 'right'
        },
        {
          id: 'evaluations-list',
          title: 'Tus Evaluaciones',
          description: 'Aquí aparecerán todas las evaluaciones que te han asignado. Puedes filtrarlas por estado.',
          target: '[data-tour="evaluations-table"]',
          route: '/evaluations',
          position: 'top'
        },
        {
          id: 'create-evaluation',
          title: 'Registrar Nueva Evaluación',
          description: 'Haz clic en este botón para crear una nueva evaluación. Podrás grabar video y completar el formulario.',
          target: '[data-tour="create-evaluation-btn"]',
          route: '/evaluations',
          position: 'left'
        },
        {
          id: 'evaluation-form',
          title: 'Formulario de Evaluación',
          description: 'Aquí completarás el formulario de evaluación. Asegúrate de responder todas las preguntas requeridas.',
          target: '[data-tour="evaluation-form"]',
          route: '/evaluations/create',
          position: 'top'
        },
        {
          id: 'video-upload',
          title: 'Subir Video',
          description: 'Puedes grabar o subir un video de tu interacción con el cliente. El sistema lo analizará automáticamente.',
          target: '[data-tour="video-upload"]',
          route: '/evaluations/create',
          position: 'bottom'
        },
        {
          id: 'notifications',
          title: 'Notificaciones',
          description: 'Aquí recibirás notificaciones sobre tus evaluaciones: aprobaciones, rechazos y comentarios de tus supervisores.',
          target: '[data-tour="notifications-btn"]',
          position: 'bottom'
        },
        {
          id: 'user-menu',
          title: 'Tu Perfil',
          description: 'Desde aquí puedes acceder a tu configuración personal y cerrar sesión.',
          target: '[data-tour="user-menu"]',
          position: 'bottom'
        },
        {
          id: 'complete',
          title: '¡Todo Listo! 🎉',
          description: 'Ya conoces lo básico de Siete CX. Puedes repetir este tour en cualquier momento desde tu perfil. ¡Éxito en tus evaluaciones!',
          target: 'body',
          position: 'bottom'
        }
      ]
    };
  }
  
  /**
   * Get admin (role 1) onboarding tour
   */
  getAdminTour(): TourConfig {
    return {
      id: 'admin-onboarding',
      name: 'Tour de Bienvenida para Administradores',
      role: 1,
      steps: [
        {
          id: 'welcome',
          title: '¡Bienvenido a Siete CX! 👋',
          description: 'Como administrador, tienes acceso completo a todas las funcionalidades. Te mostraremos las principales.',
          target: 'body',
          position: 'bottom'
        },
        {
          id: 'dashboard',
          title: 'Dashboard Ejecutivo',
          description: 'Visualiza métricas clave de toda tu organización: evaluaciones, campañas activas y tendencias.',
          target: '[data-tour="dashboard-overview"]',
          route: '/',
          position: 'bottom'
        },
        {
          id: 'users',
          title: 'Gestión de Usuarios',
          description: 'Administra todos los usuarios de tu organización: gerentes y evaluadores.',
          target: '[data-tour="sidebar-users"]',
          position: 'right'
        },
        {
          id: 'campaigns',
          title: 'Campañas',
          description: 'Crea y gestiona campañas de evaluación para tu organización.',
          target: '[data-tour="sidebar-campaigns"]',
          position: 'right'
        },
        {
          id: 'survey-forms',
          title: 'Formularios',
          description: 'Diseña formularios personalizados de evaluación con las preguntas que necesites.',
          target: '[data-tour="sidebar-survey-forms"]',
          position: 'right'
        },
        {
          id: 'intelligence',
          title: 'Intelligence CX',
          description: 'Obtén insights avanzados y análisis predictivos con IA sobre tus evaluaciones.',
          target: '[data-tour="sidebar-intelligence"]',
          position: 'right'
        },
        {
          id: 'complete',
          title: '¡Configuración Completa! 🎉',
          description: 'Ya conoces las herramientas principales. Explora cada sección para descubrir más funcionalidades.',
          target: 'body',
          position: 'bottom'
        }
      ]
    };
  }
  
  /**
   * Get manager (role 2) onboarding tour
   */
  getManagerTour(): TourConfig {
    return {
      id: 'manager-onboarding',
      name: 'Tour de Bienvenida para Gerentes',
      role: 2,
      steps: [
        {
          id: 'welcome',
          title: '¡Bienvenido a Siete CX! 👋',
          description: 'Como gerente, puedes gestionar tu equipo y revisar evaluaciones. Te mostramos cómo.',
          target: 'body',
          position: 'bottom'
        },
        {
          id: 'dashboard',
          title: 'Dashboard de Gerencia',
          description: 'Monitorea el desempeño de tu equipo y las campañas asignadas a tu área.',
          target: '[data-tour="dashboard-overview"]',
          route: '/',
          position: 'bottom'
        },
        {
          id: 'team-users',
          title: 'Tu Equipo',
          description: 'Administra los evaluadores de tu equipo y revisa su desempeño.',
          target: '[data-tour="sidebar-users"]',
          position: 'right'
        },
        {
          id: 'evaluations',
          title: 'Revisar Evaluaciones',
          description: 'Revisa las evaluaciones completadas por tu equipo, apruébalas o solicita correcciones.',
          target: '[data-tour="sidebar-evaluations"]',
          position: 'right'
        },
        {
          id: 'campaigns',
          title: 'Campañas Asignadas',
          description: 'Visualiza las campañas asignadas a tu área y asígnalas a miembros de tu equipo.',
          target: '[data-tour="sidebar-campaigns"]',
          position: 'right'
        },
        {
          id: 'complete',
          title: '¡Listo para Gestionar! 🎉',
          description: 'Ya conoces las herramientas para gestionar tu equipo efectivamente.',
          target: 'body',
          position: 'bottom'
        }
      ]
    };
  }
}
