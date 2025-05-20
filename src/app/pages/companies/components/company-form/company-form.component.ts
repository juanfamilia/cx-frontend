import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonPrimaryComponent } from '@components/buttons/button-primary/button-primary.component';
import { InputLocationComponent } from '@components/inputs/input-location/input-location.component';
import { InputTextComponent } from '@components/inputs/input-text/input-text.component';
import { InputTextareaComponent } from '@components/inputs/input-textarea/input-textarea.component';
import { Company, CompanyCreate } from '@interfaces/company';
import { provideIcons } from '@ng-icons/core';
import {
  lucideBuilding,
  lucideBuilding2,
  lucideMail,
  lucideMapPinned,
  lucideSmartphone,
} from '@ng-icons/lucide';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-company-form',
  imports: [
    ReactiveFormsModule,
    DividerModule,
    InputTextComponent,
    InputLocationComponent,
    ButtonPrimaryComponent,
    InputTextareaComponent,
  ],
  templateUrl: './company-form.component.html',
  styleUrl: './company-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    provideIcons({
      lucideBuilding2,
      lucideSmartphone,
      lucideMail,
      lucideMapPinned,
      lucideBuilding,
    }),
  ],
})
export class CompanyFormComponent implements OnInit {
  isEdit = input<boolean>(false);
  company = input<Company>();

  submitEvent = output<CompanyCreate>();

  private fb = inject(FormBuilder);

  companyForm = this.fb.group({
    name: ['', [Validators.required]],
    phone: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    state: ['', [Validators.required]],
    address: ['', [Validators.required]],
  });

  ngOnInit() {
    if (this.isEdit()) {
      this.companyForm.patchValue({
        name: this.company()!.name,
        phone: this.company()!.phone,
        email: this.company()!.email,
        state: this.company()!.state,
        address: this.company()!.address,
      });
    }
  }

  onSubmit() {
    if (this.companyForm.valid) {
      this.submitEvent.emit(this.companyForm.value as CompanyCreate);
    }
  }
}
