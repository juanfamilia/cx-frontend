import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkAreaFormComponent } from './work-area-form.component';

describe('WorkAreaFormComponent', () => {
  let component: WorkAreaFormComponent;
  let fixture: ComponentFixture<WorkAreaFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkAreaFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkAreaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
