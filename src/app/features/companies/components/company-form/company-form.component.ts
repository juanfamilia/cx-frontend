import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ButtonPrimaryComponent } from '@shared/ui/buttons/button-primary/button-primary.component';
import { ButtonSecondaryComponent } from '@shared/ui/buttons/button-secondary/button-secondary.component';
import { InputLocationComponent } from '@shared/ui/inputs/input-location/input-location.component';
import { InputSelectComponent } from '@shared/ui/inputs/input-select/input-select.component';
import { InputTextComponent } from '@shared/ui/inputs/input-text/input-text.component';
import { InputTextareaComponent } from '@shared/ui/inputs/input-textarea/input-textarea.component';
import { Company, CompanyCreate } from '@interfaces/company';
import { Options } from 'src/app/types/options';
import { QualityFrameworkService } from '@pages/quality-framework/quality-framework.service';
import { provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideBriefcase,
  lucideBuilding,
  lucideBuilding2,
  lucideMail,
  lucideMapPinned,
  lucideSmartphone,
} from '@ng-icons/lucide';
import { DividerModule } from 'primeng/divider';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-company-form',
  imports: [
    ReactiveFormsModule,
    DividerModule,
    InputTextComponent,
    InputLocationComponent,
    ButtonPrimaryComponent,
    InputTextareaComponent,
    ButtonSecondaryComponent,
    InputSelectComponent,
    ToggleSwitchModule,
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
      lucideArrowLeft,
      lucideBriefcase,
    }),
  ],
})
export class CompanyFormComponent implements OnInit {
  isEdit = input<boolean>(false);
  company = input<Company>();

  submitEvent = output<CompanyCreate>();

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);
  private qualityFramework = inject(QualityFrameworkService);

  /** Opciones para superadmin: asignar industria (template CX). */
  industryOptions = signal<Options[]>([]);

  companyForm = this.fb.group({
    name: ['', [Validators.required]],
    phone: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    state: ['', [Validators.required]],
    address: ['', [Validators.required]],
    industry_id: [null as number | null],
    siete_ins_enabled: [false],
    siete_field_enabled: [false],
    siete_clever_enabled: [false],
  });

  get showIndustrySelect(): boolean {
    return this.auth.getCurrentUser()?.role === 0;
  }

  ngOnInit() {
    if (this.showIndustrySelect) {
      this.qualityFramework.listIndustries(0, 200).subscribe({
        next: res => {
          const opts: Options[] = res.data.map(i => ({
            name: i.name,
            value: i.id,
          }));
          this.industryOptions.set(opts);
        },
      });
    }
    if (this.isEdit()) {
      const c = this.company()!;
      this.companyForm.patchValue({
        name: c.name,
        phone: c.phone,
        email: c.email,
        state: c.state,
        address: c.address,
        industry_id: c.industry_id ?? null,
        siete_ins_enabled: !!c.siete_ins_enabled,
        siete_field_enabled: !!c.siete_field_enabled,
        siete_clever_enabled: !!c.siete_clever_enabled,
      });
    }
  }

  onSubmit() {
    if (this.companyForm.valid) {
      const raw = this.companyForm.getRawValue();
      const industryId: number | null =
        raw.industry_id != null && raw.industry_id > 0 ? raw.industry_id : null;
      const payload: CompanyCreate = {
        name: raw.name!,
        phone: raw.phone!,
        email: raw.email!,
        address: raw.address!,
        state: raw.state!,
        country: 'DO',
        industry_id: this.showIndustrySelect ? industryId : undefined,
      };
      if (this.showIndustrySelect) {
        payload.siete_ins_enabled = !!raw.siete_ins_enabled;
        payload.siete_field_enabled = !!raw.siete_field_enabled;
        payload.siete_clever_enabled = !!raw.siete_clever_enabled;
      }
      this.submitEvent.emit(payload);
    }
  }

  goBack() {
    this.router.navigate(['/companies']);
  }
}
