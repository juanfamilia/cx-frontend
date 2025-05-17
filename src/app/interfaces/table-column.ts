/* eslint-disable @typescript-eslint/no-explicit-any */
export interface TableColumn {
  field?: string;
  header: string;
  sortable?: boolean;
  type?: 'text' | 'select' | 'custom';
  options?: any[];
  customTemplate?: string;
  pipe?: string;
  pipeArgs?: any[];
}
