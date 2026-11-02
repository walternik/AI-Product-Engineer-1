/**
 * Utilidades de fecha local para Manos a la Obra.
 *
 * Reglas:
 * - Las fechas se representan como cadenas YYYY-MM-DD.
 * - No se usa Date.prototype.toISOString() ni new Date("YYYY-MM-DD") porque
 *   ambos operan en UTC y pueden desplazar el día respecto del calendario local.
 */

/**
 * Devuelve la fecha de hoy en el calendario local como "YYYY-MM-DD".
 * @param {Date} [ahora=new Date()] — inyectable para tests.
 * @returns {string}
 */
export function fechaLocalHoy(ahora = new Date()) {
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

/**
 * Suma `dias` días de calendario a una cadena "YYYY-MM-DD" y devuelve
 * el resultado también como "YYYY-MM-DD".
 *
 * @param {string} fecha  — fecha base en formato YYYY-MM-DD.
 * @param {number} dias   — número de días a sumar (puede ser negativo).
 * @returns {string}
 */
export function sumarDias(fecha, dias) {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  // Construimos la fecha con el constructor de partes locales para evitar UTC.
  const d = new Date(anio, mes - 1, dia + dias);
  const a = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${a}-${m}-${dd}`;
}

/**
 * Comprueba que la cadena representa un día que realmente existe en el
 * calendario gregoriano (p. ej. "2024-02-30" no es real).
 *
 * @param {string} fecha — cadena en formato YYYY-MM-DD.
 * @returns {boolean}
 */
export function esFechaReal(fecha) {
  if (typeof fecha !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;

  const [anio, mes, dia] = fecha.split('-').map(Number);

  // Usamos el constructor de partes locales: si el motor ajusta el desbordamiento
  // (p. ej. mes 13 → enero del año siguiente), la fecha resultante no coincide.
  const d = new Date(anio, mes - 1, dia);
  return (
    d.getFullYear() === anio &&
    d.getMonth() === mes - 1 &&
    d.getDate() === dia
  );
}
