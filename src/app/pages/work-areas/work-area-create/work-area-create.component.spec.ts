import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkAreaCreateComponent } from './work-area-create.component';

describe('WorkAreaCreateComponent', () => {
  let component: WorkAreaCreateComponent;
  let fixture: ComponentFixture<WorkAreaCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkAreaCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkAreaCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
