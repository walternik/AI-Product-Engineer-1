# Requirements Document

## Introduction

Manos a la Obra es una aplicación web para un banco de alimentos comunitario. En esta etapa solo cubre la gestión de donaciones y el control de stock por vencimiento.

Jorge y el resto de voluntarios usan la misma interfaz. No hay cuentas ni roles: la aplicación no distingue permisos entre coordinador y colaboradores temporales.

Un voluntario puede registrar cada donación recibida, consultar los alimentos disponibles y ver cuáles están próximos a vencer o ya vencidos. Cada donación se guarda como un lote propio, con su cantidad y su fecha de vencimiento, para no mezclar productos iguales que vencen en fechas distintas.

La aplicación es una SPA en español, sin backend. Los datos viven en el navegador del dispositivo donde se usa. No hay sincronización entre voluntarios, navegadores ni dispositivos.

Quedan fuera de esta etapa la gestión de familias, las entregas y la distribución equitativa.

## Requirements

### Requirement 1

**User Story:** Como voluntario, quiero registrar una donación recibida, para que el stock disponible refleje los alimentos que entraron al banco.

#### Acceptance Criteria

1. WHEN el voluntario abre el formulario de registro THEN el sistema SHALL mostrar los campos nombre del alimento, cantidad, unidad y fecha de vencimiento, e indicar cuáles son obligatorios.
2. WHEN el voluntario envía el formulario con nombre no vacío, cantidad mayor que cero, una unidad válida y una fecha de vencimiento THEN el sistema SHALL guardar la donación como un lote independiente y mostrarla en el stock disponible.
3. WHEN el voluntario no indica una fecha de recepción THEN el sistema SHALL usar la fecha del día como fecha de recepción.
4. IF el nombre está vacío, la cantidad es cero o negativa, la unidad no es válida o falta la fecha de vencimiento THEN el sistema SHALL rechazar el registro y mostrar un mensaje claro en español junto al dato incorrecto, sin guardar la donación.
5. IF el voluntario indica una cantidad con decimales THEN el sistema SHALL aceptarla cuando la unidad sea kilogramos o litros.
6. WHEN el voluntario elige la unidad THEN el sistema SHALL ofrecer únicamente kilogramos, litros y unidades.

### Requirement 2

**User Story:** Como voluntario, quiero ver los alimentos disponibles, para saber qué hay en el banco antes de organizar una entrega.

#### Acceptance Criteria

1. WHEN el voluntario abre la vista de stock THEN el sistema SHALL listar cada lote con nombre del alimento, cantidad, unidad, fecha de recepción, fecha de vencimiento y estado de vencimiento.
2. WHEN existen varios lotes del mismo alimento THEN el sistema SHALL mostrarlos por separado, cada uno con su propia cantidad y fecha de vencimiento.
3. WHEN el voluntario consulta el stock THEN el sistema SHALL ordenar los lotes por fecha de vencimiento ascendente, de modo que lo que vence antes aparezca primero.
4. IF no hay donaciones guardadas THEN el sistema SHALL mostrar un estado vacío en español que explique que todavía no hay alimentos registrados y cómo registrar el primero.
5. WHEN el voluntario consulta el stock THEN el sistema SHALL mostrar también el total disponible agrupado por nombre de alimento y unidad, sin ocultar el detalle de cada lote.

### Requirement 3

**User Story:** Como voluntario, quiero identificar los alimentos próximos a vencer y los vencidos, para priorizar su uso y reducir el desperdicio.

#### Acceptance Criteria

