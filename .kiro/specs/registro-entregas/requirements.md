# Requirements Document

## Introduction

Esta etapa agrega el registro de entregas a Manos a la Obra. Lucía anota cada salida en la tablet de la sede mientras la familia espera. Jorge revisa, al cierre de la jornada, qué alimentos salieron.

Una entrega descuenta cantidad de un lote que ya existe. No crea alimentos ni modifica la fecha de vencimiento. El destinatario es un nombre libre: no hay padrón de familias ni reparto equitativo.

La aplicación sigue siendo una SPA en español, sin backend. Donaciones y entregas viven en el navegador de ese dispositivo.

## Requirements

### Requirement 1

**User Story:** Como voluntaria de turno, quiero registrar una entrega contra un lote disponible, para que el stock baje en el momento en que la familia se lleva la comida.

#### Acceptance Criteria

1. WHEN Lucía abre el registro de entrega THEN el sistema SHALL mostrar los lotes con cantidad disponible mayor que cero, ordenados por fecha de vencimiento ascendente, con nombre, cantidad, unidad y estado.
2. WHEN Lucía elige un lote, indica una familia, una cantidad válida y confirma THEN el sistema SHALL guardar la entrega y descontar esa cantidad del lote elegido.
3. WHEN Lucía no indica una fecha THEN el sistema SHALL usar la fecha del día como fecha de la entrega.
4. IF el lote está vencido THEN el sistema SHALL impedir elegirlo y explicar en español que no se entrega alimento vencido.
5. IF la familia está vacía, la cantidad es cero o negativa, o la cantidad supera lo disponible del lote THEN el sistema SHALL rechazar la entrega, mostrar el mensaje junto al dato incorrecto y no modificar el stock.
6. IF la unidad del lote es unidades THEN el sistema SHALL aceptar solo cantidades enteras. IF la unidad es kilogramos o litros THEN el sistema SHALL aceptar hasta tres decimales.
7. WHEN la cantidad entregada es igual a la disponible THEN el sistema SHALL dejar ese lote fuera del stock disponible.
8. WHEN la cantidad entregada es menor que la disponible THEN el sistema SHALL conservar el lote con la cantidad restante, la misma unidad y las mismas fechas.

### Requirement 2

**User Story:** Como coordinador, quiero ver las entregas de la jornada, para saber qué salió y a qué familia sin revisar el stock lote por lote.

#### Acceptance Criteria

1. WHEN Jorge abre el historial THEN el sistema SHALL listar cada entrega con fecha, familia, nombre del alimento, cantidad, unidad y fecha de vencimiento del lote.
2. WHEN el historial se muestra THEN el sistema SHALL ordenar las entregas por fecha descendente y, en la misma fecha, por el orden en que se registraron.
3. IF no hay entregas guardadas THEN el sistema SHALL mostrar un estado vacío en español que explique cómo registrar la primera.
4. WHEN una entrega dejó un lote en cero THEN el sistema SHALL conservar en el historial el nombre, la unidad y la fecha de vencimiento de ese lote.

### Requirement 3

**User Story:** Como voluntaria de turno, quiero anular una entrega registrada por error, para devolver esa cantidad al stock.

#### Acceptance Criteria

1. WHEN Lucía pide anular una entrega THEN el sistema SHALL pedir confirmación antes de hacerlo.
2. WHEN Lucía confirma la anulación y el lote sigue existiendo THEN el sistema SHALL sumar la cantidad entregada a ese lote y quitar la entrega del historial.
3. WHEN Lucía confirma la anulación y el lote ya no está en el stock THEN el sistema SHALL volver a crear ese lote con la cantidad anulada, la unidad y las fechas originales, y quitar la entrega del historial.
4. IF Lucía cancela la confirmación THEN el sistema SHALL conservar la entrega y el stock sin cambios.

### Requirement 4

**User Story:** Como voluntaria de turno, quiero que las entregas sigan disponibles al recargar el navegador, para no perder lo anotado durante la jornada.

#### Acceptance Criteria

1. WHEN Lucía registra o anula una entrega THEN el sistema SHALL guardar el resultado en el navegador y mostrarlo igual después de recargar la página.
2. WHEN la aplicación inicia y no hay entregas guardadas THEN el sistema SHALL mostrar el historial vacío y SHALL NOT inventar entregas de demostración.
3. IF la lectura de las entregas falla THEN el sistema SHALL mostrar un mensaje de error en español y SHALL NOT modificar los lotes ni reemplazar el historial.
4. IF la escritura falla THEN el sistema SHALL mostrar un mensaje de error en español y conservar el stock y el historial anteriores.
5. WHEN alguien abre la aplicación en otro navegador o en otro dispositivo THEN el sistema SHALL NOT mostrar las entregas guardadas en el navegador de origen.

### Requirement 5

**User Story:** Como voluntaria con poca experiencia técnica, quiero anotar la entrega en pocos pasos y en español, para terminar antes de que la familia se vaya.

#### Acceptance Criteria

1. WHEN Lucía usa el registro o el historial THEN el sistema SHALL mostrar la interfaz en español, con textos breves y el mismo criterio visual de Manos a la Obra.
2. WHEN Lucía usa la tablet de la sede THEN el sistema SHALL mostrar botones grandes, un formulario corto y listados legibles.
3. WHEN Lucía navega entre stock, vencimientos, donaciones y entregas THEN el sistema SHALL indicar la sección activa con texto, no solo con un ícono.

## Métricas de éxito

1. Lucía completa una entrega válida en menos de un minuto, desde que abre la pantalla hasta que ve la entrega en el historial.
2. El 100 % de las entregas confirmadas descuenta la cantidad del lote elegido y ninguna deja el stock de ese lote en negativo.
3. Al elegir un lote, el que vence antes aparece primero, para que la comida próxima a vencer salga antes que la que todavía está en buen estado.
4. Al cierre de la jornada, Jorge ve en el historial la familia, el alimento, la cantidad y la fecha de cada entrega registrada ese día.
5. El 100 % de los intentos de entregar un lote vencido quedan rechazados, con el stock igual que antes del intento.
