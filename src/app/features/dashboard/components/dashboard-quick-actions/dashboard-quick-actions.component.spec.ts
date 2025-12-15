import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardQuickActionsComponent } from './dashboard-quick-actions.component';

describe('DashboardQuickActionsComponent', () => {
  let component: DashboardQuickActionsComponent;
  let fixture: ComponentFixture<DashboardQuickActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardQuickActionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardQuickActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
