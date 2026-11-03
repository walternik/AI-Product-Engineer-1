# Plan de implementación

- [x] 1. Escribir las pruebas y la validación de una entrega
  - Crear `src/utils/validarEntrega.js` y `src/utils/validarEntrega.test.js`.
  - Reutilizar `esFechaReal` y `estadoDeLote`. La fecha de referencia entra por parámetro.
  - Rechazar familia vacía, cantidad cero, negativa o mayor que la disponible, decimales en unidades, más de tres decimales en kilogramos o litros, lote vencido y fecha futura.
  - Aceptar un lote que vence hoy y una fecha vacía. No escribir almacenamiento desde esta función.
  - _Requirements: 1.3, 1.4, 1.5, 1.6_

- [x] 2. Escribir las pruebas y las funciones que calculan el stock y el historial
  - Crear `src/utils/aplicarEntrega.js`, `src/utils/aplicarAnulacion.js` y sus pruebas.
  - Descontar una entrega parcial conservando id, unidad y fechas del lote.
  - Quitar el lote del stock cuando la cantidad entregada lo deja en cero, y copiar en la entrega nombre, unidad, recepción y vencimiento.
  - Redondear sumas y restas a tres decimales y comprobar que el lote no queda negativo.
  - Al anular, sumar la cantidad si el lote sigue con la misma unidad. Si el lote no está, recrearlo con el id y las fechas copiadas. Si la unidad cambió, no modificar las listas.
  - Ordenar el resultado del historial por fecha de entrega descendente y, en la misma fecha, por `secuencia` ascendente.
  - _Requirements: 1.2, 1.7, 1.8, 2.2, 2.4, 3.2, 3.3_

- [x] 3. Implementar la persistencia de entregas
  - [x] 3.1 Escribir las pruebas y el acceso a la clave de entregas
    - Crear `src/services/almacenamientoEntregas.js` y `src/services/almacenamientoEntregas.test.js`, con un `localStorage` simulado.
    - Leer y escribir solo `manos-a-la-obra.entregas`. No modificar `src/services/almacenamientoLocal.js`.
    - Devolver ausencia cuando la clave no existe, fallo de lectura cuando el valor no es una lista y fallo de escritura cuando `setItem` lanza, sin cambiar el valor anterior.
    - _Requirements: 4.1, 4.3, 4.5_
  - [x] 3.2 Escribir las pruebas y el servicio de entregas
    - Crear `src/services/entregas.js` y `src/services/entregas.test.js`.
    - `obtenerEntregas` devuelve una lista vacía si la clave no existe y no escribe una semilla.
    - `registrarEntrega` valida, completa la fecha vacía con el día local, asigna `id` y `secuencia`, y escribe primero las entregas y después los lotes.
    - Si la lectura de entregas falla o la segunda escritura falla, restaurar la clave que haya cambiado y dejar lotes y entregas como estaban.
    - `anularEntrega` quita la entrega y actualiza o recrea el lote. Si el id no existe, no escribe.
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.7, 1.8, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4_

- [x] 4. Implementar el formulario de entrega
  - Crear `src/components/FormularioEntrega.jsx` y su prueba.
  - Mostrar los lotes con cantidad mayor que cero, ordenados por vencimiento ascendente, con nombre, cantidad, unidad y `EtiquetaEstado`.
  - Deshabilitar los lotes vencidos y mostrar que no se entrega alimento vencido.
  - Pedir familia, cantidad y fecha. La fecha puede quedar vacía.
  - Al enviar datos inválidos, mostrar el mensaje junto al campo y no llamar al guardado.
  - _Requirements: 1.1, 1.3, 1.4, 1.5, 1.6, 5.1, 5.2_

- [x] 5. Implementar el historial y la confirmación de anulación
  - Crear `src/components/HistorialEntregas.jsx` y su prueba.
  - Listar fecha, familia, alimento, cantidad, unidad y vencimiento del lote, en el orden definido por el diseño.
  - Si no hay entregas, mostrar el estado vacío que explica cómo registrar la primera.
  - Reutilizar `DialogoConfirmar`. Cancelar no llama a la anulación. Confirmar sí la llama.
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.4, 5.1_

- [x] 6. Armar la pantalla de entregas
  - Crear `src/pages/EntregasPage.jsx`.
  - Colocar el formulario arriba y el historial abajo, con botones grandes y textos breves, reutilizando los componentes de las tareas 4 y 5.
  - Después de una entrega válida, el historial de esa misma pantalla muestra la fila nueva.
  - _Requirements: 1.2, 2.1, 5.1, 5.2_

- [x] 7. Conectar entregas con el stock y la navegación
  - Agregar `reemplazarLotes(lotes)` a `src/hooks/useLotes.js`, sin volver a sembrar datos.
  - Crear `src/hooks/useEntregas.js` para cargar el historial y exponer `registrar` y `anular`.
  - Agregar el destino `entregas` en `src/components/Navegacion.jsx`, con ícono, etiqueta «Entregas» y estado activo con texto.
  - Integrar la pantalla en `src/App.jsx`. Al registrar o anular con éxito, actualizar las entregas y reemplazar los lotes en memoria. Un fallo de lectura o escritura muestra `AvisoError` y conserva las listas anteriores.
  - Dejar Stock, Vencimientos y Registrar como están.
  - _Requirements: 1.2, 3.2, 3.3, 4.1, 4.3, 4.4, 5.3_
