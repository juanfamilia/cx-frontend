import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignAssignmentsCreateZoneComponent } from './campaign-assignments-create-zone.component';

describe('CampaignAssignmentsCreateZoneComponent', () => {
  let component: CampaignAssignmentsCreateZoneComponent;
  let fixture: ComponentFixture<CampaignAssignmentsCreateZoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampaignAssignmentsCreateZoneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampaignAssignmentsCreateZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
