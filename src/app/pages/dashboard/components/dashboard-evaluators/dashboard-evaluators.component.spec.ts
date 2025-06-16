import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardEvaluatorsComponent } from './dashboard-evaluators.component';

describe('DashboardEvaluatorsComponent', () => {
  let component: DashboardEvaluatorsComponent;
  let fixture: ComponentFixture<DashboardEvaluatorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardEvaluatorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardEvaluatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
