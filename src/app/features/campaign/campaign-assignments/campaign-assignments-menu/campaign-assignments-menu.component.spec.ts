import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignAssignmentsMenuComponent } from './campaign-assignments-menu.component';

describe('CampaignAssignmentsMenuComponent', () => {
  let component: CampaignAssignmentsMenuComponent;
  let fixture: ComponentFixture<CampaignAssignmentsMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampaignAssignmentsMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampaignAssignmentsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
