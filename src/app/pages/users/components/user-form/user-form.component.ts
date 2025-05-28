import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonPrimaryComponent } from '@components/buttons/button-primary/button-primary.component';
import { ButtonSecondaryComponent } from '@components/buttons/button-secondary/button-secondary.component';
import { InputPasswordComponent } from '@components/inputs/input-password/input-password.component';
import { InputSelectComponent } from '@components/inputs/input-select/input-select.component';
import { InputTextComponent } from '@components/inputs/input-text/input-text.component';
import { Company } from '@interfaces/company';
import { User, UserCreate } from '@interfaces/user';
import { provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideBriefcaseBusiness,
  lucideBuilding2,
  lucideMail,
  lucideUser,
  lucideUserPlus,
  lucideVenusAndMars,
} from '@ng-icons/lucide';
import { AuthService } from '@services/auth.service';
import { CompaniesService } from '@services/companies.service';
import { LazyLoadEvent } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { SelectFilterEvent, SelectModule } from 'primeng/select';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { GENDERS } from 'src/app/constants/genders.constant';
import { Options } from 'src/app/types/options';

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
    }),
  ],
})
export class UserFormComponent implements OnInit {
  isEdit = input<boolean>(false);
  user = input<User>();

  submitEvent = output<UserCreate>();

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private companiesService = inject(CompaniesService);
  private router = inject(Router);

  private filterSubject = new Subject<string>();

  currentUser = this.authService.getCurrentUser();
  genders = GENDERS;
  roles = signal<Options[]>([]);
  companies = signal<Company[]>([]);
  selectedCompanyName = signal<string>('');

  lazyLoad = signal<LazyLoadEvent>({ first: 0, rows: 10 });

  userForm = this.fb.group({
    company_id: [0],
    role: [3, [Validators.required]],
    first_name: ['', [Validators.required]],
    last_name: ['', [Validators.required]],
    gender: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  ngOnInit() {
    if (this.isEdit()) {
      this.userForm.patchValue({
        role: this.user()!.role,
        first_name: this.user()!.first_name,
        last_name: this.user()!.last_name,
        gender: this.user()!.gender,
        email: this.user()!.email,
        company_id: this.user()!.company_id,
      });
    }

    switch (this.currentUser.role) {
      case 0:
        this.getCompanies({ first: 0, rows: 10 });
        this.userForm.controls.company_id.addValidators(Validators.required);
        this.roles.set([
          {
            name: 'Administrador',
            value: 1,
          },
          {
            name: 'Gerente',
            value: 2,
          },
          {
            name: 'Evaluador',
            value: 3,
          },
        ]);

        this.filterSubject
          .pipe(
            debounceTime(500), // Espera 500 ms antes de ejecutar la búsqueda
            distinctUntilChanged() // Solo ejecuta si el valor cambió
          )
          .subscribe(filterValue => {
            this.getCompanies(this.lazyLoad(), filterValue);
          });

        break;
      case 1:
        this.userForm.patchValue({
          role: 1,
        });
        this.roles.set([
          {
            name: 'Gerente',
            value: 2,
          },
          {
            name: 'Evaluador',
            value: 3,
          },
        ]);
        break;
    }
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
