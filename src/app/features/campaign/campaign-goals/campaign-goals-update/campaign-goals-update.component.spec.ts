import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignGoalsUpdateComponent } from './campaign-goals-update.component';

describe('CampaignGoalsUpdateComponent', () => {
  let component: CampaignGoalsUpdateComponent;
  let fixture: ComponentFixture<CampaignGoalsUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampaignGoalsUpdateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampaignGoalsUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
