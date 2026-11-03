---
inclusion: always
---

# Banco de Alimentos Comunitario

## Descripción

Aplicación web destinada a facilitar la organización de un banco de alimentos comunitario.

Su objetivo es reducir el desperdicio de alimentos y mejorar la distribución de las donaciones entre familias beneficiarias.

## Perfil de cliente ideal

El cliente ideal es un banco de alimentos barrial, con una sola sede y sin presupuesto para software ni personal de sistemas.

- Atiende unas 40 familias.
- Abre dos jornadas por semana.
- Tiene un computador o una tablet compartidos en la mesa de recepción.
- Los voluntarios rotan y nadie administra un servidor.

## Personas

### Lucía, voluntaria de turno

Lucía tiene 58 años y anota las entregas en la jornada. Usa la tablet de la sede mientras la familia espera, y tiene poca experiencia con computadoras. Es quien usa la herramienta todos los días de atención. Necesita un formulario corto, botones grandes y mensajes claros.

### Jorge, coordinador

Jorge tiene 45 años y organiza el banco. No atiende el mostrador en cada entrega. Revisa los vencimientos antes de la jornada y, al cierre, quiere ver qué alimentos salieron y a qué familia. Usa la herramienta unas pocas veces por semana.

## Necesidades del usuario

- Registrar las donaciones recibidas.
- Conocer las cantidades de alimentos disponibles.
- Identificar los alimentos próximos a vencer.
- Organizar las entregas a las familias.
- Evitar desperdicios y mejorar la distribución.

## Objetivos del producto

- Simplificar las tareas administrativas.
- Reducir el desperdicio de alimentos.
- Facilitar el trabajo de los voluntarios.
- Mejorar la organización y transparencia de las donaciones.

## Alcance de esta etapa

Ya está implementada la gestión de donaciones y el control de stock por vencimiento, según `.kiro/specs/gestion-donaciones-stock/`.

Esta etapa implementa exclusivamente el feature:

**Registro de entregas.**

Debe permitir elegir un lote disponible, anotar la familia y la cantidad entregada, descontar esa cantidad del stock y consultar lo entregado en la jornada.

La implementación debe ajustarse a la especificación de `.kiro/specs/registro-entregas/`.

El padrón de familias y la distribución equitativa quedan fuera de esta etapa. El destinatario se anota como un nombre libre.

## Principios de experiencia de usuario

- Interfaz completamente en español.
- Navegación sencilla e intuitiva.
- Botones grandes y fácilmente identificables.
- Textos claros y breves.
- Formularios con pocos pasos.
- Diseño responsive, priorizando tablets y computadoras.
- Priorizar claridad y facilidad de uso por encima de elementos decorativos.
- Se debe utilizar la skill de diseño de marca ubicada en: .kiro/skills/brand-design/SKILL.md