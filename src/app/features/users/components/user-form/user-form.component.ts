import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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
import { Router } from '@angular/router';
import { ButtonPrimaryComponent } from '@shared/ui/buttons/button-primary/button-primary.component';
import { ButtonSecondaryComponent } from '@shared/ui/buttons/button-secondary/button-secondary.component';
import { InputDateComponent } from '@shared/ui/inputs/input-date/input-date.component';
import { InputPasswordComponent } from '@shared/ui/inputs/input-password/input-password.component';
import { InputSelectComponent } from '@shared/ui/inputs/input-select/input-select.component';
import { InputTextComponent } from '@shared/ui/inputs/input-text/input-text.component';
import { Company } from '@interfaces/company';
import { User, UserCreate } from '@interfaces/user';
import { provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideBanknote,
  lucideBriefcaseBusiness,
  lucideBuilding2,
  lucideCalendarDays,
  lucideMail,
  lucideUser,
  lucideUserPlus,
  lucideVenusAndMars,
} from '@ng-icons/lucide';
import { AuthService } from '@core/services/auth.service';
import { CompaniesService } from '@pages/companies/companies.service';
import { LazyLoadEvent } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { SelectFilterEvent, SelectModule } from 'primeng/select';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { CIVIL_STATUS } from '@shared/constants/civilStatus.constant';
import { GENDERS } from '@shared/constants/genders.constant';
import { SOCIOECONOMIC } from '@shared/constants/socioeconomic.constant';
import { Options } from '@data/types/options';

@Component({
  selector: 'app-user-form',
  imports: [
    ReactiveFormsModule,
    InputTextComponent,
    InputSelectComponent,
    InputPasswordComponent,
    DividerModule,
    SelectModule,
    ButtonPrimaryComponent,
    ButtonSecondaryComponent,
    InputDateComponent,
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    provideIcons({
      lucideBriefcaseBusiness,
      lucideUser,
      lucideVenusAndMars,
      lucideMail,
      lucideBuilding2,
      lucideUserPlus,
      lucideArrowLeft,
      lucideCalendarDays,
      lucideBanknote,
    }),
  ],
})
export class UserFormComponent implements OnInit, AfterViewInit {
  isEdit = input<boolean>(false);
  user = input<User>();

  submitEvent = output<UserCreate>();

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private companiesService = inject(CompaniesService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  private filterSubject = new Subject<string>();

  currentUser = this.authService.getCurrentUser();
  genders = GENDERS;
  civilStatus = CIVIL_STATUS;
  socioeconomic = SOCIOECONOMIC;
  roles = signal<Options[]>([]);
  companies = signal<Company[]>([]);
  selectedCompanyName = signal<string>('');

  lazyLoad = signal<LazyLoadEvent>({ first: 0, rows: 10 });

  userForm!: FormGroup;

  ngOnInit() {
    this.userForm = this.fb.group({
      company_id: [0],
      role: [3, [Validators.required]],
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      birthdate: ['', [Validators.required]],
      civil_status: ['', [Validators.required]],
      socioeconomic: ['', [Validators.required]],
      inclusivity: ['N/A', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });

    switch (this.currentUser.role) {
      case 0:
        this.getCompanies({ first: 0, rows: 10 });
        this.userForm.get('company_id')!.setValidators([Validators.required]);
        this.roles.set([
          { name: 'Administrador', value: 1 },
          { name: 'Gerente', value: 2 },
          { name: 'Evaluador', value: 3 },
        ]);

        this.filterSubject
          .pipe(debounceTime(500), distinctUntilChanged())
          .subscribe(filterValue => {
            this.getCompanies(this.lazyLoad(), filterValue);
          });

        break;
      case 1:
        // Default evaluador; antes se enviaba role 1 y el API rechazaba (solo permite 2 o 3).
        this.userForm.patchValue({
          role: 3,
        });
        this.roles.set([
          { name: 'Gerente', value: 2 },
          { name: 'Evaluador', value: 3 },
        ]);
        break;
      case 2:
        // Gerente: solo puede dar de alta evaluadores en su empresa (company_id la fija el API).
        this.userForm.patchValue({
          role: 3,
          company_id: this.currentUser.company_id,
        });
        this.roles.set([{ name: 'Evaluador', value: 3 }]);
        break;
    }

    if (this.isEdit()) {
      const birthdate = new Date(this.user()!.birthdate);
      this.userForm.patchValue({
        role: this.user()?.role,
        first_name: this.user()!.first_name,
        last_name: this.user()!.last_name,
        gender: this.user()!.gender,
        birthdate: birthdate,
        civil_status: this.user()!.civil_status,
        socioeconomic: this.user()!.socioeconomic,
        inclusivity: this.user()!.inclusivity,
        email: this.user()!.email,
        company_id: this.user()!.company_id,
      });
    }
  }

  ngAfterViewInit(): void {
    // PrimeNG Select a veces no sincroniza el valor con una sola opción hasta el primer ciclo de vista.
    if (this.currentUser.role === 2 && !this.isEdit()) {
      queueMicrotask(() => {
        this.userForm.patchValue({
          role: 3,
          company_id: this.currentUser.company_id ?? 0,
        });
        this.userForm.get('role')?.updateValueAndValidity({ emitEvent: true });
        this.cdr.markForCheck();
      });
    }
  }

  getCompanies(event: LazyLoadEvent, search?: string) {
    this.lazyLoad.set(event);
    const offset = event.first;
    const limit = event.rows;

    this.companiesService
      .getAll(offset ?? 0, limit ?? 10, 'name', search)
      .subscribe(response => {
        this.companies.set(response.data);

        if (this.isEdit()) {
          const selectedCompany = response.data.find(
            c => c.id === this.user()?.company_id
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
    if (this.userForm.valid) {
      this.submitEvent.emit(this.userForm.value as UserCreate);
    }
  }

  goBack() {
    this.router.navigate(['/users']);
  }
}
