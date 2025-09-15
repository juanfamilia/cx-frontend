// VERSIÓN SIMPLE - Función standalone para usar directamente en componente
export function convertJsonToCsv(jsonString: string): string {
  try {
    // Limpiar espacios en blanco al inicio
    const cleanedJson = jsonString.trim();

    // Parsear JSON
    const data = JSON.parse(cleanedJson);

    // Función auxiliar para aplanar objeto
    function flatten(
      obj: Record<string, unknown>,
      prefix = ''
    ): Record<string, unknown> {
      const flattened: Record<string, unknown> = {};

      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const fullKey = prefix ? `${prefix}_${key}` : key;
          const value = obj[key];

          if (value === null || value === undefined) {
            flattened[fullKey] = '';
          } else if (Array.isArray(value)) {
            if (value.length === 0) {
              flattened[fullKey] = '';
            } else {
              flattened[fullKey] = value.join('; '); // Unir array con punto y coma
            }
          } else if (
            typeof value === 'object' &&
            value !== null &&
            !Array.isArray(value)
          ) {
            Object.assign(
              flattened,
              flatten(value as Record<string, unknown>, fullKey)
            );
          } else {
            flattened[fullKey] = value;
          }
        }
      }
      return flattened;
    }

    const flattened = flatten(data);

    // Crear headers y valores
    const headers = Object.keys(flattened);
    const values = Object.values(flattened).map(v =>
      String(v).includes(',') ? `"${v}"` : String(v)
    );

    return `${headers.join(',')}\n${values.join(',')}`;
  } catch (error) {
    throw new Error('Error procesando JSON: ' + error);
  }
}
