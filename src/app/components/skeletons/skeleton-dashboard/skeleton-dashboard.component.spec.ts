import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonDashboardComponent } from './skeleton-dashboard.component';

describe('SkeletonDashboardComponent', () => {
  let component: SkeletonDashboardComponent;
  let fixture: ComponentFixture<SkeletonDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkeletonDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
