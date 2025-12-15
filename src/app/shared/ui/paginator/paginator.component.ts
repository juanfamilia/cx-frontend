import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Pagination } from 'src/app/types/pagination';

@Component({
  selector: 'app-paginator',
  imports: [PaginatorModule],
  templateUrl: './paginator.component.html',
  styleUrl: './paginator.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorComponent {
  pagination = input.required<Pagination | null>();
  event = output<PaginatorState>();

  onPageChange(event: PaginatorState) {
    this.event.emit(event);
  }
}
