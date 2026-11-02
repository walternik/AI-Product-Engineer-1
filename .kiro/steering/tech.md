---
inclusion: always
---

# Stack tecnológico

## Tecnologías

- JavaScript.
- React.
- Vite.
- Tailwind CSS.
- localStorage.

## Arquitectura

La aplicación será una SPA (Single Page Application), sin backend.

React gestionará la interfaz y la lógica de interacción.

Vite se utilizará para el desarrollo y la generación del build de producción.

Tailwind CSS se utilizará para los estilos y el diseño responsive.

localStorage será el mecanismo de persistencia de datos en el navegador.

## Persistencia

- Centralizar las operaciones de lectura y escritura de localStorage.
- Implementar operaciones CRUD.
- Mantener los datos después de recargar el navegador.
- Cargar datos de demostración únicamente cuando no existan datos guardados.
- No sobrescribir información existente durante la inicialización.
- Manejar posibles errores de lectura y escritura.

## Reglas técnicas

- No utilizar TypeScript.
- No implementar backend.
- No utilizar bases de datos externas.
- No incorporar servicios de autenticación.
- Evitar dependencias innecesarias.
- Mantener el código modular y reutilizable.
- Validar los datos de entrada.

## Calidad

- Utilizar nombres descriptivos.
- Separar la lógica de negocio de los componentes visuales.
- Evitar duplicación de código.
- Verificar las operaciones principales.
- Mantener compatibilidad con el despliegue en Netlify.

## Limitaciones

Los datos almacenados en localStorage pertenecen al navegador y dispositivo donde se utiliza la aplicación.

No existe sincronización entre diferentes usuarios o dispositivos.

La aplicación tiene fines demostrativos y no debe considerarse un sistema de producción para administrar datos comunitarios compartidos.