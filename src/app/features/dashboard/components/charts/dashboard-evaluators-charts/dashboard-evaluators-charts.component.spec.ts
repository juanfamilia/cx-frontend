import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardEvaluatorsChartsComponent } from './dashboard-evaluators-charts.component';

describe('DashboardEvaluatorsChartsComponent', () => {
  let component: DashboardEvaluatorsChartsComponent;
  let fixture: ComponentFixture<DashboardEvaluatorsChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardEvaluatorsChartsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardEvaluatorsChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
