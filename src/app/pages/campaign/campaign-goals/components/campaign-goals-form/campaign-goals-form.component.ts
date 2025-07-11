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
import { InputNumberComponent } from '@components/inputs/input-number/input-number.component';
import { Campaign } from '@interfaces/campaign';
import {
  CampaignGoalsEvaluator,
  CampaignGoalsEvaluatorCreate,
} from '@interfaces/campaign-goals-evaluator';
import { UserClass } from '@interfaces/user';
import { provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideGoal, lucideSave } from '@ng-icons/lucide';
import { CampaignService } from '@services/campaign.service';
import { UsersService } from '@services/users.service';
import { LazyLoadEvent } from 'primeng/api';
import { SelectFilterEvent, SelectModule } from 'primeng/select';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-campaign-goals-form',
  imports: [
    ReactiveFormsModule,
    SelectModule,
    ButtonPrimaryComponent,
    ButtonSecondaryComponent,
    InputNumberComponent,
  ],
  templateUrl: './campaign-goals-form.component.html',
  styleUrl: './campaign-goals-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ lucideArrowLeft, lucideSave, lucideGoal })],
})
export class CampaignGoalsFormComponent implements OnInit {
  isEdit = input<boolean>(false);
  goal = input<CampaignGoalsEvaluator>();

  submitEvent = output<CampaignGoalsEvaluatorCreate>();

  private router = inject(Router);
  private fb = inject(FormBuilder);
  private userService = inject(UsersService);
  private campaginService = inject(CampaignService);

  private filterSubjectCampaigns = new Subject<string>();

  goalForm!: FormGroup;

  users = signal<UserClass[]>([]);
  campaign = signal<Campaign[]>([]);

  lazyLoad = signal<LazyLoadEvent>({ first: 0, rows: 10 });

  ngOnInit(): void {
    this.goalForm = this.fb.group({
      evaluator_id: [null, [Validators.required]],
      campaign_id: [null, [Validators.required]],
      goal: [0, [Validators.required, Validators.min(1)]],
    });

    this.getCampaigns({ first: 0, rows: 10 });

    this.filterSubjectCampaigns
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(filterValue => {
        this.getCampaigns(this.lazyLoad(), filterValue);
      });

    if (this.isEdit()) {
      this.goalForm.patchValue({
        evaluator_id: this.goal()?.evaluator_id,
        campaign_id: this.goal()?.campaign_id,
        goal: this.goal()?.goal,
      });
      this.goalForm.get('evaluator_id')?.disable();
      this.goalForm.get('campaign_id')?.disable();
    }
  }

  userResource = rxResource({
    loader: () => this.userService.getAllOptionsList(),
  });

  getCampaigns(event: LazyLoadEvent, search?: string) {
    this.lazyLoad.set(event);
    const offset = event.first;
    const limit = event.rows;

    this.campaginService
      .getAll(offset, limit, 'name', search)
      .subscribe(response => {
        this.campaign.set(response.data);
      });
  }

  searchCampaigns(event: SelectFilterEvent) {
    this.filterSubjectCampaigns.next(event.filter);
  }

  onSubmit() {
    if (this.goalForm.valid) {
      this.submitEvent.emit(this.goalForm.value);
    }
  }

  goBack() {
    this.router.navigate(['/campaigns/goals']);
  }
}
