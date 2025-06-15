import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationChangeStatusComponent } from './evaluation-change-status.component';

describe('EvaluationChangeStatusComponent', () => {
  let component: EvaluationChangeStatusComponent;
  let fixture: ComponentFixture<EvaluationChangeStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluationChangeStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluationChangeStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
