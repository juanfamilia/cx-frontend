/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import {
  AnalysisData,
  EvaluationAnalysisDashboard,
} from '@interfaces/evaluation-analysis-dashboard';
import { ThemeServiceService } from '@services/theme-service.service';
import { BarChart, LineChart, PieChart, RadarChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';

echarts.use([
  BarChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
  TitleComponent,
  PieChart,
  RadarChart,
]);

@Component({
  selector: 'app-dashboard-admin-charts',
  standalone: true,
  imports: [NgxEchartsDirective],
  templateUrl: './dashboard-admin-charts.component.html',
  styleUrls: ['./dashboard-admin-charts.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideEchartsCore({ echarts })],
})
export class DashboardAdminChartsComponent implements OnInit {
  analysis = input.required<EvaluationAnalysisDashboard[]>();

  themeService = inject(ThemeServiceService);

  barChart: echarts.EChartsCoreOption = {};
  radarChart: echarts.EChartsCoreOption = {};
  lineChart: echarts.EChartsCoreOption = {};
  isDarkMode = this.themeService.darkMode();

  qualities = [
    'saludo',
    'identificacion',
    'ofrecimiento',
    'cierre',
    'valor agregado',
  ];

  ngOnInit(): void {
    const data = this.analysis().map(campaign => ({
      campaign_name: campaign.campaign_name,
      operative_views: campaign.operative_views.map(v => JSON.parse(v)),
    }));
    this.createBarChart(data);
    this.createRadarChart(data);
    this.createLineChart(data);
  }

  createBarChart(data: AnalysisData[]): void {
    const campaigns = data.map(c => c.campaign_name);
    const ioc = data.map(c => this.promedio(c.operative_views, 'IOC'));
    const ird = data.map(c => this.promedio(c.operative_views, 'IRD'));
    const ces = data.map(c => this.promedio(c.operative_views, 'CES'));

    const textColor = this.isDarkMode ? '#E0E0E0' : '#333';
    const axisLineColor = this.isDarkMode ? '#555' : '#ccc';
    const gridLineColor = this.isDarkMode ? 'rgba(255,255,255,0.1)' : '#f0f0f0';

    this.barChart = {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', textStyle: { color: textColor } },
      legend: { data: ['IOC', 'IRD', 'CES'], textStyle: { color: textColor } },
      xAxis: {
        type: 'category',
        data: campaigns,
        axisLine: { lineStyle: { color: axisLineColor } },
        axisLabel: { color: textColor },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: axisLineColor } },
        axisLabel: { color: textColor },
        splitLine: { lineStyle: { color: gridLineColor } },
      },
      series: [
        {
          name: 'IOC',
          type: 'bar',
          data: ioc,
          itemStyle: { color: '#42A5F5' },
        },
        {
          name: 'IRD',
          type: 'bar',
          data: ird,
          itemStyle: { color: '#FF7043' },
        },
        {
          name: 'CES',
          type: 'bar',
          data: ces,
          itemStyle: { color: '#66BB6A' },
        },
      ],
    };
  }

  createRadarChart(data: AnalysisData[]): void {
    const textColor = this.isDarkMode ? '#E0E0E0' : '#333';
    const axisLineColor = this.isDarkMode ? '#555' : '#ccc';
    const splitLineColor = this.isDarkMode
      ? 'rgba(255,255,255,0.1)'
      : '#f0f0f0';

    this.radarChart = {
      backgroundColor: 'transparent',
      tooltip: { textStyle: { color: textColor } },
      legend: {
        data: data.map(c => c.campaign_name),
        textStyle: { color: textColor },
      },
      radar: {
        indicator: this.qualities.map(q => ({
          name: q,
          max: 100,
          color: textColor,
        })),
        axisLine: { lineStyle: { color: axisLineColor } },
        splitLine: { lineStyle: { color: splitLineColor } },
        splitArea: {
          areaStyle: {
            color: this.isDarkMode ? 'rgba(255,255,255,0.05)' : '#f9f9f9',
          },
        },
      },
      series: [
        {
          type: 'radar',
          data: data.map(c => ({
            value: this.promedioCalidad(c.operative_views),
            name: c.campaign_name,
          })),
          label: { color: textColor },
        },
      ],
    };
  }

  createLineChart(data: AnalysisData[]): void {
    const textColor = this.isDarkMode ? '#E0E0E0' : '#333';
    const axisLineColor = this.isDarkMode ? '#555' : '#ccc';
    const gridLineColor = this.isDarkMode ? 'rgba(255,255,255,0.1)' : '#f0f0f0';

    const allViews = data.flatMap(c =>
      c.operative_views.map(v => ({
        campaign: c.campaign_name,
        date: new Date(v.timestamp_analisis),
        ioc: v.IOC.score,
      }))
    );

    this.lineChart = {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', textStyle: { color: textColor } },
      xAxis: {
        type: 'time',
        axisLine: { lineStyle: { color: axisLineColor } },
        axisLabel: { color: textColor },
        splitLine: { lineStyle: { color: gridLineColor } },
      },
      yAxis: {
        type: 'value',
        name: 'IOC',
        axisLine: { lineStyle: { color: axisLineColor } },
        axisLabel: { color: textColor },
        splitLine: { lineStyle: { color: gridLineColor } },
      },
      series: data.map(c => ({
        name: c.campaign_name,
        type: 'line',
        data: allViews
          .filter(v => v.campaign === c.campaign_name)
          .map(v => [v.date, v.ioc]),
        smooth: true,
        lineStyle: { width: 3 },
        symbol: 'circle',
      })),
      legend: {
        data: data.map(c => c.campaign_name),
        textStyle: { color: textColor },
      },
    };
  }

  promedio(views: any[], key: string | number) {
    return Math.round(
      views.reduce(
        (acc: number, v: Record<string, { score: number }>) =>
          acc + v[key].score,
        0
      ) / views.length
    );
  }

  promedioCalidad(views: any[]) {
    return this.qualities.map(q =>
      Math.round((views.filter(v => v.Calidad[q]).length / views.length) * 100)
    );
  }
}
