import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonPrimaryComponent } from '@components/buttons/button-primary/button-primary.component';
import { InputPasswordComponent } from '@components/inputs/input-password/input-password.component';
import { InputTextComponent } from '@components/inputs/input-text/input-text.component';
import { SpinnerComponent } from '@components/spinner/spinner.component';
import { provideIcons } from '@ng-icons/core';
import { heroEnvelope, heroLockClosed } from '@ng-icons/heroicons/outline';
import { AuthService } from '@services/auth.service';
import { ThemeServiceService } from '@services/theme-service.service';
import { ShareToasterService } from '@services/toast.service';

@Component({
  selector: 'app-login',
  imports: [
    InputTextComponent,
    InputPasswordComponent,
    ButtonPrimaryComponent,
    SpinnerComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ heroEnvelope, heroLockClosed })],
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ShareToasterService);
  private router = inject(Router);
  private themeService = inject(ThemeServiceService);

  form!: FormGroup;
  isLoading = signal(false);

  currentYear = new Date().getFullYear();

  darkMode = computed(() => this.themeService.darkMode());

  constructor() {
    if (this.authService.isAuth()) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.isLoading.set(true);
      
      console.log('🔍 Enviando login con datos:', this.form.value);
      
      this.authService.login(this.form.value).subscribe({
        next: data => {
          console.log('✅ LOGIN SUCCESS - Data completa:', data);
          console.log('✅ Token recibido:', data.access_token);
          console.log('✅ Usuario recibido:', data.user);
          
          this.authService.setCredentials(data.access_token, data.user);
        },
        error: error => {
          console.error('❌ LOGIN ERROR - Error completo:', error);
          console.error('❌ Error status:', error.status);
          console.error('❌ Error detail:', error.error?.detail);
          console.error('❌ Error message:', error.message);
          
          this.isLoading.set(false);
          this.toastService.showToast(
            'error',
            'Error al iniciar sesión',
            error.error?.detail || 'Error desconocido'
          );
        },
        complete: () => {
          console.log('✅ LOGIN COMPLETE - Redirigiendo...');
          this.isLoading.set(false);
          this.router.navigate(['/']);
        },
      });
    } else {
      console.warn('⚠️ Formulario inválido:', this.form.errors);
    }
  }
}
