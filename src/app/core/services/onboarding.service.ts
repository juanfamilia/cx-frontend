import { Injectable } from '@angular/core';

export interface OnboardingStep {
  title: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {

  hasCompletedOnboarding(userId: number): boolean {
    return localStorage.getItem(`onboarding_completed_${userId}`) === 'true';
  }

  markAsCompleted(userId: number): void {
    localStorage.setItem(`onboarding_completed_${userId}`, 'true');
  }

  resetOnboarding(userId: number): void {
    localStorage.removeItem(`onboarding_completed_${userId}`);
  }

  getStepsForRole(role: number): OnboardingStep[] {
    const welcomeMessage = this.getWelcomeMessage(role);

    switch (role) {
      case 0: // Superadmin
        return [
          { title: '¡Bienvenido a Siete CX! 🎉', description: welcomeMessage },
          { title: 'Panel de Control Global', description: 'Administra todas las empresas, usuarios y configuraciones de la plataforma.' },
          { title: 'Gestión de Empresas', description: 'Crea, edita y administra las empresas registradas en el sistema.' },
          { title: 'Gestión de Pagos', description: 'Monitorea el estado de pagos y suscripciones de todas las empresas.' },
          { title: 'Intelligence Dashboard', description: 'Accede a insights globales y métricas de toda la plataforma.' }
        ];

      case 1: // Admin/CEO
        return [
          { title: '¡Bienvenido a Siete CX! 🎉', description: welcomeMessage },
          { title: 'Dashboard Ejecutivo', description: 'Aquí puedes ver las métricas clave de todas tus campañas y operaciones en tiempo real.' },
          { title: 'Crear Campañas', description: 'Crea y gestiona campañas de evaluación para tu organización desde el menú lateral.' },
          { title: 'Gestor de Prompts', description: 'Administra los prompts de IA para personalizar las evaluaciones y notificaciones.' },
          { title: 'Intelligence Dashboard', description: 'Obtén insights automáticos generados por IA para mejorar la experiencia del cliente.' },
          { title: 'Ver Evaluaciones', description: 'Accede a todas las evaluaciones de tu organización para tomar decisiones informadas.' }
        ];

      case 2: // Gerente
        return [
          { title: '¡Bienvenido a Siete CX! 🎉', description: welcomeMessage },
          { title: 'Dashboard de Gerencia', description: 'Monitorea el desempeño de tu equipo y las campañas asignadas.' },
          { title: 'Gestionar Usuarios', description: 'Administra tu equipo de evaluadores y asigna responsabilidades.' },
          { title: 'Crear Formularios', description: 'Crea formularios de evaluación personalizados para tus campañas.' },
          { title: 'Asignar Campañas', description: 'Asigna campañas a los miembros de tu equipo y zonas específicas.' },
          { title: 'Intelligence', description: 'Revisa insights y tendencias de las evaluaciones de tu equipo.' }
        ];

      case 3: // Evaluador
        return [
          { title: '¡Bienvenido a Siete CX! 🎉', description: welcomeMessage },
          { title: 'Mis Campañas', description: 'Aquí encontrarás las campañas asignadas a ti en el menú lateral.' },
          { title: 'Grabar Video', description: 'Graba videos de tus interacciones con clientes para evaluación.' },
          { title: 'Enviar Evaluación', description: 'Completa el formulario de evaluación y envía tu video para revisión.' },
          { title: 'Ver Calificaciones', description: 'Consulta tus calificaciones y el feedback recibido de tus supervisores.' }
        ];

      default:
        return [
          { title: '¡Bienvenido a Siete CX! 🎉', description: 'Bienvenido a la plataforma. Explora las funcionalidades disponibles.' }
        ];
    }
  }

  private getWelcomeMessage(role: number): string {
    switch (role) {
      case 0:
        return 'Bienvenido, Superadmin. Tienes acceso completo a todas las funcionalidades de la plataforma.';
      case 1:
        return 'Bienvenido, Admin. Te guiaremos por las principales funcionalidades para gestionar tu organización.';
      case 2:
        return 'Bienvenido, Gerente. Aprende cómo gestionar tu equipo, crear formularios y revisar evaluaciones.';
      case 3:
        return 'Bienvenido, Evaluador. Te mostraremos cómo grabar videos, completar evaluaciones y ver tus resultados.';
      default:
        return 'Bienvenido a Siete CX.';
    }
  }
}
