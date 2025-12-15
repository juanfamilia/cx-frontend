import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignAssignmentsZoneFormComponent } from './campaign-assignments-zone-form.component';

describe('CampaignAssignmentsZoneFormComponent', () => {
  let component: CampaignAssignmentsZoneFormComponent;
  let fixture: ComponentFixture<CampaignAssignmentsZoneFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampaignAssignmentsZoneFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampaignAssignmentsZoneFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
