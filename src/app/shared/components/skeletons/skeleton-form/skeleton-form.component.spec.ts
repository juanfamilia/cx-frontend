import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonFormComponent } from './skeleton-form.component';

describe('SkeletonFormComponent', () => {
  let component: SkeletonFormComponent;
  let fixture: ComponentFixture<SkeletonFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkeletonFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
