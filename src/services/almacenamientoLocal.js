/**
 * Acceso a localStorage para Manos a la Obra.
 *
 * Clave única: "manos-a-la-obra.lotes"
 *
 * leer() devuelve:
 *   { tipo: 'ausencia' }         — la clave no está en el almacenamiento.
 *   { tipo: 'ok', lotes: [...] } — arreglo JSON válido.
 *   { tipo: 'fallo-lectura' }    — localStorage no disponible, JSON inválido
 *                                  o el valor no es un arreglo.
 *
 * guardar(lotes) devuelve:
 *   { tipo: 'ok' }               — escritura exitosa.
 *   { tipo: 'fallo-escritura' }  — setItem lanzó (QuotaExceededError, etc.).
 *                                  El valor anterior queda intacto.
 *
 * No se hacen llamadas de red.
 */

const CLAVE = 'manos-a-la-obra.lotes';

/**
 * Lee los lotes guardados en localStorage.
 *
 * @returns {{ tipo: 'ausencia' } | { tipo: 'ok', lotes: object[] } | { tipo: 'fallo-lectura' }}
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

  return { tipo: 'ok', lotes: datos };
}

/**
 * Guarda la lista de lotes en localStorage.
 * Si la escritura falla, el valor anterior permanece sin cambios.
 *
 * @param {object[]} lotes
 * @returns {{ tipo: 'ok' } | { tipo: 'fallo-escritura' }}
 */
export function guardar(lotes) {
  let almacen;
  try {
    almacen = window.localStorage;
  } catch {
    return { tipo: 'fallo-escritura' };
  }

  try {
    almacen.setItem(CLAVE, JSON.stringify(lotes));
  } catch {
    // setItem puede lanzar QuotaExceededError u otros errores del navegador.
    // El valor anterior sigue sin tocar.
    return { tipo: 'fallo-escritura' };
  }

  return { tipo: 'ok' };
}
