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
import { Router } from '@angular/router';
import { ButtonPrimaryComponent } from '@shared/ui/buttons/button-primary/button-primary.component';
import { ButtonSecondaryComponent } from '@shared/ui/buttons/button-secondary/button-secondary.component';
import { InputMultiSelectComponent } from '@shared/ui/inputs/input-zone/input-multi-select.component';
import { CampaignAssignmentUserCreate } from '@interfaces/campaign-assigment-user';
import { Campaign } from '@interfaces/campaign';
import { provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideSettings2 } from '@ng-icons/lucide';
import { CampaignService } from '@pages/campaign/campaign.service';
import { UsersService } from '@pages/users/users.service';
import { Options } from '@data/types/options';
import { PaginatedResponse } from '@data/types/pagination';
import { LazyLoadEvent } from 'primeng/api';
import { SelectFilterEvent, SelectModule } from 'primeng/select';
import { debounceTime, distinctUntilChanged, of, Subject, tap, catchError } from 'rxjs';
import { PageHeaderComponent } from '@shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-campaign-assignments-user-form',
  standalone: true,
  imports: [
    PageHeaderComponent,            // CORRECTO
    ReactiveFormsModule,
    SelectModule,
    InputMultiSelectComponent,
    ButtonPrimaryComponent,
    ButtonSecondaryComponent,
  ],
  templateUrl: './campaign-assignments-user-form.component.html',
  styleUrls: ['./campaign-assignments-user-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ lucideSettings2, lucideArrowLeft })],
})
export class CampaignAssignmentsUserFormComponent implements OnInit {
  submitEvent = output<CampaignAssignmentUserCreate>();

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private campaignService = inject(CampaignService);
  private userService = inject(UsersService);

  private filterCampaignSubject = new Subject<string>();

  asssignmentUserForm!: FormGroup;

  lazyLoadCampaign = signal<LazyLoadEvent>({ first: 0, rows: 10 });
  lazySearchCampaign = signal<string>('');

  campaignsResource = rxResource<
    PaginatedResponse<Campaign>,
    { pagination: LazyLoadEvent; filter: string; search: string }
  >({
    request: () => ({
      pagination: this.lazyLoadCampaign(),
      filter: 'name',
      search: this.lazySearchCampaign(),
    }),
    loader: ({ request }) =>
      this.campaignService.getAll(
        request.pagination.first,
        request.pagination.rows,
        request.filter,
        request.search
      ),
  });

  // Trigger signal to load users - starts with true to load immediately
  private loadUsers = signal(true);
  
  usersResource = rxResource<Options[], { load: boolean }>({
    request: () => ({ load: this.loadUsers() }),
    loader: ({ request }) => {
      if (!request.load) return of([]);
      return this.userService.getAllOptionsList().pipe(
        tap(users => console.log('[UsersResource] Loaded users:', users)),
        catchError(err => {
          console.error('[UsersResource] Error loading users:', err);
          return of([]);
        })
      );
    },
  });

  // Computed signal for users options with fallback
  usersOptions = computed(() => {
    const value = this.usersResource.value();
    console.log('[UsersOptions] Current value:', value, 'isLoading:', this.usersResource.isLoading());
    return value ?? [];
  });

  ngOnInit() {
    this.asssignmentUserForm = this.fb.group({
      campaign_id: ['', [Validators.required]],
      user_ids: ['', [Validators.required]],
    });

    this.filterCampaignSubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(filterValue => {
        this.lazySearchCampaign.set(filterValue);
      });
  }

  searchCampaigns(event: SelectFilterEvent) {
    this.filterCampaignSubject.next(event.filter);
  }

  onSubmit() {
    if (this.asssignmentUserForm.valid) {
      this.submitEvent.emit(this.asssignmentUserForm.value);
    }
  }

  goBack() {
    this.router.navigate(['/campaigns/assigns/by-user']);
  }
}
