# Únete al Equipo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Crear una página pública de vacantes y un módulo privado en `/admin` para publicar ofertas, recibir postulaciones con CV y gestionar candidatos.

**Architecture:** Mantener `/admin` como contenedor de autorización y navegación, delegando empleos a componentes enfocados. Centralizar tipos, reglas puras y operaciones Supabase en `src/features/jobs`, usar un bucket privado para CV y exponer al público únicamente ofertas publicadas y vigentes.

**Tech Stack:** React 19, TypeScript 5.8, TanStack Router, Tailwind CSS 4, Supabase JS 2, Lucide React y Vitest.

## Global Constraints

- Todo el trabajo debe permanecer local: no desplegar a Vercel ni ejecutar SQL contra Supabase remoto.
- Reutilizar la paleta existente `eucalipto`, `cream`, `piedra`, `chilca` y `nogal`; no añadir otra librería visual.
- Solo los perfiles con rol `admin` pueden leer o modificar postulaciones y administrar ofertas.
- Los CV deben ser PDF de máximo 5 MB y permanecer en el bucket privado `job-cvs`.
- No añadir correo, WhatsApp, calendario, entrevistas, evaluaciones, cuentas de RR. HH. ni bolsas de empleo.
- Conservar intactos los archivos locales no relacionados: `public/inicio/videoweb.mov`, `public/retablo/` y `scratch_scrape/`.

---

## File Structure

### Create

- `supabase/jobs.sql`: tablas, índices, triggers, RLS, bucket privado y políticas de Storage para empleos.
- `src/features/jobs/types.ts`: tipos, estados, etiquetas y payloads compartidos.
- `src/features/jobs/rules.ts`: reglas puras para vigencia, orden, validación y rutas de CV.
- `src/features/jobs/api.ts`: única capa de operaciones Supabase para ofertas, postulaciones y CV.
- `src/features/jobs/components/JobCard.tsx`: tarjeta pública accesible.
- `src/features/jobs/components/JobApplicationForm.tsx`: captura y envío de postulaciones.
- `src/features/jobs/components/AdminJobOfferForm.tsx`: creación/edición/duplicación de ofertas.
- `src/features/jobs/components/AdminJobApplications.tsx`: filtros, listado y detalle de candidatos.
- `src/features/jobs/components/AdminJobsSection.tsx`: orquestador de las vistas Ofertas/Postulaciones.
- `src/routes/unete-al-equipo.tsx`: composición pública, carga de ofertas, detalle y estados de UI.
- `src/tests/jobRules.test.ts`: pruebas de reglas y validación.
- `src/tests/jobApi.test.ts`: pruebas de la secuencia de postulación y limpieza del archivo.

### Modify

- `src/routes/admin.tsx`: añadir pestaña, carga realtime, contador y render del módulo.
- `src/components/site-footer.tsx`: enlazar “Únete al Equipo” con la ruta pública.

No modificar `src/routeTree.gen.ts` manualmente; TanStack Router/Vite lo regenerará al ejecutar build.

---

### Task 1: Contrato de dominio y reglas puras

**Files:**
- Create: `src/features/jobs/types.ts`
- Create: `src/features/jobs/rules.ts`
- Create: `src/tests/jobRules.test.ts`

**Interfaces:**
- Produces: `JobOffer`, `JobApplication`, `JobOfferInput`, `JobApplicationInput`, `JobOfferStatus`, `JobApplicationStatus`, `PublicJobOffer`.
- Produces: `isOfferPublic(offer, now?)`, `sortPublicOffers(offers)`, `validateCv(file)`, `validateApplication(input)`, `createCvPath(offerId, fileName, token?)`.

- [ ] **Step 1: Escribir las pruebas fallidas de vigencia, orden y validación**

