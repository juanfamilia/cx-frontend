import { Injectable } from '@angular/core';
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

export interface OnboardingStep {
  id: string;
  target: string;
  title: string;
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  private tour: any = null;

  /**
   * Verifica si el usuario ya completó el onboarding
   */
  hasCompletedOnboarding(): boolean {
    return localStorage.getItem('onboarding_completed') === 'true';
  }

  /**
   * Marca el onboarding como completado
   */
  markAsCompleted(): void {
    localStorage.setItem('onboarding_completed', 'true');
  }

  /**
   * Reinicia el onboarding (para testing o re-tour)
   */
  resetOnboarding(): void {
    localStorage.removeItem('onboarding_completed');
  }

  /**
   * Inicia el tour de onboarding según el rol del usuario
   * @param role - El rol del usuario (1=CEO, 2=Gerente, 3=Operario)
   */
  startOnboarding(role: number): void {
    if (this.tour) {
      this.tour.complete();
    }

    this.tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        classes: 'shepherd-theme-custom',
        scrollTo: { behavior: 'smooth', block: 'center' },
        cancelIcon: {
          enabled: true
        }
      }
    });

    // Configurar pasos según el rol
    const steps = this.getStepsForRole(role);
    
    steps.forEach((step, index) => {
      this.tour!.addStep({
        id: step.id,
        text: step.text,
        attachTo: {
          element: step.target,
          on: step.position || 'bottom'
        },
        buttons: this.getButtonsForStep(index, steps.length),
        title: step.title
      });
    });

    // Evento cuando se completa el tour
    this.tour.on('complete', () => {
      this.markAsCompleted();
    });

    // Evento cuando se cancela el tour
    this.tour.on('cancel', () => {
      // Opcional: puedes decidir si marcarlo como completado o no
      this.markAsCompleted();
    });

    this.tour.start();
  }

  /**
   * Retorna los pasos del tour según el rol del usuario
   */
  private getStepsForRole(role: number): OnboardingStep[] {
    const commonSteps: OnboardingStep[] = [
      {
        id: 'welcome',
        target: 'body',
        title: '¡Bienvenido a Siete CX! 🎉',
        text: this.getWelcomeMessage(role),
        position: 'bottom'
      }
    ];

    switch (role) {
      case 1: // CEO
        return [
          ...commonSteps,
          {
            id: 'dashboard',
            target: '[data-onboarding="dashboard"]',
            title: 'Dashboard Ejecutivo',
            text: 'Aquí puedes ver las métricas clave de todas tus campañas y operaciones en tiempo real.',
            position: 'bottom'
          },
          {
            id: 'create-campaign',
            target: '[data-onboarding="create-campaign"]',
            title: 'Crear Campañas',
            text: 'Como CEO, puedes crear y gestionar campañas para toda tu organización.',
            position: 'right'
          },
          {
            id: 'view-evaluations',
            target: '[data-onboarding="evaluations"]',
            title: 'Ver Evaluaciones',
            text: 'Accede a todas las evaluaciones de tu organización para tomar decisiones informadas.',
            position: 'right'
          },
          {
            id: 'intelligence',
            target: '[data-onboarding="intelligence"]',
            title: 'Intelligence & Analytics',
            text: 'Obtén insights avanzados y análisis predictivos de tus operaciones.',
            position: 'right'
          }
        ];

      case 2: // Gerente Funcional
        return [
          ...commonSteps,
          {
            id: 'dashboard',
            target: '[data-onboarding="dashboard"]',
            title: 'Dashboard de Gerencia',
            text: 'Monitorea el desempeño de tu equipo y las campañas asignadas.',
            position: 'bottom'
          },
          {
            id: 'manage-users',
            target: '[data-onboarding="users"]',
            title: 'Gestionar Usuarios',
            text: 'Administra tu equipo de operarios y asigna responsabilidades.',
            position: 'right'
          },
          {
            id: 'create-form',
            target: '[data-onboarding="survey-forms"]',
            title: 'Crear Formularios',
            text: 'Crea formularios de evaluación personalizados para tus campañas.',
            position: 'right'
          },
          {
            id: 'assign-campaign',
            target: '[data-onboarding="campaigns"]',
            title: 'Asignar Campañas',
            text: 'Asigna campañas a los miembros de tu equipo y zonas específicas.',
            position: 'right'
          },
          {
            id: 'view-evaluations',
            target: '[data-onboarding="evaluations"]',
            title: 'Revisar Evaluaciones',
            text: 'Revisa las evaluaciones completadas por tu equipo y proporciona feedback.',
            position: 'right'
          }
        ];

      case 3: // Operario
        return [
          ...commonSteps,
          {
            id: 'my-campaigns',
            target: '[data-onboarding="campaigns"]',
            title: 'Mis Campañas',
            text: 'Aquí encontrarás las campañas asignadas a ti.',
            position: 'right'
          },
          {
            id: 'record-video',
            target: '[data-onboarding="record-video"]',
            title: 'Grabar Video',
            text: 'Graba videos de tus interacciones con clientes para evaluación.',
            position: 'bottom'
          },
          {
            id: 'view-video',
            target: '[data-onboarding="view-video"]',
            title: 'Ver Video',
            text: 'Visualiza tus videos grabados antes de enviarlos para evaluación.',
            position: 'bottom'
          },
          {
            id: 'submit-evaluation',
            target: '[data-onboarding="submit-evaluation"]',
            title: 'Enviar Evaluación',
            text: 'Completa el formulario de evaluación y envía tu video para revisión.',
            position: 'bottom'
          },
          {
            id: 'view-feedback',
            target: '[data-onboarding="evaluations"]',
            title: 'Ver Calificaciones',
            text: 'Consulta tus calificaciones y el feedback recibido de tus supervisores.',
            position: 'right'
          }
        ];

      default:
        return commonSteps;
    }
  }

  /**
   * Genera el mensaje de bienvenida según el rol
   */
  private getWelcomeMessage(role: number): string {
    switch (role) {
      case 1:
        return 'Bienvenido, CEO. Te guiaremos por las principales funcionalidades para gestionar tu organización de manera efectiva.';
      case 2:
        return 'Bienvenido, Gerente. Aprende cómo gestionar tu equipo, crear formularios y revisar evaluaciones.';
      case 3:
        return 'Bienvenido, Operario. Te mostraremos cómo grabar videos, completar evaluaciones y ver tus resultados.';
      default:
        return 'Bienvenido a Siete CX. Te guiaremos por las principales funcionalidades de la plataforma.';
    }
  }

  /**
   * Genera los botones para cada paso
   */
  private getButtonsForStep(index: number, totalSteps: number): any[] {
    const buttons: any[] = [];

    // Botón "Atrás" (excepto en el primer paso)
    if (index > 0) {
      buttons.push({
        text: 'Atrás',
        action: () => this.tour?.back(),
        classes: 'shepherd-button-secondary'
      });
    }

    // Botón "Siguiente" o "Finalizar"
    if (index < totalSteps - 1) {
      buttons.push({
        text: 'Siguiente',
        action: () => this.tour?.next(),
        classes: 'shepherd-button-primary'
      });
    } else {
      buttons.push({
        text: 'Finalizar',
        action: () => this.tour?.complete(),
        classes: 'shepherd-button-primary'
      });
    }

    // Botón "Saltar Tour"
    buttons.push({
      text: 'Saltar Tour',
      action: () => this.tour?.cancel(),
      classes: 'shepherd-button-secondary'
    });

    return buttons;
  }

  /**
   * Cancela el tour actual
   */
  cancelTour(): void {
    if (this.tour) {
      this.tour.cancel();
    }
  }
}
