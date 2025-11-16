import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { CampaignCoverage } from '@interfaces/campaing-coverage';
import { WeeklyProgress } from '@interfaces/weekly-progress';
import { ThemeServiceService } from '@services/theme-service.service';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { transformDayName } from 'src/app/helpers/day-name-transform';

echarts.use([
  BarChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
  TitleComponent,
  PieChart,
]);

@Component({
  selector: 'app-dashboard-evaluators-charts',
  standalone: true,
  imports: [NgxEchartsDirective],
  templateUrl: './dashboard-evaluators-charts.component.html',
  styleUrls: ['./dashboard-evaluators-charts.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideEchartsCore({ echarts })],
})
export class DashboardEvaluatorsChartsComponent implements OnInit {
  weeklyProgress = input.required<WeeklyProgress[]>();
  campaignCoverage = input.required<CampaignCoverage[]>();

  themeService = inject(ThemeServiceService);

  chartWeekly: echarts.EChartsCoreOption = {};
  chartCampaignCoverage: echarts.EChartsCoreOption = {};
  isDarkMode = this.themeService.darkMode();

  ngOnInit(): void {
    this.createWeeklyChart();
    this.createCoverageChart();
  }

  private createWeeklyChart(): void {
    const days = this.weeklyProgress().map(d => d.day_name.trim());
    const daysTransformed = transformDayName(days);
    const reported = this.weeklyProgress().map(d => d.reported_today);
    const goals = this.weeklyProgress().map(d => d.daily_goal);

    const textColor = this.isDarkMode ? '#E0E0E0' : '#333';
    const axisLineColor = this.isDarkMode ? '#555' : '#ccc';
    const gridLineColor = this.isDarkMode ? 'rgba(255,255,255,0.1)' : '#f0f0f0';

    this.chartWeekly = {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', textStyle: { color: textColor } },
      legend: {
        data: ['Reportado', 'Meta diaria'],
        textStyle: { color: textColor },
      },
      grid: { left: '3%', right: '4%', bottom: '12%', containLabel: true },
      xAxis: {
        type: 'category',
        data: daysTransformed,
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
  }

  private createCoverageChart(): void {
    const grouped = this.groupByCampaign(this.campaignCoverage());
    const seriesData = Object.keys(grouped).map(name => ({
      name,
      value: this.averageCoverage(grouped[name]),
    }));

    const textColor = this.isDarkMode ? '#E0E0E0' : '#333';

    this.chartCampaignCoverage = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}% ({d}%)',
        textStyle: { color: textColor },
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        textStyle: { color: textColor },
      },
      series: [
        {
          name: 'Cobertura',
          type: 'pie',
          radius: '60%',
          data: seriesData,
          label: { formatter: '{b}\n{c}%', fontSize: 13, color: textColor },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0,0,0,0.5)',
            },
          },
        },
      ],
    };
  }

  private groupByCampaign(data: CampaignCoverage[]) {
    return data.reduce(
      (acc, item) => {
        acc[item.campaign_name] = acc[item.campaign_name] || [];
        acc[item.campaign_name].push(item);
        return acc;
      },
      {} as Record<string, CampaignCoverage[]>
    );
  }

  private averageCoverage(items: CampaignCoverage[]) {
    const sum = items.reduce((acc, i) => acc + i.coverage_percent, 0);
    return +(sum / items.length).toFixed(2);
  }
}
