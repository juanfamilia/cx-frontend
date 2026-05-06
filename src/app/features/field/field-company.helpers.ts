import { Company } from '@interfaces/company';

/** Etiqueta segura para desplegables cuando la API devuelve placeholders (`string`, vacío, etc.). */
export function companyDisplayLabel(co: Pick<Company, 'id' | 'name'>): string {
  const n = String(co.name ?? '').trim();
  if (!n || /^string|null|undefined$/i.test(n)) {
    // Evitar "Empresa (3)" que parece un conteo; es el ID interno del tenant.
    return `Sin nombre · ID ${co.id}`;
  }
  return n;
}
