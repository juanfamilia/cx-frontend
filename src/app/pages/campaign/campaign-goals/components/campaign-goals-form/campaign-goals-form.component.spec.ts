import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignGoalsFormComponent } from './campaign-goals-form.component';

describe('CampaignGoalsFormComponent', () => {
  let component: CampaignGoalsFormComponent;
  let fixture: ComponentFixture<CampaignGoalsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampaignGoalsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampaignGoalsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
