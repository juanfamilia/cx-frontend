import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardAdminChartsComponent } from './dashboard-admin-charts.component';

describe('DashboardAdminChartsComponent', () => {
  let component: DashboardAdminChartsComponent;
  let fixture: ComponentFixture<DashboardAdminChartsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardAdminChartsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardAdminChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
