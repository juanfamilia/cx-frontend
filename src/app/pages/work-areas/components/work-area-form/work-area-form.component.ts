import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonPrimaryComponent } from '@components/buttons/button-primary/button-primary.component';
import { InputMultiSelectComponent } from '@components/inputs/input-zone/input-multi-select.component';
import { UserClass } from '@interfaces/user';
import { provideIcons } from '@ng-icons/core';
import { lucideMap } from '@ng-icons/lucide';
import { UsersService } from '@services/users.service';
import { ZoneService } from '@services/zone.service';
import { LazyLoadEvent } from 'primeng/api';
import { SelectFilterEvent, SelectModule } from 'primeng/select';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-work-area-form',
  imports: [
    InputMultiSelectComponent,
    ReactiveFormsModule,
    SelectModule,
    ButtonPrimaryComponent,
  ],
  templateUrl: './work-area-form.component.html',
  styleUrl: './work-area-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ lucideMap })],
})
export class WorkAreaFormComponent implements OnInit {
  submitEvent = output<{ user_id: number; zone_ids: number[] }>();

  private zoneServices = inject(ZoneService);
  private userService = inject(UsersService);
  private fb = inject(FormBuilder);

  private filterSubject = new Subject<string>();

  workAreaForm!: FormGroup;

  users = signal<UserClass[]>([]);
  lazyLoad = signal<LazyLoadEvent>({ first: 0, rows: 10 });

  zonesResource = rxResource({
    loader: () => this.zoneServices.getAll(),
  });

  zonesNameValue = computed(() =>
    this.zonesResource
      .value()
      ?.map(({ name, id }) => ({ name: name, value: id }))
  );

  ngOnInit(): void {
    this.workAreaForm = this.fb.group({
      user_id: [0, [Validators.required]],
      zone_ids: ['', [Validators.required]],
    });

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

    this.userService
      .getAll(offset, limit, 'name', search)
      .subscribe(response => {
        this.users.set(response.data.map(user => new UserClass(user)));
      });
  }

  searchCompanies(event: SelectFilterEvent) {
    this.filterSubject.next(event.filter);
  }

  onSubmit() {
    if (this.workAreaForm.valid) {
      this.submitEvent.emit(this.workAreaForm.value);
    }
  }
}
