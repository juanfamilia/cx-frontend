import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonPrimaryComponent } from '@components/buttons/button-primary/button-primary.component';
import { InputDateComponent } from '@components/inputs/input-date/input-date.component';
import { InputNumberComponent } from '@components/inputs/input-number/input-number.component';
import { InputTextComponent } from '@components/inputs/input-text/input-text.component';
import { Company } from '@interfaces/company';
import { Payment, PaymentCreate } from '@interfaces/payments';
import { provideIcons } from '@ng-icons/core';
import {
  lucideBanknote,
  lucideCalendar,
  lucideCalendarClock,
  lucideReceipt,
  lucideStickyNote,
} from '@ng-icons/lucide';
import { CompaniesService } from '@services/companies.service';
import { LazyLoadEvent } from 'primeng/api';
import { SelectFilterEvent, SelectModule } from 'primeng/select';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-payment-form',
  imports: [
    ReactiveFormsModule,
    SelectModule,
    InputNumberComponent,
    InputTextComponent,
    InputDateComponent,
    ButtonPrimaryComponent,
  ],
  templateUrl: './payment-form.component.html',
  styleUrl: './payment-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    provideIcons({
      lucideBanknote,
      lucideStickyNote,
      lucideCalendar,
      lucideCalendarClock,
      lucideReceipt,
    }),
  ],
})
export class PaymentFormComponent implements OnInit {
  isEdit = input<boolean>(false);
  payment = input<Payment>();

  submitEvent = output<PaymentCreate>();

  private fb = inject(FormBuilder);
  private companiesService = inject(CompaniesService);

  private filterSubject = new Subject<string>();

  companies = signal<Company[]>([]);
  selectedCompanyName = signal<string>('');
  lazyLoad = signal<LazyLoadEvent>({ first: 0, rows: 10 });

  paymentForm!: FormGroup;

  ngOnInit() {
    this.paymentForm = this.fb.group({
      company_id: [0, [Validators.required]],
      amount: [0, [Validators.required, Validators.min(1)]],
      date: ['', [Validators.required]],
      description: ['', [Validators.required]],
      valid_before: ['', [Validators.required]],
    });

    if (this.isEdit()) {
      const dateValue = new Date(this.payment()!.date);
      const validBeforeValue = new Date(this.payment()!.valid_before);
      this.paymentForm.controls['date'].setValue(dateValue);
      this.paymentForm.controls['valid_before'].setValue(validBeforeValue);

      this.paymentForm.patchValue({
        company_id: this.payment()!.company_id,
        amount: this.payment()!.amount,
        description: this.payment()!.description,
      });
    }

    this.getCompanies({ first: 0, rows: 10 });

    this.filterSubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(filterValue => {
        this.getCompanies(this.lazyLoad(), filterValue);
      });
  }

  getCompanies(event: LazyLoadEvent, search?: string) {
    this.lazyLoad.set(event);
    const offset = event.first;
    const limit = event.rows;

    this.companiesService
      .getAll(offset, limit, 'name', search)
      .subscribe(response => {
        this.companies.set(response.data);

        if (this.isEdit()) {
          const selectedCompany = response.data.find(
            c => c.id === this.payment()?.company_id
          );
          if (selectedCompany) {
            this.selectedCompanyName.set(selectedCompany.name);
          }
        }
      });
  }

  searchCompanies(event: SelectFilterEvent) {
    this.filterSubject.next(event.filter);
  }

  onSubmit() {
    if (this.paymentForm.valid) {
      this.submitEvent.emit(this.paymentForm.value);
    }
  }
}
