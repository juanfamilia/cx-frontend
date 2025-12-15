import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignGoalsDashboardComponent } from './campaign-goals-dashboard.component';

describe('CampaignGoalsDashboardComponent', () => {
  let component: CampaignGoalsDashboardComponent;
  let fixture: ComponentFixture<CampaignGoalsDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampaignGoalsDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampaignGoalsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
