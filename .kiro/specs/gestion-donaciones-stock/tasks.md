# Plan de implementación

- [x] 1. Preparar el proyecto y la base visual
  - Crear en la raíz del repositorio la SPA con Vite, React y JavaScript, sin TypeScript.
  - Agregar Tailwind con el plugin de Vite, Vitest y el script de pruebas. El entorno por defecto de Vitest queda en Node.
  - Crear `src/components/`, `src/pages/`, `src/hooks/`, `src/services/`, `src/utils/`, `src/data/` y `src/assets/`.
  - Definir en el CSS los tokens de color, la tipografía Nunito Sans y el fondo general de la marca.
  - _Requirements: 6.2, 6.4_

- [x] 2. Implementar las reglas de fechas, vencimiento, validación y totales
  - [x] 2.1 Escribir las pruebas y las funciones de fecha local
    - Crear `src/utils/fechas.js` y `src/utils/fechas.test.js`.
    - Implementar el día local en `YYYY-MM-DD`, la suma de días de calendario y la comprobación de una fecha real.
    - Fijar la fecha desde los tests. No usar `toISOString()` ni `new Date("YYYY-MM-DD")`.
    - _Requirements: 1.3, 3.1, 3.2, 3.3_
  - [x] 2.2 Escribir las pruebas y el cálculo de estado de vencimiento
    - Crear `src/utils/vencimiento.js` y `src/utils/vencimiento.test.js`.
    - Clasificar con la constante de 7 días: anterior a hoy vencido, hoy y hasta hoy más 7 próximo a vencer, posterior en buen estado.
    - _Requirements: 3.1, 3.2, 3.3_
  - [x] 2.3 Escribir las pruebas y la validación de un lote
    - Crear `src/utils/validarLote.js` y `src/utils/validarLote.test.js`.
    - Aplicar las reglas de nombre, cantidad, unidad y fechas del diseño, y devolver un mensaje en español por campo inválido.
    - Comprobar que una entrada inválida no produce un lote utilizable.
    - _Requirements: 1.4, 1.5, 1.6, 4.2_
  - [x] 2.4 Escribir las pruebas de orden y de totales
    - Crear `src/utils/ordenarLotes.js`, `src/utils/agruparTotales.js` y sus pruebas.
    - Ordenar por vencimiento ascendente y, en empate, por nombre.
    - Sumar solo los lotes con el mismo nombre exacto y la misma unidad, sin fusionar el detalle.
    - _Requirements: 2.2, 2.3, 2.5, 3.7_

- [x] 3. Implementar la persistencia y el servicio de lotes
  - [x] 3.1 Escribir las pruebas y el acceso a localStorage
    - Crear `src/services/almacenamientoLocal.js` y `src/services/almacenamientoLocal.test.js`, con un `localStorage` simulado.
    - Leer y escribir solo la clave `manos-a-la-obra.lotes`.
    - Devolver ausencia cuando la clave no existe, fallo de lectura cuando el valor no es una lista de lotes o el almacenamiento no está disponible, y fallo de escritura cuando `setItem` lanza.
    - Comprobar que un fallo no modifica el valor ya guardado. No agregar ninguna llamada de red.
    - _Requirements: 5.1, 5.4, 5.5, 5.6_
  - [x] 3.2 Escribir las pruebas, la semilla y el servicio de lotes
    - Crear `src/data/lotesDeDemostracion.js`, `src/services/lotes.js` y `src/services/lotes.test.js`.
    - Generar la semilla con fechas relativas a un día recibido por parámetro, incluyendo lotes en buen estado, próximos a vencer y vencidos, y dos lotes del mismo alimento y unidad.
    - Sembrar y guardar solo si la clave no existe. Conservar una lista vacía ya guardada.
    - Implementar alta, corrección y baja sobre la lista completa. La alta asigna `id` y completa la recepción vacía con el día local.
    - Rechazar datos inválidos sin escribir. Si la escritura falla, conservar la lista anterior.
    - _Requirements: 1.2, 1.3, 4.1, 4.2, 4.4, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 4. Construir los componentes compartidos de la interfaz
  - [x] 4.1 Crear marca, botones, estado, vacío y aviso
    - Agregar React Testing Library y `jsdom`, y usar ese entorno solo en las pruebas de componentes.
    - Crear el SVG de la mano con el corazón en `src/assets/` y los componentes `Marca`, `Boton`, `EtiquetaEstado`, `EstadoVacio` y `AvisoError`.
    - Mostrar el título «Manos a la Obra» y el subtítulo «banco de alimentos comunitario» en versalitas.
    - La etiqueta de estado incluye siempre el texto del estado. El botón destructivo se distingue del principal y del secundario.
    - Probar que la etiqueta renderiza su texto y que los avisos de lectura y escritura usan el mensaje en español del diseño.
    - _Requirements: 3.6, 5.4, 5.5, 6.1, 6.3, 6.4, 6.5_
  - [x] 4.2 Crear la navegación entre las tres secciones
    - Crear `Navegacion` con Stock, Vencimientos y Registrar, cada destino con texto además de su ícono.
    - Marcar la sección activa y probar que el control activo corresponde a la vista recibida.
    - _Requirements: 6.1, 6.6_

