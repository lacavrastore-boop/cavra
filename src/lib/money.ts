/** Formato COP sin decimales, estilo es-CO: 89900 -> "$89.900" */
export function formatCOP(pesos: number): string {
  const entero = Math.round(pesos);
  return '$' + String(entero).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
