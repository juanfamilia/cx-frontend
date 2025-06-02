import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignAssignmentsDashboardUserComponent } from './campaign-assignments-dashboard-user.component';

describe('CampaignAssignmentsDashboardUserComponent', () => {
  let component: CampaignAssignmentsDashboardUserComponent;
  let fixture: ComponentFixture<CampaignAssignmentsDashboardUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampaignAssignmentsDashboardUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampaignAssignmentsDashboardUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
