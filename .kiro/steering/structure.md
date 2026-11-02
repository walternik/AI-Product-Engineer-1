---
inclusion: always
---

# Organización del proyecto

## Estructura general

Organizar el código dentro de src utilizando las siguientes carpetas:

- components/: componentes visuales reutilizables.
- pages/: pantallas principales.
- hooks/: hooks personalizados de React.
- services/: persistencia y acceso a datos.
- utils/: funciones auxiliares y reglas de negocio.
- data/: datos iniciales de demostración.
- assets/: imágenes, iconos y recursos visuales.

## Responsabilidades

### Components
Contienen elementos reutilizables como botones, formularios, tarjetas, tablas y ventanas de confirmación.

### Pages
Representan las diferentes vistas de la aplicación.

### Hooks
Contienen lógica reutilizable relacionada con React y el estado de la aplicación.

### Services
Centralizan las operaciones CRUD y el acceso a localStorage.

### Utils
Contienen funciones auxiliares, validaciones y cálculos.

### Data
Contiene los datos de ejemplo utilizados para inicializar la aplicación.

### Assets
Contiene los recursos gráficos del proyecto.

## Convenciones

- Utilizar nombres descriptivos.
- Mantener componentes pequeños y enfocados.
- Evitar duplicación de lógica.
- Separar responsabilidades.
- No agregar carpetas o abstracciones innecesarias.
- Seguir una organización consistente en todo el proyecto.

## Principio general

Priorizar una arquitectura simple, comprensible y mantenible.

No introducir complejidad técnica que no esté justificada por los requerimientos del feature actual.