import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignAssignmentsUserFormComponent } from './campaign-assignments-user-form.component';

describe('CampaignAssignmentsUserFormComponent', () => {
  let component: CampaignAssignmentsUserFormComponent;
  let fixture: ComponentFixture<CampaignAssignmentsUserFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampaignAssignmentsUserFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampaignAssignmentsUserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
