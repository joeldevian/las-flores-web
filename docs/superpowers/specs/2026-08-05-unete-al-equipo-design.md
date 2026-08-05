# Diseño: Únete al Equipo

**Fecha:** 2026-08-05  
**Estado:** Aprobado para planificación  
**Alcance:** Cambios únicamente locales; no desplegar ni aplicar migraciones a Supabase remoto.

## Objetivo

Convertir el enlace existente “Únete al Equipo” en una experiencia pública profesional para consultar vacantes y postular, junto con un módulo privado en `/admin` para administrar ofertas y candidatos. La solución debe respetar el branding de Las Flores, proteger los datos personales y encajar en la arquitectura actual de React, TanStack Router, Tailwind y Supabase.

## Alcance aprobado

La primera versión incluirá:

- Página pública `/unete-al-equipo`.
- Publicación y consulta de ofertas laborales.
- Formulario de postulación con CV en PDF.
- Gestión de ofertas exclusivamente por administradores.
- Gestión de candidatos exclusivamente por administradores.
- Indicador de postulaciones nuevas dentro de `/admin`.
- Estados editoriales para ofertas: `draft`, `published`, `paused` y `closed`.
- Estados de candidatos: `new`, `reviewing`, `shortlisted`, `rejected` y `hired`.
- Notificaciones únicamente dentro del panel, sin correo ni WhatsApp.

No se incluyen cuentas de Recursos Humanos, automatizaciones de correo, entrevistas, calendarios, evaluaciones ni integraciones con bolsas de empleo.

## Arquitectura

### Área pública

Se creará la ruta `/unete-al-equipo`. El enlace actual de `src/components/site-footer.tsx` apuntará a esta ruta.

La página contendrá:

1. Hero editorial con fotografía real del equipo y mensaje “Crece con nosotros”.
2. Presentación de la cultura de Las Flores basada en hospitalidad, identidad ayacuchana y excelencia.
3. Listado de ofertas publicadas y vigentes.
4. Estado vacío cuando no existan convocatorias abiertas.
5. Detalle de la oferta seleccionada.
6. Formulario de postulación asociado a una oferta.
7. Confirmación de envío y cierre humano de la experiencia.

La ruta pública solo mostrará ofertas con estado `published` cuya fecha límite sea nula o no haya vencido.

### Área administrativa

Se agregará la pestaña `jobs` al panel `/admin`, visible solo para usuarios con rol `admin`. El módulo vivirá en componentes independientes para no seguir aumentando la responsabilidad de `src/routes/admin.tsx`.

El módulo tendrá dos vistas internas:

- **Ofertas:** métricas, listado, búsqueda, filtros, creación, edición, duplicación, previsualización y cambios de estado.
- **Postulaciones:** contador de nuevas, búsqueda, filtros por oferta, estado y fecha, detalle del candidato, notas internas y acceso temporal al CV.

La vista de ofertas permitirá cerrar una vacante sin eliminar sus postulaciones. El borrado permanente no formará parte del flujo principal; si se incorpora para registros sin postulaciones, requerirá confirmación explícita.

## Diseño visual

### Lenguaje de marca

- Verde eucalipto para estructura, navegación y confianza.
- Crema y piedra para superficies cálidas.
- Chilca como acento en llamadas a la acción.
- Nogal para texto principal y contraste.
- Tipografía serif en títulos editoriales y sans serif en contenido funcional.

La página pública tendrá una apariencia cálida, editorial y humana. El módulo administrativo será más compacto y operativo, pero conservará los colores, tipografía y radios visuales de la marca.

### Página pública

- Hero fotográfico con capa de contraste suficiente.
- Tarjetas de vacantes con cargo, área, ubicación, modalidad, resumen y fecha límite.
- Detalle de oferta en dos columnas en escritorio y una columna en móvil.
- Botón de postulación claramente visible y accesible.
- Formulario dividido en bloques breves, con etiquetas persistentes y errores cercanos al campo.
- Estados de foco visibles, contraste accesible y áreas táctiles adecuadas.

Los filtros por área y modalidad solo se mostrarán cuando aporten valor; no se presentarán controles vacíos o redundantes cuando existan pocas ofertas.

### Panel administrativo

- Encabezado con métricas de publicadas, borradores y postulaciones nuevas.
- Estados identificados por texto, icono o etiqueta además del color.
- Verde para publicada, gris para borrador, ámbar para pausada y nogal tenue para cerrada.
- Tabla en escritorio y tarjetas adaptables en pantallas pequeñas.
- Búsqueda y filtros compactos.
- Formulario amplio para editar ofertas.
- Ficha de candidato con datos, estado, notas y acción para abrir o descargar el CV.
- Mensajes claros de carga, éxito, error y estados vacíos.

## Modelo de datos

### `job_offers`

Campos previstos:

- `id`: UUID, clave primaria.
- `title`: cargo.
- `slug`: identificador público único.
- `department`: área.
- `location`: ubicación.
- `work_mode`: modalidad presencial, híbrida o remota.
- `summary`: resumen para tarjeta.
- `description`: presentación completa.
- `responsibilities`: responsabilidades estructuradas.
- `requirements`: requisitos estructurados.
- `benefits`: beneficios estructurados u opcionales.
- `status`: `draft`, `published`, `paused` o `closed`.
- `application_deadline`: fecha límite opcional.
- `sort_order`: orden configurable.
- `created_at` y `updated_at`.

