import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputLocationComponent } from './input-location.component';

describe('InputLocationComponent', () => {
  let component: InputLocationComponent;
  let fixture: ComponentFixture<InputLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputLocationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
