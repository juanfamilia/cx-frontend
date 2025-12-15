import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationDashboardComponent } from './evaluation-dashboard.component';

describe('EvaluationDashboardComponent', () => {
  let component: EvaluationDashboardComponent;
  let fixture: ComponentFixture<EvaluationDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluationDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluationDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
