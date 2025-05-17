import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentsDashboardComponent } from './payments-dashboard.component';

describe('PaymentsDashboardComponent', () => {
  let component: PaymentsDashboardComponent;
  let fixture: ComponentFixture<PaymentsDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentsDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
