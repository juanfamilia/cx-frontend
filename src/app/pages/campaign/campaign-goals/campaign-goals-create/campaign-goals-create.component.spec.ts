import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignGoalsCreateComponent } from './campaign-goals-create.component';

describe('CampaignGoalsCreateComponent', () => {
  let component: CampaignGoalsCreateComponent;
  let fixture: ComponentFixture<CampaignGoalsCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampaignGoalsCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampaignGoalsCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
