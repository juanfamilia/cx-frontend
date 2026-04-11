import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonPrimaryComponent } from '@shared/ui/buttons/button-primary/button-primary.component';
import { ButtonSecondaryComponent } from '@shared/ui/buttons/button-secondary/button-secondary.component';
import { InputTextComponent } from '@shared/ui/inputs/input-text/input-text.component';
import { SurveyFormCreate, SurveyFormDetail } from '@interfaces/survey-form';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideCheck,
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
import { ToggleSwitchModule } from 'primeng/toggleswitch';

/** Validates that the sum of weights (stored as %, 0-100) across all sections rounds to 100 */
function sectionWeightSumValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const sections = (control as FormArray).controls;
    if (!sections.length) return null;
    const hasWeights = sections.some(s => s.get('weight')?.value != null && s.get('weight')?.value !== '');
    if (!hasWeights) return null;
    const sum = sections.reduce((acc, s) => {
      const w = parseFloat(s.get('weight')?.value ?? 0);
      return acc + (isNaN(w) ? 0 : w);
    }, 0);
    return Math.abs(sum - 100) > 0.5 ? { weightSum: { sum: Math.round(sum) } } : null;
  };
}

/** Validates that aspect weights within a section sum to 100 */
function aspectWeightSumValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const aspects = (control as FormArray).controls;
    if (!aspects.length) return null;
    const hasWeights = aspects.some(a => a.get('weight')?.value != null && a.get('weight')?.value !== '');
    if (!hasWeights) return null;
    const sum = aspects.reduce((acc, a) => {
      const w = parseFloat(a.get('weight')?.value ?? 0);
      return acc + (isNaN(w) ? 0 : w);
    }, 0);
    return Math.abs(sum - 100) > 0.5 ? { weightSum: { sum: Math.round(sum) } } : null;
  };
}

@Component({
  selector: 'app-survey-forms-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextComponent,
    ButtonPrimaryComponent,
    NgIcon,
    InputNumberModule,
    FloatLabelModule,
    ButtonSecondaryComponent,
    SelectModule,
    ToggleSwitchModule,
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
      lucideCheck,
    }),
  ],
})
export class SurveyFormsFormComponent implements OnInit {
  isEdit = input<boolean>(false);
  surveyForm = input<SurveyFormDetail | null>(null);

  submitEvent = output<SurveyFormCreate>();

  private fb = inject(FormBuilder);
  private router = inject(Router);

  surveyFormForm!: FormGroup;

  readonly aspectTypes = [
    { label: 'Puntaje numérico', value: 'number', hint: 'Ej: 0 – 10' },
    { label: 'Sí / No', value: 'boolean', hint: 'Cumple o no cumple' },
    { label: 'Escala Likert (1–5)', value: 'likert', hint: 'Muy malo → Muy bueno' },
    { label: 'Cumplimiento (C/NC/CP/NA)', value: 'compliance', hint: 'Estándar de auditoría' },
    { label: 'Evidencia multimedia', value: 'media', hint: 'Requiere foto o clip de video' },
  ];

  ngOnInit() {
    this.surveyFormForm = this.fb.group({
      title: ['', [Validators.required]],
      sections: this.fb.array([], sectionWeightSumValidator()),
    });

    const formData = this.surveyForm();
    if (this.isEdit() && formData) {
      this.pathFormData(formData);
    }
  }

  get sections(): FormArray {
    return this.surveyFormForm.get('sections') as FormArray;
  }

  getAspects(sectionIndex: number): FormArray {
    return this.sections.at(sectionIndex).get('aspects') as FormArray;
  }

  sectionWeightSum(): number {
    return Math.round(
      this.sections.controls.reduce((acc, s) => {
        const w = parseFloat(s.get('weight')?.value ?? 0);
        return acc + (isNaN(w) ? 0 : w);
      }, 0)
    );
  }

  aspectWeightSum(sectionIndex: number): number {
    return Math.round(
      this.getAspects(sectionIndex).controls.reduce((acc, a) => {
        const w = parseFloat(a.get('weight')?.value ?? 0);
        return acc + (isNaN(w) ? 0 : w);
      }, 0)
    );
  }

  sectionWeightSumOk(): boolean {
    return this.sectionWeightSum() === 100 || this.sectionWeightSum() === 0;
  }

  aspectWeightSumOk(sectionIndex: number): boolean {
    const sum = this.aspectWeightSum(sectionIndex);
    return sum === 100 || sum === 0;
  }

  addSection() {
    const index = this.sections.length;
    const aspectsArray = this.fb.array<FormGroup>([], aspectWeightSumValidator());
    this.sections.push(
      this.fb.group({
        name: ['', [Validators.required]],
        maximum_score: [0, [Validators.required]],
        order: [index, [Validators.required]],
        weight: [null],
        aspects: aspectsArray,
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

  addAspect(sectionIndex: number) {
    const aspects = this.getAspects(sectionIndex);
    const order = aspects.length;
    aspects.push(
      this.fb.group({
        description: ['', [Validators.required]],
        type: ['compliance', [Validators.required]],
        maximum_score: [null],
        order: [order, [Validators.required]],
        weight: [null],
        requires_evidence: [false],
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

  getAspectTypeHint(sectionIndex: number, aspectIndex: number): string {
    const typeVal = this.getAspects(sectionIndex).at(aspectIndex).get('type')?.value;
    return this.aspectTypes.find(t => t.value === typeVal)?.hint ?? '';
  }

  needsMaxScore(sectionIndex: number, aspectIndex: number): boolean {
    const t = this.getAspects(sectionIndex).at(aspectIndex).get('type')?.value;
    return t === 'number';
  }

  onSubmit() {
    if (this.surveyFormForm.valid) {
      const raw = this.surveyFormForm.value;
      // UI shows % (0–100), backend expects decimal (0.0–1.0)
      const sections = raw.sections.map((s: any) => ({
        ...s,
        weight: s.weight ? parseFloat(s.weight) / 100 : null,
        aspects: s.aspects.map((a: any) => ({
          ...a,
          weight: a.weight ? parseFloat(a.weight) / 100 : null,
          maximum_score: a.maximum_score ?? null,
        })),
      }));
      this.submitEvent.emit({ title: raw.title, sections });
    }
  }

  goBack() {
    this.router.navigate(['/survey-forms']);
  }

  pathFormData(formData: SurveyFormDetail) {
    this.surveyFormForm.patchValue({ title: formData.title });

    formData.sections.forEach((section) => {
      const aspectsArray = this.fb.array<FormGroup>([], aspectWeightSumValidator());

      section.aspects.forEach((aspect) => {
        aspectsArray.push(
          this.fb.group({
            description: [aspect.description, [Validators.required]],
            type: [aspect.type ?? 'compliance', Validators.required],
            maximum_score: [aspect.maximum_score ?? null],
            order: [aspect.order, [Validators.required]],
            weight: [aspect.weight != null ? Math.round(aspect.weight * 100) : null],
            requires_evidence: [aspect.requires_evidence ?? false],
          })
        );
      });

      this.sections.push(
        this.fb.group({
          name: [section.name, [Validators.required]],
          maximum_score: [section.maximum_score, [Validators.required]],
          order: [section.order, [Validators.required]],
          weight: [section.weight != null ? Math.round(section.weight * 100) : null],
          aspects: aspectsArray,
        })
      );
    });
  }
}
