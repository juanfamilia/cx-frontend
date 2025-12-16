import { Injectable } from '@angular/core';

export interface OnboardingStep {
  title: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {

  hasCompletedOnboarding(): boolean {
    return localStorage.getItem('onboarding_completed') === 'true';
  }

  markAsCompleted(): void {
    localStorage.setItem('onboarding_completed', 'true');
  }

  resetOnboarding(): void {
    localStorage.removeItem('onboarding_completed');
  }

  getStepsForRole(role: number): OnboardingStep[] {
    return this.getStepsForRoleInternal(role);
  }

  private getStepsForRoleInternal(role: number): OnboardingStep[] {
    const welcomeMessage = this.getWelcomeMessage(role);

    switch (role) {
      case 1: // Admin/CEO
        return [
          { title: '¡Bienvenido a Siete CX! 🎉', description: welcomeMessage },
          { title: 'Dashboard Ejecutivo', description: 'Aquí puedes ver las métricas clave de todas tus campañas y operaciones en tiempo real.' },
          { title: 'Crear Campañas', description: 'Como Admin, puedes crear y gestionar campañas para toda tu organización desde el menú lateral.' },
          { title: 'Gestor de Prompts', description: 'Administra los prompts de IA para personalizar las evaluaciones y notificaciones.' },
          { title: 'Ver Evaluaciones', description: 'Accede a todas las evaluaciones de tu organización para tomar decisiones informadas.' }
        ];

      case 2: // Gerente
        return [
          { title: '¡Bienvenido a Siete CX! 🎉', description: welcomeMessage },
          { title: 'Dashboard de Gerencia', description: 'Monitorea el desempeño de tu equipo y las campañas asignadas.' },
          { title: 'Gestionar Usuarios', description: 'Administra tu equipo de evaluadores y asigna responsabilidades.' },
          { title: 'Crear Formularios', description: 'Crea formularios de evaluación personalizados para tus campañas.' },
          { title: 'Asignar Campañas', description: 'Asigna campañas a los miembros de tu equipo y zonas específicas.' }
        ];

      case 3: // Evaluador
        return [
          { title: '¡Bienvenido a Siete CX! 🎉', description: welcomeMessage },
          { title: 'Mis Campañas', description: 'Aquí encontrarás las campañas asignadas a ti.' },
          { title: 'Grabar Video', description: 'Graba videos de tus interacciones con clientes.' },
          { title: 'Enviar Evaluación', description: 'Completa el formulario y envía tu video para revisión.' },
          { title: 'Ver Calificaciones', description: 'Consulta tus calificaciones y el feedback recibido.' }
        ];

      default:
        return [
          { title: '¡Bienvenido a Siete CX! 🎉', description: 'Bienvenido a la plataforma. Explora las funcionalidades disponibles.' }
        ];
    }
  }

  private getWelcomeMessage(role: number): string {
    switch (role) {
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
