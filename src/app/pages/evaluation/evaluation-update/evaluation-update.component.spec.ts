import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationUpdateComponent } from './evaluation-update.component';

describe('EvaluationUpdateComponent', () => {
  let component: EvaluationUpdateComponent;
  let fixture: ComponentFixture<EvaluationUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluationUpdateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluationUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
