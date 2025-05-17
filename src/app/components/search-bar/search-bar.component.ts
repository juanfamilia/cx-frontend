import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  OnInit,
  output,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonSecondaryComponent } from '@components/buttons/button-secondary/button-secondary.component';
import { InputTextComponent } from '@components/inputs/input-text/input-text.component';
import { provideIcons } from '@ng-icons/core';
import {
  heroDocumentArrowUp,
  heroMagnifyingGlass,
} from '@ng-icons/heroicons/outline';
import { lucideFilterX } from '@ng-icons/lucide';
import { SelectModule } from 'primeng/select';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Options } from 'src/app/types/options';

@Component({
  selector: 'app-search-bar',
  imports: [
    InputTextComponent,
    SelectModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonSecondaryComponent,
  ],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    provideIcons({ heroMagnifyingGlass, lucideFilterX, heroDocumentArrowUp }),
  ],
})
export class SearchBarComponent implements OnInit {
  filters = input.required<Options[]>();
  dafultFilter = input<number>(0);
  searchEvent = output<{ filter: string; search: string }>();

  searchInput = new FormControl();
  filterInput = model<string>();

  ngOnInit(): void {
    this.filterInput.set(this.filters()[this.dafultFilter()].value as string);
    this.searchInput.valueChanges
      .pipe(debounceTime(600), distinctUntilChanged())
      .subscribe(value => {
        this.searchEvent.emit({
          filter: this.filterInput()!,
          search: value,
        });
      });
  }

  clear() {
    this.searchInput.reset();
    this.filterInput.set(this.filters()[this.dafultFilter()].value as string);
  }

  onSearch() {
    if (this.searchInput.value !== null && this.searchInput.value !== '') {
      this.searchEvent.emit({
        filter: this.filterInput()!,
        search: this.searchInput.value,
      });
    }
  }
}
