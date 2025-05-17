/* eslint-disable @typescript-eslint/no-explicit-any */
export interface TableColumn {
  field?: string;
  header: string;
  type?: 'text' | 'date' | 'number' | 'select' | 'custom';
  filter?: boolean;
  sortable?: boolean;
  options?: any[];
  customTemplate?: string;
}
