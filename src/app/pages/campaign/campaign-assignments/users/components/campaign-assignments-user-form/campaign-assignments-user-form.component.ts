import {
  ChangeDetectionStrategy,
  Component,
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
import { ButtonPrimaryComponent } from '@components/buttons/button-primary/button-primary.component';
import { ButtonSecondaryComponent } from '@components/buttons/button-secondary/button-secondary.component';
import { InputMultiSelectComponent } from '@components/inputs/input-zone/input-multi-select.component';
import { CampaignAssignmentUserCreate } from '@interfaces/campaign-assigment-user';
import { provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideSettings2 } from '@ng-icons/lucide';
import { CampaignService } from '@services/campaign.service';
import { UsersService } from '@services/users.service';
import { LazyLoadEvent } from 'primeng/api';
import { SelectFilterEvent, SelectModule } from 'primeng/select';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-campaign-assignments-user-form',
  imports: [
    ReactiveFormsModule,
    SelectModule,
    InputMultiSelectComponent,
    ButtonPrimaryComponent,
    ButtonSecondaryComponent,
  ],
  templateUrl: './campaign-assignments-user-form.component.html',
  styleUrl: './campaign-assignments-user-form.component.css',
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

  campaignsResource = rxResource({
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

  usersResource = rxResource({
    loader: () => this.userService.getAllOptionsList(),
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
