import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonPrimaryComponent } from '@components/buttons/button-primary/button-primary.component';
import { ButtonSecondaryComponent } from '@components/buttons/button-secondary/button-secondary.component';
import { provideIcons } from '@ng-icons/core';
import { heroHome, heroQuestionMarkCircle } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, ButtonPrimaryComponent, ButtonSecondaryComponent],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ heroHome, heroQuestionMarkCircle })],
})
export class NotFoundComponent {
  private router = inject(Router);

  goToHome() {
    this.router.navigate(['/']);
  }
}