```ts
import { describe, expect, it } from "vitest";
import {
  createCvPath,
  isOfferPublic,
  sortPublicOffers,
  validateApplication,
  validateCv,
} from "../features/jobs/rules";

const offer = {
  id: "offer-1",
  title: "Anfitrión de salón",
  slug: "anfitrion-de-salon",
  department: "Servicio",
  location: "Ayacucho",
  work_mode: "onsite" as const,
  summary: "Recibe a nuestros visitantes.",
  description: "Descripción",
  responsibilities: ["Recibir clientes"],
  requirements: ["Comunicación cordial"],
  benefits: [],
  status: "published" as const,
  application_deadline: "2026-08-31",
  sort_order: 2,
  created_at: "2026-08-01T00:00:00Z",
  updated_at: "2026-08-01T00:00:00Z",
};

describe("job rules", () => {
  it("solo publica ofertas publicadas y no vencidas", () => {
    expect(isOfferPublic(offer, new Date("2026-08-05T12:00:00Z"))).toBe(true);
    expect(isOfferPublic({ ...offer, status: "paused" }, new Date("2026-08-05"))).toBe(false);
    expect(isOfferPublic({ ...offer, application_deadline: "2026-08-04" }, new Date("2026-08-05T12:00:00Z"))).toBe(false);
  });

  it("ordena por sort_order y después por fecha de creación descendente", () => {
    const result = sortPublicOffers([
      { ...offer, id: "b", sort_order: 1, created_at: "2026-08-01T00:00:00Z" },
      { ...offer, id: "a", sort_order: 1, created_at: "2026-08-02T00:00:00Z" },
      { ...offer, id: "c", sort_order: 2 },
    ]);
    expect(result.map(({ id }) => id)).toEqual(["a", "b", "c"]);
  });

  it("acepta solo PDF de hasta 5 MB", () => {
    expect(validateCv(new File(["pdf"], "cv.pdf", { type: "application/pdf" }))).toEqual([]);
    expect(validateCv(new File(["x"], "cv.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }))).toContain("Adjunta tu CV en formato PDF.");
    expect(validateCv(new File([new Uint8Array(5 * 1024 * 1024 + 1)], "cv.pdf", { type: "application/pdf" }))).toContain("El CV no debe superar los 5 MB.");
  });

  it("valida campos y consentimiento", () => {
    expect(validateApplication({ full_name: "", phone: "123", email: "mal", city: "", experience_summary: "", availability: "", privacy_consent: false })).toMatchObject({
      full_name: expect.any(String), email: expect.any(String), privacy_consent: expect.any(String),
    });
  });

  it("genera una ruta privada sin conservar el nombre personal", () => {
    expect(createCvPath("offer-1", "CV María Pérez.pdf", "token-fijo")).toBe("offer-1/token-fijo.pdf");
  });
});
```

- [ ] **Step 2: Ejecutar la prueba y confirmar el fallo esperado**

Run: `npm test -- src/tests/jobRules.test.ts`  
Expected: FAIL porque `../features/jobs/rules` no existe.

- [ ] **Step 3: Crear tipos y constantes compartidas**

```ts
export type JobOfferStatus = "draft" | "published" | "paused" | "closed";
export type JobApplicationStatus = "new" | "reviewing" | "shortlisted" | "rejected" | "hired";
export type WorkMode = "onsite" | "hybrid" | "remote";

export interface JobOffer {
  id: string; title: string; slug: string; department: string; location: string;
  work_mode: WorkMode; summary: string; description: string;
  responsibilities: string[]; requirements: string[]; benefits: string[];
  status: JobOfferStatus; application_deadline: string | null; sort_order: number;
  created_at: string; updated_at: string;
}
export type PublicJobOffer = JobOffer;
export type JobOfferInput = Omit<JobOffer, "id" | "created_at" | "updated_at">;
export interface JobApplicationInput {
  full_name: string; phone: string; email: string; city: string;
  experience_summary: string; availability: string; privacy_consent: boolean;
}
export interface JobApplication extends JobApplicationInput {
  id: string; job_offer_id: string; cv_path: string; status: JobApplicationStatus;
  internal_notes: string | null; created_at: string; updated_at: string;
  job_offers?: Pick<JobOffer, "title" | "slug">;
}
export const JOB_OFFER_STATUS_LABELS = { draft: "Borrador", published: "Publicada", paused: "Pausada", closed: "Cerrada" } satisfies Record<JobOfferStatus, string>;
export const JOB_APPLICATION_STATUS_LABELS = { new: "Nueva", reviewing: "En revisión", shortlisted: "Preseleccionada", rejected: "Descartada", hired: "Contratada" } satisfies Record<JobApplicationStatus, string>;
```

