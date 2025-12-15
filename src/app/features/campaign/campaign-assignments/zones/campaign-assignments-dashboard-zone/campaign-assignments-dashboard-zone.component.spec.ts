import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignAssignmentsDashboardZoneComponent } from './campaign-assignments-dashboard-zone.component';

describe('CampaignAssignmentsDashboardZoneComponent', () => {
  let component: CampaignAssignmentsDashboardZoneComponent;
  let fixture: ComponentFixture<CampaignAssignmentsDashboardZoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampaignAssignmentsDashboardZoneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampaignAssignmentsDashboardZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