### `job_applications`

Campos previstos:

- `id`: UUID, clave primaria.
- `job_offer_id`: referencia obligatoria a `job_offers`.
- `full_name`.
- `phone`.
- `email`.
- `city`.
- `experience_summary`.
- `availability`.
- `cv_path`: ruta privada, nunca una URL pública permanente.
- `status`: `new`, `reviewing`, `shortlisted`, `rejected` o `hired`.
- `internal_notes`: solo administradores.
- `privacy_consent`: confirmación de aceptación.
- `created_at` y `updated_at`.

Las postulaciones conservarán una referencia a la oferta y su historial aunque la oferta sea cerrada. No habrá eliminación automática de candidatos en esta versión.

## Almacenamiento y seguridad

Se definirá un bucket privado para CV. Solo se aceptarán archivos PDF dentro del límite establecido en configuración; la propuesta inicial será 5 MB. El acceso administrativo se realizará mediante URLs firmadas de corta duración.

Las políticas locales de Supabase deberán garantizar:

- Lectura pública únicamente de ofertas publicadas y vigentes.
- Inserción pública controlada de postulaciones válidas.
- Sin lectura pública de postulaciones ni CV.
- Lectura y modificación de ofertas y postulaciones solo para perfiles con rol `admin`.
- Acceso administrativo a archivos del bucket privado.

La UI no sustituye las políticas RLS. Toda autorización sensible debe aplicarse en Supabase.

## Flujo de postulación

1. El visitante selecciona una oferta publicada y vigente.
2. Completa nombre, teléfono, correo, ciudad, experiencia, disponibilidad y consentimiento.
3. Adjunta un PDF de hasta 5 MB.
4. El cliente valida los campos y el archivo.
5. Se carga el CV en una ruta privada no predecible.
6. Se crea la postulación con estado `new`.
7. Si falla la creación después de cargar el archivo, se intenta eliminar el archivo huérfano.
8. La interfaz muestra confirmación y bloquea envíos duplicados durante el procesamiento.

## Gestión administrativa

### Ofertas

El formulario permitirá editar todos los campos del modelo, guardar como borrador y cambiar el estado. La fecha límite será opcional. El orden se resolverá por `sort_order` y, como desempate, por fecha de creación.

Duplicar una oferta creará un nuevo registro en estado `draft`, con un slug nuevo y sin copiar postulaciones.

### Postulaciones

El listado comenzará mostrando las más recientes. Los filtros serán combinables y el contador de nuevas se calculará a partir del estado `new`.

El administrador podrá:

- Consultar los datos enviados.
- Abrir o descargar el CV mediante una URL temporal.
- Cambiar el estado del proceso.
- Añadir o editar notas internas.

Los cambios mostrarán progreso, confirmación y error. Si se usa una actualización optimista, la interfaz revertirá el valor cuando Supabase falle.

## Validación y errores

- Todos los campos del formulario público serán obligatorios salvo que la interfaz indique expresamente lo contrario.
- El correo tendrá validación de formato y el teléfono una validación tolerante para números peruanos e internacionales.
- El CV deberá ser PDF y no superar 5 MB.
- No se creará una postulación cuando falle la carga del CV.
- Los mensajes públicos no expondrán tablas, políticas, rutas privadas ni errores internos.
- Las acciones destructivas o irreversibles requerirán confirmación.
- Las ofertas que se cierren mientras un visitante completa el formulario serán rechazadas al guardar y mostrarán un mensaje para volver al listado.

## Componentes previstos

Las responsabilidades se separarán en unidades enfocadas:

- Ruta pública de empleos.
- Hero y sección cultural.
- Listado y tarjeta de oferta.
- Detalle de oferta.
- Formulario de postulación.
- Sección administrativa de empleos.
- Listado y formulario de ofertas.
- Listado y detalle de postulaciones.
- Tipos, validadores y capa de acceso a datos.

Los nombres y ubicaciones exactos se definirán en el plan de implementación siguiendo las convenciones actuales del repositorio.

## Pruebas y verificación

Se cubrirán, como mínimo:

- Visibilidad según estado y fecha límite.
- Orden de ofertas.
- Validación de campos y CV.
- Rechazo de tipos y tamaños de archivo no permitidos.
- Prevención de doble envío mientras una solicitud está en curso.
- Limpieza del CV cuando falle la creación de la postulación.
- Filtros y contador de nuevas en administración.
- Transiciones de estado de ofertas y candidatos.
- Estados vacíos, de carga y de error.
- Acceso administrativo al CV mediante URL firmada.
- Visualización responsive de las vistas pública y administrativa.
- Pruebas existentes, lint y compilación del proyecto.

## Restricciones de ejecución

Todo el trabajo se realizará en local. Se pueden crear archivos SQL o migraciones versionadas para revisión, pero no se ejecutarán contra un proyecto remoto de Supabase. No se desplegará a Vercel, no se publicarán assets y no se modificarán servicios externos.
