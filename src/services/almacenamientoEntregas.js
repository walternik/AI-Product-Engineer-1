/**
 * Acceso a localStorage para las entregas de Manos a la Obra.
 *
 * Clave única: "manos-a-la-obra.entregas"
 *
 * leer() devuelve:
 *   { tipo: 'ausencia' }              — la clave no está en el almacenamiento.
 *   { tipo: 'ok', entregas: [...] }   — arreglo JSON válido.
 *   { tipo: 'fallo-lectura' }         — localStorage no disponible, JSON inválido
 *                                       o el valor no es un arreglo.
 *
 * guardar(entregas) devuelve:
 *   { tipo: 'ok' }                    — escritura exitosa.
 *   { tipo: 'fallo-escritura' }       — setItem lanzó (QuotaExceededError, etc.).
 *                                       El valor anterior queda intacto.
 *
 * No se hacen llamadas de red.
 * Este módulo no modifica ni lee "manos-a-la-obra.lotes".
 */

const CLAVE = 'manos-a-la-obra.entregas';

/**
 * Lee las entregas guardadas en localStorage.
 *
 * @returns {{ tipo: 'ausencia' } | { tipo: 'ok', entregas: object[] } | { tipo: 'fallo-lectura' }}
 */
export function leer() {
  let almacen;
  try {
    // Acceder a window.localStorage puede lanzar SecurityError en ciertos orígenes.
    almacen = window.localStorage;
  } catch {
    return { tipo: 'fallo-lectura' };
  }

  let valor;
  try {
    valor = almacen.getItem(CLAVE);
  } catch {
    return { tipo: 'fallo-lectura' };
  }

  if (valor === null) {
    return { tipo: 'ausencia' };
  }

  let datos;
  try {
    datos = JSON.parse(valor);
  } catch {
    return { tipo: 'fallo-lectura' };
  }

  if (!Array.isArray(datos)) {
    return { tipo: 'fallo-lectura' };
  }

  return { tipo: 'ok', entregas: datos };
}

/**
 * Guarda la lista de entregas en localStorage.
 * Si la escritura falla, el valor anterior permanece sin cambios.
 *
 * @param {object[]} entregas
 * @returns {{ tipo: 'ok' } | { tipo: 'fallo-escritura' }}
 */
export function guardar(entregas) {
  let almacen;
  try {
    almacen = window.localStorage;
  } catch {
    return { tipo: 'fallo-escritura' };
  }

  try {
    almacen.setItem(CLAVE, JSON.stringify(entregas));
  } catch {
    // setItem puede lanzar QuotaExceededError u otros errores del navegador.
    // El valor anterior sigue sin tocar.
    return { tipo: 'fallo-escritura' };
  }

  return { tipo: 'ok' };
}