1. WHEN la fecha de vencimiento de un lote es anterior al día actual THEN el sistema SHALL marcarlo como vencido.
2. WHEN la fecha de vencimiento de un lote es el día actual o está dentro de los 7 días siguientes THEN el sistema SHALL marcarlo como próximo a vencer.
3. WHEN la fecha de vencimiento de un lote es posterior a los 7 días siguientes THEN el sistema SHALL marcarlo como en buen estado.
4. WHEN el voluntario abre la vista de vencimientos THEN el sistema SHALL mostrar por separado los lotes próximos a vencer y los lotes vencidos, cada grupo ordenado por fecha de vencimiento ascendente.
5. IF un grupo no tiene lotes THEN el sistema SHALL mostrar un mensaje vacío en español para ese grupo.
6. WHEN el sistema muestra el estado de un lote THEN el sistema SHALL acompañar el color con una etiqueta de texto, de modo que el estado no dependa solo del color.
7. WHEN un lote está vencido THEN el sistema SHALL seguir mostrándolo en el stock y en la vista de vencimientos hasta que el voluntario lo elimine.

### Requirement 4

**User Story:** Como voluntario, quiero corregir o eliminar una donación registrada, para mantener el stock fiel a lo que realmente hay en el banco.

#### Acceptance Criteria

1. WHEN el voluntario guarda cambios válidos de un lote THEN el sistema SHALL actualizar nombre, cantidad, unidad, fecha de recepción y fecha de vencimiento, y reflejar el cambio en el stock y en la vista de vencimientos.
2. IF el voluntario guarda cambios con datos inválidos THEN el sistema SHALL rechazar la actualización, conservar el lote anterior y mostrar el mismo tipo de mensajes que en el registro.
3. WHEN el voluntario pide eliminar un lote THEN el sistema SHALL pedir confirmación antes de borrarlo.
4. WHEN el voluntario confirma la eliminación THEN el sistema SHALL quitar ese lote del almacenamiento y de las vistas.
5. IF el voluntario cancela la eliminación THEN el sistema SHALL conservar el lote sin cambios.

### Requirement 5

**User Story:** Como voluntario, quiero que los datos sigan disponibles al recargar el navegador, para no volver a cargar las donaciones en cada visita.

#### Acceptance Criteria

1. WHEN el voluntario registra, edita o elimina un lote THEN el sistema SHALL persistir el resultado en el navegador y mostrarlo igual después de recargar la página.
2. WHEN la aplicación inicia y no hay datos guardados THEN el sistema SHALL cargar datos de demostración con lotes en buen estado, próximos a vencer y vencidos.
3. IF ya existen datos guardados THEN el sistema SHALL cargarlos y SHALL NOT reemplazarlos por los datos de demostración.
4. IF la lectura de los datos guardados falla THEN el sistema SHALL mostrar un mensaje de error en español y SHALL NOT sobrescribir el almacenamiento con datos de demostración.
5. IF la escritura de los datos falla THEN el sistema SHALL mostrar un mensaje de error en español e informar que el cambio no quedó guardado.
6. WHEN el voluntario abre la aplicación en otro navegador o en otro dispositivo THEN el sistema SHALL NOT mostrar los lotes guardados en el navegador de origen.

### Requirement 6

**User Story:** Como voluntario con poca experiencia técnica, quiero una interfaz clara y en español, para registrar y consultar donaciones sin perder tiempo en la herramienta.

#### Acceptance Criteria

1. WHEN el voluntario usa cualquier pantalla de esta etapa THEN el sistema SHALL mostrar la interfaz completamente en español, con textos breves y etiquetas comprensibles.
2. WHEN el voluntario usa la aplicación en una tablet o en una computadora THEN el sistema SHALL presentar una disposición adaptable, con botones grandes, formularios de pocos campos y listados legibles.
3. WHEN el voluntario ve la cabecera THEN el sistema SHALL mostrar la marca «Manos a la Obra» con esa capitalización y el subtítulo «banco de alimentos comunitario».
4. WHEN el voluntario recorre la aplicación THEN el sistema SHALL usar el fondo amarillo suave, superficies de contenido en blanco cálido, acciones principales en verde hoja y la identidad visual definida para la marca.
5. WHEN una acción es destructiva THEN el sistema SHALL presentarla de forma distinguible de las acciones principales y secundarias.
6. WHEN el voluntario navega entre stock, vencimientos y registro THEN el sistema SHALL indicar cuál es la sección activa y acompañar los íconos de navegación con texto.
