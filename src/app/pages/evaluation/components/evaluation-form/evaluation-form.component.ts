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
import { SpinnerComponent } from '@components/spinner/spinner.component';
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
import { CloudflareStreamService } from '@services/cloudflare-stream.service';
import { VideoService } from '@services/video.service';
import 'hls-video-element';
import 'media-chrome';
import 'media-chrome/menu';
import { PrimeNG } from 'primeng/config';
import { FileUploadHandlerEvent, FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressBar } from 'primeng/progressbar';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TextareaModule } from 'primeng/textarea';
import { VISITED_ZONES } from 'src/app/constants/visited_zones';
import * as tus from 'tus-js-client';
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
    ProgressBar,
    MultiSelectModule,
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

  visitedZones = VISITED_ZONES;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private videoService = inject(VideoService);
  private streamService = inject(CloudflareStreamService);
  private config = inject(PrimeNG);

  evaluationForm!: FormGroup;

  selectMediaFile = signal<File | null>(null);

  uploadComplete = signal<boolean>(false);
  uploadProgress = signal<number>(0);
  uploadedSize = signal<string>('0 MB');
  totalSize = signal<string>('0 MB');

  videoUrl = signal<string>('');

  totalScore = signal<number>(0);
  maxScore = signal<number>(0);

  ngOnInit() {
    this.evaluationForm = this.generateEvaluationForm(this.campaign().survey!);

    // Calcular puntaje máximo de la encuesta
    const max = this.campaign().survey!.sections.reduce(
      (sum, s) =>
        sum + s.aspects.reduce((aSum, a) => aSum + a.maximum_score, 0),
      0
    );
    this.maxScore.set(max);

    // Escuchar cambios para recalcular total
    this.evaluationForm
      .get('evaluation_answers')
      ?.valueChanges.subscribe(() => {
        this.calculateTotalScore();
      });

    if (this.isEditing() && this.evaluation()) {
      this.evaluationForm.patchValue({
        title: this.evaluation()?.video.title,
        location: this.evaluation()?.location,
        evaluated_collaborator: this.evaluation()?.evaluated_collaborator,
        visited_zones: this.evaluation()?.visited_zones,
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
      visited_zones: new FormControl({ value: [], disabled: this.disabled() }),
      evaluation_answers: new FormGroup(answerControls),
    });
  }

  get evaluationAnswers(): FormArray {
    return this.evaluationForm.get('evaluation_answers') as FormArray;
  }

  getEvaluationAspectById(id: number): FormGroup {
    return this.evaluationAnswers.get(id.toString()) as FormGroup;
  }

  calculateTotalScore() {
    const survey = this.campaign().survey!;
    let total = 0;

    Object.values(this.evaluationAnswers.controls).forEach(ctrl => {
      const group = ctrl as FormGroup;
      const aspectId = group.get('aspect_id')?.value;
      const aspect = survey.sections
        .flatMap(s => s.aspects)
        .find(a => a.id === aspectId);

      if (!aspect) return;

      if (aspect.type === 'number') {
        const val = group.get('value_number')?.value;
        if (val !== null && val !== undefined) total += val;
      } else if (aspect.type === 'boolean') {
        const val = group.get('value_boolean')?.value;
        if (val === true) total += aspect.maximum_score;
      }
    });

    this.totalScore.set(total);
  }
  onMediaUpload(event: FileUploadHandlerEvent) {
    const file = event.files?.[0];
    if (!file) return;
    this.selectMediaFile.set(file);
    this.totalSize.set(this.formatSize(file.size));
  }

  onMediaSubmit() {
    const file = this.selectMediaFile();
    if (!file) return;

    this.streamService.getTusUploadUrl(this.selectMediaFile()!).subscribe({
      next: res => {
        const location = res.headers.get('Location');
        this.uploadWithTus(file, location);
      },
      error: err => {
        console.error('❌ Error al obtener URL de subida:', err);
      },
    });
  }

  uploadWithTus(file: File, uploadUrl: string) {
    const upload = new tus.Upload(file, {
      endpoint: uploadUrl, // este debe ser la URL completa devuelta por el backend (Location)
      metadata: {
        filename: file.name,
        filetype: file.type,
      },
      chunkSize: 50 * 1024 * 1024, // 50MB
      retryDelays: [0, 1000, 3000, 5000],
      onError: error => {
        console.error('Error al subir a Cloudflare:', error);
        this.uploadComplete.set(false);
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        this.uploadProgress.set((bytesUploaded / bytesTotal) * 100);
        this.uploadedSize.set(this.formatSize(bytesUploaded));
      },
      onSuccess: () => {
        const uid = upload.url!.split('/').pop()?.split('?')[0];
        console.log(uid);
        this.videoUrl.set(uid!);
        this.uploadComplete.set(true);
      },
    });

    upload.start();
  }

  onRemoveMedia() {
    this.selectMediaFile.set(null);
    this.uploadProgress.set(0);
    this.uploadedSize.set('0 MB');
    this.totalSize.set('0 MB');
    this.uploadComplete.set(false);
  }

  onSubmit() {
    if (this.evaluationForm.valid || this.uploadComplete()) {
      const formData = new FormData();

      formData.append('media_url', this.videoUrl()!);
      formData.append('video_title', this.evaluationForm.get('title')?.value);
      formData.append('campaign_id', this.campaign().id.toString());
      formData.append('location', this.evaluationForm.get('location')?.value);
      formData.append(
        'evaluated_collaborator',
        this.evaluationForm.get('evaluated_collaborator')?.value
      );
      formData.append(
        'visited_zones',
        JSON.stringify(this.evaluationForm.get('visited_zones')?.value)
      );

      const answersGroup = this.evaluationAnswers;
      const answersArray = Object.values(answersGroup.controls).map(
        ctrl => ctrl.value
      );

      formData.append('evaluation_answers', JSON.stringify(answersArray));

      this.submitEvent.emit(formData);
    }
  }

  onEdit() {
    if (this.isEditing() && this.evaluationForm.valid) {
      const formData = new FormData();

      if (this.uploadComplete() !== null) {
        formData.append('media_url', this.videoUrl()!);
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

  formatSize(bytes: number): string {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  }
}
