import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkAreasDashboardComponent } from './work-areas-dashboard.component';

describe('WorkAreasDashboardComponent', () => {
  let component: WorkAreasDashboardComponent;
  let fixture: ComponentFixture<WorkAreasDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkAreasDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkAreasDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