- [ ] **Step 4: Implementar las reglas mínimas**

Implementar comparación de fecha límite al final del día local, copia ordenada sin mutar el arreglo, validación de email/teléfono/campos, MIME/extensión/tamaño y saneamiento de la ruta. `createCvPath` debe usar `crypto.randomUUID()` cuando no reciba `token`.

- [ ] **Step 5: Ejecutar prueba, lint y commit**

Run: `npm test -- src/tests/jobRules.test.ts && npm run lint -- src/features/jobs src/tests/jobRules.test.ts`  
Expected: PASS sin errores.

```bash
git add src/features/jobs/types.ts src/features/jobs/rules.ts src/tests/jobRules.test.ts
git commit -m "Add job domain rules"
```

---

### Task 2: Esquema local, RLS y Storage privado

**Files:**
- Create: `supabase/jobs.sql`

**Interfaces:**
- Consumes: estados y nombres de campos definidos en Task 1.
- Produces: tablas `public.job_offers`, `public.job_applications` y bucket `job-cvs`.

- [ ] **Step 1: Crear el SQL idempotente completo**

El archivo debe crear ambas tablas con UUID, checks exactos de estado/modalidad, arrays `TEXT[] DEFAULT '{}'`, índices por estado/fecha/oferta, trigger compartido `set_updated_at`, RLS habilitado y el bucket:

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('job-cvs', 'job-cvs', false, 5242880, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 5242880,
  allowed_mime_types = ARRAY['application/pdf'];
```

Las políticas deben usar una función `public.is_admin()` con `SECURITY DEFINER`, `SET search_path = public` y comprobación de `profiles.role = 'admin'`. Definir:

- SELECT público en `job_offers` solo para `published` y fecha no vencida.
- ALL administrativo en `job_offers`, incluyendo `WITH CHECK`.
- INSERT anónimo en `job_applications` solo cuando la oferta referenciada siga vigente, `privacy_consent = true`, campos no vacíos y `cv_path` no vacío.
- SELECT/UPDATE/DELETE de postulaciones solo para admin.
- INSERT público a `storage.objects` solo en `job-cvs`, PDF, carpeta cuyo primer segmento coincida con una oferta vigente; no conceder SELECT público.
- SELECT/DELETE de objetos solo para admin.

- [ ] **Step 2: Revisar seguridad e idempotencia localmente**

Run: `grep -n "ENABLE ROW LEVEL SECURITY\|WITH CHECK\|job-cvs\|is_admin" supabase/jobs.sql`  
Expected: aparecen RLS para ambas tablas, políticas de escritura y políticas del bucket privado.

Run: `git diff --check -- supabase/jobs.sql`  
Expected: sin errores de whitespace.

- [ ] **Step 3: Commit local sin ejecutar el SQL**

```bash
git add supabase/jobs.sql
git commit -m "Add local jobs database schema"
```

---

### Task 3: API de ofertas y postulación atómica compensada

**Files:**
- Create: `src/features/jobs/api.ts`
- Create: `src/tests/jobApi.test.ts`

**Interfaces:**
- Consumes: tipos y `createCvPath`, `validateApplication`, `validateCv` de Task 1.
- Produces: `listPublicJobOffers()`, `listAdminJobOffers()`, `saveJobOffer(input, id?)`, `duplicateJobOffer(offer)`, `listJobApplications()`, `submitJobApplication(offerId, input, cv, client?)`, `updateJobApplication(id, patch)`, `createCvSignedUrl(path)`.

- [ ] **Step 1: Escribir pruebas fallidas para postulación y compensación**

Crear un cliente falso encadenable para verificar dos casos: upload seguido de insert exitoso; upload exitoso, insert fallido y `storage.remove([path])` ejecutado. También verificar que un error de upload impide el insert. Inyectar el cliente como último parámetro de `submitJobApplication` para mantener pruebas sin red.

- [ ] **Step 2: Ejecutar y confirmar fallo**

Run: `npm test -- src/tests/jobApi.test.ts`  
Expected: FAIL porque `api.ts` no existe.

- [ ] **Step 3: Implementar consultas y mutaciones tipadas**

`listPublicJobOffers` debe ordenar por `sort_order ASC, created_at DESC`. `saveJobOffer` debe insertar cuando no hay `id` y actualizar cuando existe. `duplicateJobOffer` debe quitar IDs/fechas, añadir “(copia)” al título, generar `${slug}-copia-${Date.now()}` y forzar `draft`.

`submitJobApplication` debe:

```ts
const errors = { ...validateApplication(input), cv: validateCv(cv)[0] };
if (Object.values(errors).some(Boolean)) throw new JobValidationError(errors);
const cvPath = createCvPath(offerId, cv.name);
const { error: uploadError } = await client.storage.from("job-cvs").upload(cvPath, cv, { contentType: "application/pdf", upsert: false });
if (uploadError) throw uploadError;
const { data, error } = await client.from("job_applications").insert({ ...input, job_offer_id: offerId, cv_path: cvPath, status: "new" }).select().single();
if (error) { await client.storage.from("job-cvs").remove([cvPath]); throw error; }
return data as JobApplication;
```

`createCvSignedUrl` debe pedir 60 segundos y devolver `signedUrl` o lanzar el error de Supabase.

- [ ] **Step 4: Ejecutar pruebas y commit**

Run: `npm test -- src/tests/jobApi.test.ts src/tests/jobRules.test.ts`  
Expected: PASS.

```bash
git add src/features/jobs/api.ts src/tests/jobApi.test.ts
git commit -m "Add jobs data services"
```

---

### Task 4: Página pública y formulario profesional

**Files:**
- Create: `src/features/jobs/components/JobCard.tsx`
- Create: `src/features/jobs/components/JobApplicationForm.tsx`
- Create: `src/routes/unete-al-equipo.tsx`
- Modify: `src/components/site-footer.tsx:72-74`

**Interfaces:**
- Consumes: `PublicJobOffer`, reglas y `listPublicJobOffers`, `submitJobApplication`.
- Produces: ruta pública `/unete-al-equipo` y formulario funcional.

- [ ] **Step 1: Crear `JobCard` accesible**

Renderizar `article`, cargo, área, ubicación, modalidad, resumen y fecha límite. El botón debe ser `type="button"`, tener `aria-label="Ver oferta {title}"` y llamar `onSelect(offer)`.

- [ ] **Step 2: Crear `JobApplicationForm`**

Usar estado controlado para los siete campos, `File | null`, errores por campo y estados `idle/submitting/success/error`. Etiquetas siempre visibles, `aria-invalid`, `aria-describedby`, `accept="application/pdf,.pdf"`; bloquear doble envío y reiniciar únicamente tras éxito. Si la oferta deja de estar vigente, mostrar: “Esta convocatoria acaba de cerrar. Revisa las demás oportunidades disponibles.”

- [ ] **Step 3: Componer la ruta pública**

Configurar metadatos SEO y usar `SiteNavigationMenu` y `SiteFooter`. Construir:

- hero con `/imagenes-reales/EQUIPO/02042026-DSC05038.webp`, overlay eucalipto y “Crece con nosotros”;
- tres principios de cultura;
- carga de ofertas en `useEffect` con estados loading/error/empty;
- filtros de área/modalidad visibles únicamente si hay más de una opción;
- detalle seleccionado en grid `lg:grid-cols-[minmax(0,1fr)_22rem]`;
- formulario en la columna lateral;
- cierre editorial con fotografía real del equipo.

Usar exclusivamente clases de la paleta existente y jerarquía serif/sans definida en `styles.css`.

- [ ] **Step 4: Corregir el enlace del footer**

Sustituir el `<a href="#">` de “Únete al Equipo” por:

```tsx
<Link to="/unete-al-equipo" className="hover:text-chilca transition-colors font-semibold">
  Únete al Equipo
</Link>
```

- [ ] **Step 5: Verificar ruta y commit**

Run: `npm run build`  
Expected: build exitoso y route tree generado con `/unete-al-equipo`.

```bash
git add src/features/jobs/components/JobCard.tsx src/features/jobs/components/JobApplicationForm.tsx src/routes/unete-al-equipo.tsx src/components/site-footer.tsx src/routeTree.gen.ts
git commit -m "Add public careers experience"
```

---

### Task 5: Gestión administrativa de ofertas

**Files:**
- Create: `src/features/jobs/components/AdminJobOfferForm.tsx`
- Create: `src/features/jobs/components/AdminJobsSection.tsx`

**Interfaces:**
- Consumes: `JobOffer`, `JobOfferInput`, etiquetas, `saveJobOffer`, `duplicateJobOffer`.
- Produces: `AdminJobsSection({ offers, applications, onChanged })` y gestión de ofertas.

- [ ] **Step 1: Crear formulario administrativo**

El formulario debe aceptar `offer: JobOffer | null`, `onClose` y `onSaved`. Incluir título, slug autogenerado editable, área, ubicación, modalidad, resumen, descripción, responsabilidades/requisitos/beneficios como una línea por ítem, estado, fecha límite y orden. Validar campos requeridos y no permitir `published` sin resumen, descripción, responsabilidades y requisitos.

- [ ] **Step 2: Crear vista Ofertas**

`AdminJobsSection` debe tener subpestañas `offers/applications`. En Ofertas, mostrar métricas, búsqueda, filtro de estado, botón “Nueva oferta”, tabla en desktop y tarjetas en móvil. Cada fila tendrá Editar, Duplicar, Previsualizar y cambio de estado. La previsualización debe reutilizar `JobCard` y contenido del detalle sin publicar datos.

- [ ] **Step 3: Implementar feedback robusto**

Deshabilitar acciones durante guardado, mostrar éxito/error y pedir confirmación antes de cerrar una oferta publicada. Tras cada mutación llamar `onChanged()`; no realizar borrado permanente desde la interfaz.

- [ ] **Step 4: Ejecutar validación y commit**

Run: `npm run lint -- src/features/jobs/components/AdminJobOfferForm.tsx src/features/jobs/components/AdminJobsSection.tsx && npm run build`  
Expected: PASS.

```bash
git add src/features/jobs/components/AdminJobOfferForm.tsx src/features/jobs/components/AdminJobsSection.tsx
git commit -m "Add admin job offer management"
```

---

### Task 6: Gestión administrativa de candidatos

**Files:**
- Create: `src/features/jobs/components/AdminJobApplications.tsx`
- Modify: `src/features/jobs/components/AdminJobsSection.tsx`

**Interfaces:**
- Consumes: `JobApplication`, etiquetas, `updateJobApplication`, `createCvSignedUrl`.
- Produces: filtros, detalle, notas, estado y acceso seguro al CV.

- [ ] **Step 1: Crear filtros y listado responsive**

Filtrar por texto sobre nombre/email/teléfono, oferta, estado y rango de fecha. Ordenar más recientes primero. Mostrar estado con texto además del color y destacar `new` sin depender solo de color.

- [ ] **Step 2: Crear ficha de candidato**

Mostrar datos completos, experiencia, disponibilidad, oferta, fecha, consentimiento y notas internas. El selector debe cubrir exactamente `new`, `reviewing`, `shortlisted`, `rejected`, `hired`. Guardar notas y estado mediante `updateJobApplication` y revertir UI si falla.

- [ ] **Step 3: Añadir acceso temporal al CV**

Al pulsar “Ver CV”, solicitar URL firmada de 60 segundos y abrirla con `window.open(url, "_blank", "noopener,noreferrer")`. Mostrar error accionable si el archivo ya no existe o Storage rechaza el acceso.

- [ ] **Step 4: Integrar en `AdminJobsSection` y commit**

Mostrar contador `applications.filter(a => a.status === "new").length` en la subpestaña Postulaciones y renderizar estado vacío específico.

Run: `npm run lint -- src/features/jobs/components && npm run build`  
Expected: PASS.

```bash
git add src/features/jobs/components/AdminJobApplications.tsx src/features/jobs/components/AdminJobsSection.tsx
git commit -m "Add applicant management workflow"
```

---

### Task 7: Integración con `/admin` y realtime

**Files:**
- Modify: `src/routes/admin.tsx:1-35,48-60,157-170,203-253,433-539,588-640` y zona de render condicional al final del `<main>`.

**Interfaces:**
- Consumes: `JobOffer`, `JobApplication`, `listAdminJobOffers`, `listJobApplications`, `AdminJobsSection`.
- Produces: pestaña `jobs` autorizada, contador de nuevas y sincronización realtime.

- [ ] **Step 1: Añadir estado y carga administrativa**

Extender `activeTab` con `"jobs"`; añadir `jobOffers` y `jobApplications`. En `fetchData`, cargar ambas listas solo después de la autorización existente. Añadir suscripciones realtime para `job_offers` y `job_applications`.

- [ ] **Step 2: Añadir navegación y encabezado**

Importar `BriefcaseBusiness`. Añadir botón “Empleos & Talento” siguiendo exactamente el patrón visual de las demás pestañas y badge con postulaciones `new`. Añadir el título “Empleos & Talento” al header.

- [ ] **Step 3: Evitar KPI ajenos dentro de empleos**

Encapsular las métricas globales actuales para que no aparezcan cuando `activeTab === "jobs"`. Renderizar:

```tsx
{activeTab === "jobs" && (
  <AdminJobsSection
    offers={jobOffers}
    applications={jobApplications}
    onChanged={fetchData}
  />
)}
```

- [ ] **Step 4: Verificar autorización y build**

Confirmar que la ruta sigue redirigiendo usuarios no admin antes de cargar candidatos y que `/caja` no recibe enlaces ni datos de empleos.

Run: `npm test && npm run lint && npm run build`  
Expected: pruebas, lint y build exitosos.

```bash
git add src/routes/admin.tsx src/routeTree.gen.ts
git commit -m "Integrate jobs into admin panel"
```

---

### Task 8: Revisión visual, accesibilidad y documentación operativa

**Files:**
- Modify only files from Tasks 4-7 when a verified issue is found.
- Modify: `supabase/README.md`

**Interfaces:**
- Consumes: feature completa.
- Produces: instrucciones locales y evidencia final de verificación.

- [ ] **Step 1: Documentar preparación local**

Añadir a `supabase/README.md` una sección “Empleos” que indique que `supabase/jobs.sql` debe revisarse y aplicarse manualmente en el entorno elegido, y recalcar que este trabajo no lo ejecuta contra remoto. Documentar bucket `job-cvs`, límite 5 MB y políticas admin.

- [ ] **Step 2: Revisar responsive y accesibilidad en local**

Ejecutar la app localmente y revisar `/unete-al-equipo` y `/admin` en 375, 768 y 1440 px. Verificar navegación por teclado, foco visible, etiquetas, contraste, ausencia de overflow, loading/error/empty/success y que los estados incluyan texto. No dejar el servidor ejecutándose al terminar.

- [ ] **Step 3: Ejecutar verificación final limpia**

Run: `npm test && npm run lint && npm run build && git --no-pager diff --check`  
Expected: todos los comandos finalizan con código 0.

- [ ] **Step 4: Revisar alcance y estado de Git**

Run: `git --no-optional-locks status --short`  
Expected: únicamente cambios propios pendientes; los archivos locales preexistentes permanecen intactos y sin añadir.

- [ ] **Step 5: Commit de documentación o correcciones verificadas**

```bash
git add supabase/README.md
git add src/routes/unete-al-equipo.tsx src/routes/admin.tsx src/features/jobs 2>/dev/null || true
git commit -m "Polish careers accessibility"
```

Si solo cambió documentación, usar en su lugar:

```bash
git add supabase/README.md
git commit -m "Document local jobs setup"
```