- [x] 5. Implementar el formulario de alta y corrección
  - Crear `src/components/FormularioDonacion.jsx` y su prueba.
  - Mostrar nombre, cantidad, unidad y fecha de vencimiento como obligatorios, y la fecha de recepción como opcional en el alta.
  - Ofrecer solo kilogramos, litros y unidades.
  - Al enviar datos inválidos, mostrar el mensaje junto al campo y no llamar al guardado.
  - En corrección, precargar el lote, incluida la fecha de recepción, y volver a validar antes de actualizar.
  - _Requirements: 1.1, 1.3, 1.4, 1.5, 1.6, 4.1, 4.2, 6.1_

- [x] 6. Implementar el listado de lotes y el resumen de stock
  - Crear `ListadoLotes` y `ResumenStock`.
  - Mostrar en cada lote nombre, cantidad, unidad, recepción, vencimiento y etiqueta de estado, incluidos los vencidos.
  - Mantener lotes iguales en filas separadas y mostrar el total agrupado sin ocultar ese detalle.
  - En anchos estrechos, reemplazar la tabla por fichas con los mismos datos y acciones.
  - _Requirements: 2.1, 2.2, 2.5, 3.6, 3.7, 6.1, 6.2_

- [x] 7. Implementar la confirmación de eliminación
  - Crear `DialogoConfirmar` y su prueba.
  - Pedir confirmación antes de borrar. Cancelar cierra el diálogo y no llama a la eliminación. Confirmar sí la llama.
  - Usar la acción destructiva para confirmar y una acción secundaria para cancelar.
  - _Requirements: 4.3, 4.5, 6.1, 6.5_

- [x] 8. Armar las tres pantallas con los componentes ya creados
  - Crear `src/pages/StockPage.jsx`, `src/pages/VencimientosPage.jsx` y `src/pages/DonacionFormPage.jsx`.
  - Stock muestra el resumen, el listado ordenado y el estado vacío que explica cómo registrar el primer alimento.
  - Vencimientos separa próximos a vencer y vencidos, cada grupo ordenado, con su propio mensaje vacío.
  - La pantalla del formulario usa `FormularioDonacion` para el alta y para la corrección.
  - _Requirements: 1.1, 2.1, 2.3, 2.4, 3.4, 3.5, 3.7, 4.1, 6.1, 6.2_

- [x] 9. Conectar el estado de la aplicación y las tres pantallas
  - Crear `src/hooks/useLotes.js` para cargar los lotes al iniciar y exponer alta, corrección, baja y el error de lectura o escritura.
  - Integrar en `src/App.jsx` la marca, la navegación, el aviso, las tres pantallas y el diálogo. La vista inicial es Stock y no usa router.
  - Después de guardar un alta o una corrección válida, volver a Stock con la lista ya actualizada. Una validación fallida permanece en el formulario.
  - Abrir la corrección desde Stock y desde Vencimientos. Eliminar solo después de confirmar, y quitar el lote de ambas vistas.
  - Si la lectura o la escritura fallan, mostrar el aviso y conservar el comportamiento definido en el diseño.
  - _Requirements: 1.2, 4.1, 4.3, 4.4, 4.5, 5.1, 5.4, 5.5, 6.2, 6.6_
