import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IntelligenceService,
  Insight,
  Trend,
  AITag,
} from '@app/services/intelligence.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-intelligence-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './intelligence-dashboard.component.html',
  styleUrls: ['./intelligence-dashboard.component.scss'],
})
export class IntelligenceDashboardComponent implements OnInit {
  private intelligenceService = inject(IntelligenceService);
  private router = inject(Router);

  insights = signal<Insight[]>([]);
  trends = signal<Trend[]>([]);
  aiTags = signal<AITag[]>([]);
  loading = signal(true);
  selectedTab = signal<'insights' | 'trends' | 'tags'>('insights');

  // Summary stats
  totalInsights = signal(0);
  unreadInsights = signal(0);
  criticalInsights = signal(0);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);

    // Load insights
    this.intelligenceService.getInsights({ limit: 50 }).subscribe({
      next: (response) => {
        this.insights.set(response.data);
        this.totalInsights.set(response.total);
        this.unreadInsights.set(
          response.data.filter((i) => !i.is_read).length
        );
        this.criticalInsights.set(
          response.data.filter((i) => i.severity === 'critical').length
        );
      },
      error: (err) => console.error('Error loading insights:', err),
    });

    // Load trends
    this.intelligenceService.getTrends({ limit: 20 }).subscribe({
      next: (response) => {
        this.trends.set(response.data);
      },
      error: (err) => console.error('Error loading trends:', err),
    });

    // Load AI tags
    this.intelligenceService.getAITags({ limit: 30 }).subscribe({
      next: (response) => {
        this.aiTags.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading AI tags:', err);
        this.loading.set(false);
      },
    });
  }

  markAsRead(insightId: number): void {
    this.intelligenceService.markInsightAsRead(insightId).subscribe({
      next: () => {
        // Update local state
        const updated = this.insights().map((insight) =>
          insight.id === insightId ? { ...insight, is_read: true } : insight
        );
        this.insights.set(updated);
        this.unreadInsights.set(this.unreadInsights() - 1);
      },
      error: (err) => console.error('Error marking insight as read:', err),
    });
  }

  getSeverityColor(severity: string): string {
    const colors: Record<string, string> = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-blue-100 text-blue-800 border-blue-300',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800 border-gray-300';
  }

  getSeverityIcon(severity: string): string {
    const icons: Record<string, string> = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🔵',
    };
    return icons[severity] || '⚪';
  }

  getTrendIcon(direction?: string): string {
    const icons: Record<string, string> = {
      improving: '📈',
      declining: '📉',
      stable: '➡️',
    };
    return icons[direction || 'stable'] || '➡️';
  }

  getTrendColor(direction?: string): string {
    const colors: Record<string, string> = {
      improving: 'text-green-600',
      declining: 'text-red-600',
      stable: 'text-gray-600',
    };
    return colors[direction || 'stable'] || 'text-gray-600';
  }

  selectTab(tab: 'insights' | 'trends' | 'tags'): void {
    this.selectedTab.set(tab);
  }
}
