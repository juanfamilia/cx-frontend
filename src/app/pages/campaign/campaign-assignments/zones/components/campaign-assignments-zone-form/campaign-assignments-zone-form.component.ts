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
import { ButtonPrimaryComponent } from '@components/buttons/button-primary/button-primary.component';
import { ButtonSecondaryComponent } from '@components/buttons/button-secondary/button-secondary.component';
import { InputMultiSelectComponent } from '@components/inputs/input-zone/input-multi-select.component';
import { CampaignAssignmentZoneCreate } from '@interfaces/campaign-assignment-zone';
import { provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideSettings2 } from '@ng-icons/lucide';
import { CampaignService } from '@services/campaign.service';
import { ZoneService } from '@services/zone.service';
import { LazyLoadEvent } from 'primeng/api';
import { SelectFilterEvent, SelectModule } from 'primeng/select';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-campaign-assignments-zone-form',
  imports: [
    ReactiveFormsModule,
    SelectModule,
    InputMultiSelectComponent,
    ButtonSecondaryComponent,
    ButtonPrimaryComponent,
  ],
  templateUrl: './campaign-assignments-zone-form.component.html',
  styleUrl: './campaign-assignments-zone-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ lucideArrowLeft, lucideSettings2 })],
})
export class CampaignAssignmentsZoneFormComponent implements OnInit {
  submitEvent = output<CampaignAssignmentZoneCreate>();

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private campaignService = inject(CampaignService);
  private zoneServices = inject(ZoneService);

  private filterCampaignSubject = new Subject<string>();

  assignmentsZoneForm!: FormGroup;

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

  zonesResource = rxResource({
    loader: () => this.zoneServices.getAll(),
  });

  zonesNameValue = computed(() =>
    this.zonesResource
      .value()
      ?.map(({ name, id }) => ({ name: name, value: id }))
  );

  ngOnInit() {
    this.assignmentsZoneForm = this.fb.group({
      campaign_id: ['', [Validators.required]],
      zone_ids: ['', [Validators.required]],
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
    if (this.assignmentsZoneForm.valid) {
      this.submitEvent.emit(this.assignmentsZoneForm.value);
    }
  }

  goBack() {
    this.router.navigate(['/campaigns/assigns/by-zones']);
  }
}
