import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
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
import { InputDateComponent } from '@components/inputs/input-date/input-date.component';
import { InputNumberComponent } from '@components/inputs/input-number/input-number.component';
import { InputSelectComponent } from '@components/inputs/input-select/input-select.component';
import { InputTextComponent } from '@components/inputs/input-text/input-text.component';
import { Campaign, CampaignCreate } from '@interfaces/campaign';
import { SurveyForm } from '@interfaces/survey-form';
import { provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideCalendarDays,
  lucideGoal,
  lucideRss,
  lucideSave,
  lucideStickyNote,
  lucideTarget,
  lucideType,
} from '@ng-icons/lucide';
import { SurveyFormService } from '@services/survey-form.service';
import { LazyLoadEvent } from 'primeng/api';
import { SelectFilterEvent, SelectModule } from 'primeng/select';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { dateRangeValidator } from 'src/app/helpers/date-range-validator';
import { Options } from 'src/app/types/options';

@Component({
  selector: 'app-campaign-form',
  imports: [
    ReactiveFormsModule,
    InputTextComponent,
    InputDateComponent,
    InputSelectComponent,
    ButtonSecondaryComponent,
    ButtonPrimaryComponent,
    SelectModule,
    InputNumberComponent,
  ],
  templateUrl: './campaign-form.component.html',
  styleUrl: './campaign-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    provideIcons({
      lucideType,
      lucideTarget,
      lucideCalendarDays,
      lucideRss,
      lucideStickyNote,
      lucideArrowLeft,
      lucideSave,
      lucideGoal,
    }),
  ],
})
export class CampaignFormComponent implements OnInit {
  isEdit = input<boolean>(false);
  campaign = input<Campaign>();

  submitEvent = output<CampaignCreate>();

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private surveyService = inject(SurveyFormService);

  private filterSubject = new Subject<string>();

  campaignForm!: FormGroup;

  channels: Options[] = [
    { name: 'Presencial', value: 'presencial' },
    { name: 'Telefónico', value: 'telefonico' },
    { name: 'Online', value: 'online' },
  ];

  surveys = signal<SurveyForm[]>([]);
  lazyLoad = signal<LazyLoadEvent>({ first: 0, rows: 10 });
  lazySearch = signal<string>('');

  surveysResource = rxResource({
    request: () => ({
      pagination: this.lazyLoad(),
      filter: 'title',
      search: this.lazySearch(),
    }),
    loader: ({ request }) =>
      this.surveyService.getAll(
        request.pagination.first,
        request.pagination.rows,
        request.filter,
        request.search
      ),
  });

  ngOnInit() {
    this.campaignForm = this.fb.group(
      {
        name: ['', [Validators.required]],
        objective: ['', [Validators.required]],
        date_start: ['', [Validators.required]],
        date_end: ['', [Validators.required]],
        channel: ['', [Validators.required]],
        survey_id: ['', [Validators.required]],
        goal: ['', [Validators.required]],
        notes: [''],
      },
      { validators: dateRangeValidator }
    );

    if (this.isEdit()) {
      const dateStartValue = new Date(this.campaign()!.date_start);
      const dateEndValue = new Date(this.campaign()!.date_end);
      this.campaignForm.patchValue({
        name: this.campaign()?.name,
        objective: this.campaign()?.objective,
        date_start: dateStartValue,
        date_end: dateEndValue,
        channel: this.campaign()?.channel,
        survey_id: this.campaign()?.survey_id,
        goal: this.campaign()?.goal,
        notes: this.campaign()?.notes,
      });
    }

    this.filterSubject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(filterValue => {
        this.lazySearch.set(filterValue);
      });
  }

  searchSurveys(event: SelectFilterEvent) {
    this.filterSubject.next(event.filter);
  }

  goBack() {
    this.router.navigate(['/campaigns']);
  }

  onSubmit() {
    if (this.campaignForm.valid) {
      this.submitEvent.emit(this.campaignForm.value);
    }
  }
}
