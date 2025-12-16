export class SurveyFormsFormComponent implements OnInit {
  isEdit = input<boolean>(false);
  surveyForm = input<SurveyFormDetail | null>(null);

  submitEvent = output<SurveyFormCreate>();

  private fb = inject(FormBuilder);
  private router = inject(Router);

  surveyFormForm!: FormGroup;

  ngOnInit() {
    this.surveyFormForm = this.fb.group({
      title: ['', [Validators.required]],
      sections: this.fb.array([]),
    });

    const formData = this.surveyForm(); // puede ser null

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

    formData.sections.forEach(section => {
      const sectionGroup = this.fb.group({
        name: [section.name, [Validators.required]],
        maximum_score: [section.maximum_score, [Validators.required]],
        order: [section.order, [Validators.required]],
        aspects
