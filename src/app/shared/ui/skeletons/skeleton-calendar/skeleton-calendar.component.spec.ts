import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonCalendarComponent } from './skeleton-calendar.component';

describe('SkeletonCalendarComponent', () => {
  let component: SkeletonCalendarComponent;
  let fixture: ComponentFixture<SkeletonCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonCalendarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkeletonCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
