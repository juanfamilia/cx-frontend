import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyFormsUpdateComponent } from './survey-forms-update.component';

describe('SurveyFormsUpdateComponent', () => {
  let component: SurveyFormsUpdateComponent;
  let fixture: ComponentFixture<SurveyFormsUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveyFormsUpdateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurveyFormsUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
