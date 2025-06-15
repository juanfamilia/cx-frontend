import { DatePipe, TitleCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonPrimaryComponent } from '@components/buttons/button-primary/button-primary.component';
import { ButtonSecondaryComponent } from '@components/buttons/button-secondary/button-secondary.component';
import { InputLocationComponent } from '@components/inputs/input-location/input-location.component';
import { InputTextComponent } from '@components/inputs/input-text/input-text.component';
import { Campaign } from '@interfaces/campaign';
import { Evaluation } from '@interfaces/evaluation';
import { SurveyFormDetail } from '@interfaces/survey-form';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideMinus,
  lucidePlus,
  lucideSave,
  lucideType,
  lucideUser,
} from '@ng-icons/lucide';
import 'media-chrome';
import { FileUploadHandlerEvent, FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TextareaModule } from 'primeng/textarea';

import { SpinnerComponent } from '@components/spinner/spinner.component';
import { EvaluationChangeStatusComponent } from '../evaluation-change-status/evaluation-change-status.component';

@Component({
  selector: 'app-evaluation-form',
  imports: [
    ReactiveFormsModule,
    TextareaModule,
    DatePipe,
    TitleCasePipe,
    InputNumberModule,
    NgIcon,
    SelectButtonModule,
    InputLocationComponent,
    InputTextComponent,
    ButtonPrimaryComponent,
    FileUploadModule,
    ButtonSecondaryComponent,
    EvaluationChangeStatusComponent,
    SpinnerComponent,
  ],
  templateUrl: './evaluation-form.component.html',
  styleUrl: './evaluation-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      lucidePlus,
      lucideMinus,
      lucideUser,
      lucideSave,
      lucideType,
      lucideArrowLeft,
    }),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EvaluationFormComponent implements OnInit {
  campaign = input.required<Campaign>();
  byZone = input.required<boolean>();
  isEditing = input<boolean>(false);
  evaluation = input<Evaluation | null>(null);
  isLoading = input<boolean>(false);

  disabled = input<boolean>(false);

  submitEvent = output<FormData>();

  private fb = inject(FormBuilder);
  private router = inject(Router);

  evaluationForm!: FormGroup;
  selectMediaFile = signal<File | null>(null);

  ngOnInit() {
    this.evaluationForm = this.generateEvaluationForm(this.campaign().survey!);

    if (this.isEditing() && this.evaluation()) {
      this.evaluationForm.patchValue({
        title: this.evaluation()?.video.title,
        location: this.evaluation()?.location,
        evaluated_collaborator: this.evaluation()?.evaluated_collaborator,
        evaluation_answers: this.evaluation()?.evaluation_answers,
      });

      this.evaluation()?.evaluation_answers.forEach(answer => {
        const group = this.getEvaluationAspectById(answer.aspect_id);
        if (group) {
          group.patchValue({
            value_number: answer.value_number,
            value_boolean: answer.value_boolean,
            comment: answer.comment,
          });
          group.setControl(
            'id',
            new FormControl(answer.id, Validators.required)
          );
        }
      });
    }

    if (this.disabled()) {
      this.evaluationForm.get('evaluation_answers')?.disable();
    }
  }

  generateEvaluationForm(survey: SurveyFormDetail): FormGroup {
    const answerControls: Record<number, FormGroup> = {};

    for (const section of survey.sections) {
      for (const aspect of section.aspects) {
        answerControls[aspect.id] = this.fb.group({
          aspect_id: [aspect.id],
          value_number: [
            null,
            aspect.type === 'number' ? [Validators.required] : [],
          ],
          value_boolean: [
            null,
            aspect.type === 'boolean' ? [Validators.required] : [],
          ],
          comment: [''],
        });
      }
    }

    return this.fb.group({
      title: new FormControl(
        { value: '', disabled: this.disabled() },
        Validators.required
      ),
      location: new FormControl({ value: null, disabled: this.disabled() }),
      evaluated_collaborator: new FormControl(
        { value: '', disabled: this.disabled() },
        Validators.required
      ),
      evaluation_answers: new FormGroup(answerControls),
    });
  }

  get evaluationAnswers(): FormArray {
    return this.evaluationForm.get('evaluation_answers') as FormArray;
  }

  getEvaluationAspectById(id: number): FormGroup {
    return this.evaluationAnswers.get(id.toString()) as FormGroup;
  }

  onMediaUpload(event: FileUploadHandlerEvent) {
    const file = event.files?.[0];
    if (!file) return;

    this.selectMediaFile.set(file);

    console.log(this.selectMediaFile());
  }

  onSubmit() {
    if (!this.evaluationForm.valid || !this.selectMediaFile()) {
      return;
    }

    const formData = new FormData();

    formData.append('media', this.selectMediaFile()!);
    formData.append('video_title', this.evaluationForm.get('title')?.value);
    formData.append('campaign_id', this.campaign().id.toString());
    formData.append('location', this.evaluationForm.get('location')?.value);
    formData.append(
      'evaluated_collaborator',
      this.evaluationForm.get('evaluated_collaborator')?.value
    );

    const answersGroup = this.evaluationAnswers;
    const answersArray = Object.values(answersGroup.controls).map(
      ctrl => ctrl.value
    );

    formData.append('evaluation_answers', JSON.stringify(answersArray));

    this.submitEvent.emit(formData);
  }

  onEdit() {
    if (this.isEditing() && this.evaluationForm.valid) {
      const formData = new FormData();

      if (this.selectMediaFile() !== null) {
        formData.append('media', this.selectMediaFile()!);
      }

      formData.append('video_title', this.evaluationForm.get('title')?.value);
      formData.append('location', this.evaluationForm.get('location')?.value);
      formData.append(
        'evaluated_collaborator',
        this.evaluationForm.get('evaluated_collaborator')?.value
      );
      const answersGroup = this.evaluationAnswers;
      const answersArray = Object.values(answersGroup.controls).map(
        ctrl => ctrl.value
      );

      formData.append('evaluation_answers', JSON.stringify(answersArray));

      this.submitEvent.emit(formData);
    }
  }

  goBack() {
    this.router.navigate(['/evaluations']);
  }
}
