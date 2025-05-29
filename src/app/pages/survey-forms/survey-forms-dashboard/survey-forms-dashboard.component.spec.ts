import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyFormsDashboardComponent } from './survey-forms-dashboard.component';

describe('SurveyFormsDashboardComponent', () => {
  let component: SurveyFormsDashboardComponent;
  let fixture: ComponentFixture<SurveyFormsDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveyFormsDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurveyFormsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
