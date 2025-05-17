/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  input,
  model,
  output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableColumn } from '@interfaces/table-column';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDownload, lucideFilterX, lucideSearch } from '@ng-icons/lucide';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabel } from 'primeng/floatlabel';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { Table, TableModule, TablePageEvent } from 'primeng/table';

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
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    provideIcons({ lucideFilterX, lucideSearch, lucideDownload }),
  ],
})
export class TableComponent {
  columnsInput = input.required<TableColumn[]>();
  data = input.required<any[]>();
  loading = input<boolean>();
  columnTemplates = input<Record<string, TemplateRef<any>>>();

  search = output<string>();
  clearFilters = output<void>();
  pagination = output<TablePageEvent>();
  filterChange = output<any>();

  searchValue = model<string>('');
  @ViewChild('dt') dt!: Table;

  @ContentChild('tableActionTemplate', { read: TemplateRef })
  actionTemplate?: TemplateRef<any>;

  onSearch(value: Event) {
    const input = value.target as HTMLInputElement;
    this.search.emit(input.value);
    this.dt.filterGlobal(value, 'contains');
    console.log('Search: ' + input.value);
  }

  onFilter(event: any) {
    this.filterChange.emit(event);
    console.log('Filter: ' + event);
  }

  onPageChange(event: TablePageEvent) {
    this.pagination.emit(event);
    console.log(event);
  }

  clear() {
    this.dt.clear();
    this.searchValue.set('');
    this.clearFilters.emit();
    console.log('Clear');
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
}
