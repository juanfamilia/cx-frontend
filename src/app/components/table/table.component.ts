/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule, TitleCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ContentChild,
  inject,
  input,
  model,
  OnInit,
  output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableColumn } from '@interfaces/table-column';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDownload, lucideFilterX, lucideSearch } from '@ng-icons/lucide';
import { AuthService } from '@services/auth.service';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabel } from 'primeng/floatlabel';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { Table, TableModule, TablePageEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { RolePipe } from 'src/app/pipes/role.pipe';
import { Options } from 'src/app/types/options';
import { Pagination } from 'src/app/types/pagination';
import { StateNamePipe } from '../../pipes/state-name.pipe';

@Component({
  selector: 'app-table',
  imports: [
    TableModule,
    ButtonModule,
    CommonModule,
    MultiSelectModule,
    InputTextModule,
    DropdownModule,
    FormsModule,
    NgIcon,
    InputGroup,
    InputGroupAddon,
    FloatLabel,
    StateNamePipe,
    SelectModule,
    ReactiveFormsModule,
    TooltipModule,
    RolePipe,
    TagModule,
    TitleCasePipe,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    provideIcons({ lucideFilterX, lucideSearch, lucideDownload }),
  ],
})
export class TableComponent implements OnInit {
  columnsInput = input.required<TableColumn[]>();
  data = input.required<any[]>();
  loading = input<boolean>();
  columnTemplates = input<Record<string, TemplateRef<any>>>();
  filters = input<Options[]>();
  dafultFilter = input<number>(0);
  paginationOptions = input<Pagination>();
  checkPermissions = input<boolean>(false);

  search = output<{ filter: string; search: string }>();
  clearFilters = output<void>();
  pagination = output<TablePageEvent>();
  filterChange = output<any>();

  private authService = inject(AuthService);

  currentUser = computed(() => this.authService.getCurrentUser());

  searchInput = new FormControl();
  filterInput = model<string>('');
  @ViewChild('dt') dt!: Table;

  @ContentChild('tableActionTemplate', { read: TemplateRef })
  actionTemplate?: TemplateRef<any>;

  ngOnInit() {
    if (this.filters()) {
      this.filterInput.set(
        this.filters()![this.dafultFilter()].value as string
      );
    }

    this.searchInput.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(value => {
        this.search.emit({
          filter: this.filterInput(),
          search: value,
        });
        this.pagination.emit({
          first: 0,
          rows: this.dt.rows!,
        });
      });
  }

  onSearch() {
    if (this.searchInput.value !== null && this.searchInput.value !== '') {
      this.search.emit({
        filter: this.filterInput(),
        search: this.searchInput.value,
      });
    }
  }

  onFilter(event: any) {
    this.filterChange.emit(event);
    console.log('Filter: ' + event);
  }

  onPageChange(event: TablePageEvent) {
    this.pagination.emit(event);
  }

  clear() {
    this.dt.clear();
    this.searchInput.reset();
  }

  exportCSV() {
    this.dt.exportCSV();
  }

  get globalFilterFields(): string[] {
    return this.columnsInput()
      .filter(col => !!col.field)
      .map(col => col.field!) as string[];
  }

  getValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  }

  getPipeArg(col: TableColumn, index: number): string | boolean | undefined {
    return col.pipeArgs?.[index];
  }

  getSeverity(value: string) {
    switch (value) {
      case 'enviado':
        return 'info';

      case 'actualizado':
        return 'warn';

      case 'aprovado':
        return 'success';

      case 'rechazado':
        return 'danger';

      default:
        return 'warn';
    }
  }
}
