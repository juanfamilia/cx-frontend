import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonNotificationComponent } from './button-notification.component';

describe('ButtonNotificationComponent', () => {
  let component: ButtonNotificationComponent;
  let fixture: ComponentFixture<ButtonNotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonNotificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
