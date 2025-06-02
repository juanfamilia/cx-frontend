import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignAssignmentsCreateUserComponent } from './campaign-assignments-create-user.component';

describe('CampaignAssignmentsCreateUserComponent', () => {
  let component: CampaignAssignmentsCreateUserComponent;
  let fixture: ComponentFixture<CampaignAssignmentsCreateUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampaignAssignmentsCreateUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampaignAssignmentsCreateUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
