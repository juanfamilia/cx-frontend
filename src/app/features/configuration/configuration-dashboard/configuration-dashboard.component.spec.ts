import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationDashboardComponent } from './configuration-dashboard.component';

describe('ConfigurationDashboardComponent', () => {
  let component: ConfigurationDashboardComponent;
  let fixture: ComponentFixture<ConfigurationDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigurationDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigurationDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
