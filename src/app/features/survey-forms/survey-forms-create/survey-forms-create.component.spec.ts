import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyFormsCreateComponent } from './survey-forms-create.component';

describe('SurveyFormsCreateComponent', () => {
  let component: SurveyFormsCreateComponent;
  let fixture: ComponentFixture<SurveyFormsCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveyFormsCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurveyFormsCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
