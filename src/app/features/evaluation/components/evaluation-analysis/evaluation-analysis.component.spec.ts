import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationAnalysisComponent } from './evaluation-analysis.component';

describe('EvaluationAnalysisComponent', () => {
  let component: EvaluationAnalysisComponent;
  let fixture: ComponentFixture<EvaluationAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluationAnalysisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluationAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
