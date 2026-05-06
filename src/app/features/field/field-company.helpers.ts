import { Company } from '@interfaces/company';

/** Etiqueta segura para desplegables cuando la API devuelve placeholders (`string`, vacío, etc.). */
export function companyDisplayLabel(co: Pick<Company, 'id' | 'name'>): string {
  const n = String(co.name ?? '').trim();
  if (!n || /^string|null|undefined$/i.test(n)) {
    return `Empresa (${co.id})`;
  }
  return n;
}
