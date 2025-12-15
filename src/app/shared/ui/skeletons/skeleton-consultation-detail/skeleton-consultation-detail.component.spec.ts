import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonConsultationDetailComponent } from './skeleton-consultation-detail.component';

describe('SkeletonConsultationDetailComponent', () => {
  let component: SkeletonConsultationDetailComponent;
  let fixture: ComponentFixture<SkeletonConsultationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonConsultationDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkeletonConsultationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
