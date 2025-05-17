import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonPatientDetailComponent } from './skeleton-patient-detail.component';

describe('SkeletonPatientDetailComponent', () => {
  let component: SkeletonPatientDetailComponent;
  let fixture: ComponentFixture<SkeletonPatientDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonPatientDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkeletonPatientDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
