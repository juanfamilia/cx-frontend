import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardConfigService, DashboardConfig, WidgetDefinition } from '../../services/dashboard-config.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-dashboard-configurator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-configurator.component.html',
  styleUrls: ['./dashboard-configurator.component.scss']
})
export class DashboardConfiguratorComponent implements OnInit {
  configs: DashboardConfig[] = [];
  availableWidgets: WidgetDefinition[] = [];
  selectedConfig: DashboardConfig | null = null;
  loading = true;

  roles = ['superadmin', 'admin', 'manager', 'shopper'];

  constructor(
    private dashboardConfigService: DashboardConfigService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;

    // Load available widgets
    this.dashboardConfigService.getAvailableWidgets().subscribe({
      next: (widgets) => {
        this.availableWidgets = widgets;
      },
      error: (err) => {
        console.error('Error loading widgets:', err);
        this.toastService.showError('Error al cargar widgets disponibles');
      }
    });

    // Load configs
    this.dashboardConfigService.getDashboardConfigs().subscribe({
      next: (configs) => {
        this.configs = configs;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading configs:', err);
        this.toastService.showError('Error al cargar configuraciones');
        this.loading = false;
      }
    });
  }

  selectConfig(config: DashboardConfig): void {
    this.selectedConfig = config;
  }

  deleteConfig(config: DashboardConfig): void {
    if (!confirm(`¿Eliminar configuración "${config.name}"?`)) return;

    this.dashboardConfigService.deleteConfig(config.id).subscribe({
      next: () => {
        this.configs = this.configs.filter(c => c.id !== config.id);
        this.toastService.showSuccess('Configuración eliminada');
        if (this.selectedConfig?.id === config.id) {
          this.selectedConfig = null;
        }
      },
      error: (err) => {
        console.error('Error deleting config:', err);
        this.toastService.showError('Error al eliminar configuración');
      }
    });
  }
}
