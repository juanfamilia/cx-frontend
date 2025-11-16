import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonPrimaryComponent } from '@components/buttons/button-primary/button-primary.component';
import { ButtonSecondaryComponent } from '@components/buttons/button-secondary/button-secondary.component';
import { InputTextComponent } from '@components/inputs/input-text/input-text.component';
import { SurveyFormCreate, SurveyFormDetail } from '@interfaces/survey-form';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideLayoutTemplate,
  lucideMinus,
  lucidePlus,
  lucideProportions,
  lucideSave,
  lucideText,
  lucideTrash,
  lucideType,
} from '@ng-icons/lucide';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-survey-forms-form',
  imports: [
    ReactiveFormsModule,
    InputTextComponent,
    ButtonPrimaryComponent,
    NgIcon,
    InputNumberModule,
    FloatLabelModule,
    ButtonSecondaryComponent,
    SelectModule,
  ],
  templateUrl: './survey-forms-form.component.html',
  styleUrl: './survey-forms-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    provideIcons({
      lucideType,
      lucideLayoutTemplate,
      lucideProportions,
      lucideText,
      lucideTrash,
      lucidePlus,
      lucideMinus,
      lucideArrowLeft,
      lucideSave,
    }),
  ],
})
export class SurveyFormsFormComponent implements OnInit {
  isEdit = input<boolean>(false);
  surveyForm = input<SurveyFormDetail>();

  submitEvent = output<SurveyFormCreate>();

  private fb = inject(FormBuilder);
  private router = inject(Router);

  surveyFormForm!: FormGroup;

  ngOnInit() {
    this.surveyFormForm = this.fb.group({
      title: ['', [Validators.required]],
      sections: this.fb.array([]),
    });

    if (this.isEdit()) {
      this.pathFormData(this.surveyForm()!);
    }
  }

  get sections(): FormArray {
    return this.surveyFormForm.get('sections') as FormArray;
  }

  getAspects(sectionIndex: number): FormArray {
    return this.sections.at(sectionIndex).get('aspects') as FormArray;
  }

  // Control de secciones
  addSection() {
    const index = this.sections.length;
    this.sections.push(
      this.fb.group({
        name: ['', [Validators.required]],
        maximum_score: [0, [Validators.required]],
        order: [index, [Validators.required]],
        aspects: this.fb.array([]),
      })
    );
  }

  removeSection(index: number) {
    this.sections.removeAt(index);
    this.recalculateSectionOrders();
  }

  recalculateSectionOrders() {
    this.sections.controls.forEach((section, i) => {
      section.get('order')?.setValue(i);
    });
  }

  // Control de aspectos de una sección
  addAspect(sectionIndex: number) {
    const aspects = this.getAspects(sectionIndex);
    const order = aspects.length;
    aspects.push(
      this.fb.group({
        description: ['', [Validators.required]],
        type: ['', [Validators.required]],
        maximum_score: [0],
        order: [order, [Validators.required]],
      })
    );
  }

  removeAspect(sectionIndex: number, aspectIndex: number) {
    const aspects = this.getAspects(sectionIndex);
    aspects.removeAt(aspectIndex);
    this.recalculateAspectOrders(sectionIndex);
  }

  recalculateAspectOrders(sectionIndex: number) {
    const aspects = this.getAspects(sectionIndex);
    aspects.controls.forEach((aspect, i) => {
      aspect.get('order')?.setValue(i);
    });
  }

  onSubmit() {
    if (this.surveyFormForm.valid) {
      this.submitEvent.emit(this.surveyFormForm.value);
    }
  }

  goBack() {
    this.router.navigate(['/survey-forms']);
  }

  pathFormData(formData: SurveyFormDetail) {
    this.surveyFormForm.patchValue({
      title: formData.title,
    });

    // Agregar secciones con sus aspectos
    formData.sections.forEach(section => {
      const sectionGroup = this.fb.group({
        name: [section.name, [Validators.required]],
        maximum_score: [section.maximum_score, [Validators.required]],
        order: [section.order, [Validators.required]],
        aspects: this.fb.array([]),
      });

      const aspectsArray = sectionGroup.get('aspects') as FormArray;

      section.aspects.forEach(aspect => {
        aspectsArray.push(
          this.fb.group({
            description: [aspect.description, [Validators.required]],
            type: [aspect.type, Validators.required],
            maximum_score: [aspect.maximum_score, [Validators.required]],
            order: [aspect.order, [Validators.required]],
          })
        );
      });

      this.sections.push(sectionGroup);
    });
  }
}
