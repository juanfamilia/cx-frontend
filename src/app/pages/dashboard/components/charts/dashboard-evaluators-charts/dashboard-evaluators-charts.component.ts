import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { WeeklyProgress } from '@interfaces/weekly-progress';
import { BarChart, LineChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
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
]);

@Component({
  selector: 'app-dashboard-evaluators-charts',
  standalone: true,
  imports: [NgxEchartsDirective],
  template: `<div echarts [options]="chartOption" class="h-100 w-100"></div>`,
  styleUrls: ['./dashboard-evaluators-charts.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideEchartsCore({ echarts })],
})
export class DashboardEvaluatorsChartsComponent {
  data = input.required<WeeklyProgress[]>();
  chartOption: echarts.EChartsCoreOption = {};

  constructor() {
    computed(() => {
      const days = this.data().map(d => d.day_name.trim());
      const reported = this.data().map(d => d.reported_today);
      const goals = this.data().map(d => d.daily_goal);

      this.chartOption = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['Reportado', 'Meta diaria'] },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', data: days },
        yAxis: { type: 'value' },
        series: [
          {
            name: 'Reportado',
            type: 'bar',
            data: reported,
            itemStyle: { color: '#42A5F5' },
          },
          {
            name: 'Meta diaria',
            type: 'line',
            data: goals,
            smooth: true,
            lineStyle: { color: '#66BB6A', width: 3 },
            symbol: 'circle',
          },
        ],
      };
    });
  }
}
