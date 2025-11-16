/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ChangeDetectionStrategy,
  Component,
  input,
  OnInit,
} from '@angular/core';
import {
  AnalysisData,
  EvaluationAnalysisDashboard,
} from '@interfaces/evaluation-analysis-dashboard';
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

  barChart: echarts.EChartsCoreOption = {};
  radarChart: echarts.EChartsCoreOption = {};
  lineChart: echarts.EChartsCoreOption = {};

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

    this.barChart = {
      tooltip: { trigger: 'axis' },
      legend: { data: ['IOC', 'IRD', 'CES'] },
      xAxis: { type: 'category', data: campaigns },
      yAxis: { type: 'value', name: 'Score' },
      series: [
        { name: 'IOC', type: 'bar', data: ioc },
        { name: 'IRD', type: 'bar', data: ird },
        { name: 'CES', type: 'bar', data: ces },
      ],
    };
  }

  createRadarChart(data: AnalysisData[]): void {
    this.radarChart = {
      tooltip: {},
      legend: { data: data.map(c => c.campaign_name) },
      radar: {
        indicator: this.qualities.map(q => ({ name: q, max: 100 })),
      },
      series: [
        {
          type: 'radar',
          data: data.map(c => ({
            value: this.promedioCalidad(c.operative_views),
            name: c.campaign_name,
          })),
        },
      ],
    };
  }

  createLineChart(data: AnalysisData[]): void {
    const allViews = data.flatMap(c =>
      c.operative_views.map(v => ({
        campaign: c.campaign_name,
        date: new Date(v.timestamp_analisis),
        ioc: v.IOC.score,
      }))
    );

    this.lineChart = {
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'time' },
      yAxis: { type: 'value', name: 'IOC' },
      series: data.map(c => ({
        name: c.campaign_name,
        type: 'line',
        data: allViews
          .filter(v => v.campaign === c.campaign_name)
          .map(v => [v.date, v.ioc]),
      })),
      legend: { data: data.map(c => c.campaign_name) },
    };
  }

  promedio(views: any[], key: string | number) {
    return (
      Math.round(
        views.reduce(
          (acc: number, v: Record<string, { score: number }>) =>
            acc + v[key].score,
          0
        ) / views.length
      )
    );
  }

  promedioCalidad(views: any[]) {
    return this.qualities.map(
      q => Math.round(
        (views.filter(v => v.Calidad[q]).length / views.length) * 100
      )
    );
  }
}
