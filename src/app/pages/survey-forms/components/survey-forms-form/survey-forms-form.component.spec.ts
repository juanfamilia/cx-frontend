import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyFormsFormComponent } from './survey-forms-form.component';

describe('SurveyFormsFormComponent', () => {
  let component: SurveyFormsFormComponent;
  let fixture: ComponentFixture<SurveyFormsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveyFormsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurveyFormsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
