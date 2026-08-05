# Master-Detail Redesign for "Únete al equipo" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `/unete-al-equipo` into a unified Master-Detail layout where selecting a job offer card immediately displays its full details, responsibilities, requirements, and benefits in an interactive right-hand panel with 2 tabs (`Detalles del Puesto` and `Formulario de Postulación`).

**Architecture:** Update `JobCard.tsx` for master list selection and rewrite the 2-column layout in `src/routes/unete-al-equipo.tsx` to host the Master list on the left and the 2-Tab Detail & Apply Panel on the right.

**Tech Stack:** React, TailwindCSS, Lucide-react icons, TanStack Router.

---

### Task 1: Update `JobCard.tsx` Selection State and Visual Feedback

**Files:**
- Modify: `src/features/jobs/components/JobCard.tsx`

- [ ] **Step 1: Update CTA button copy and active card styling in `JobCard.tsx`**

```tsx
// In JobCard.tsx
<button
  type="button"
  onClick={() => onSelect(offer)}
  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
    isSelected
      ? "bg-eucalipto text-cream shadow-sm"
      : "bg-cream text-ink hover:bg-eucalipto/10 hover:text-eucalipto"
  }`}
>
  {isSelected ? (
    <>
      <span>Viendo detalle</span>
      <span className="w-1.5 h-1.5 rounded-full bg-cream animate-pulse" />
    </>
  ) : (
    <>
      <span>Ver detalle</span>
      <span>→</span>
    </>
  )}
</button>
```

- [ ] **Step 2: Verify `JobCard.tsx` with build & typecheck**

Run: `npx tsc --noEmit`
Expected: PASS with 0 errors.

- [ ] **Step 3: Commit Task 1**

```bash
git add src/features/jobs/components/JobCard.tsx
git commit -m "style(jobs): update JobCard selection state and CTA text"
```

---

### Task 2: Re-architect `/unete-al-equipo` into 2-Tab Master-Detail Panel

**Files:**
- Modify: `src/routes/unete-al-equipo.tsx`

- [ ] **Step 1: Add `activeDetailTab` state and Tab switcher logic to `unete-al-equipo.tsx`**

Add `const [activeDetailTab, setActiveDetailTab] = useState<"details" | "apply">("details");`
When `setSelectedOffer` is called, automatically set `setActiveDetailTab("details")`.

- [ ] **Step 2: Implement the 2-Tab Right Panel in `unete-al-equipo.tsx`**

Construct the right panel header with job title, tags, and tabs (`Detalles del Puesto` | `Formulario de Postulación`).
In Tab 1 (`details`): render description, `CheckCircle2` responsibilities, `ListChecks` requirements, `Gift` benefits, and a primary CTA `Postular a este puesto →` which calls `setActiveDetailTab("apply")`.
In Tab 2 (`apply`): render `JobApplicationForm`.

- [ ] **Step 3: Run type check and unit tests**

Run: `npx tsc --noEmit && npm test`
Expected: PASS with 0 errors.

- [ ] **Step 4: Commit Task 2**

```bash
git add src/routes/unete-al-equipo.tsx
git commit -m "feat(jobs): implement Master-Detail 2-tab layout for unete-al-equipo page"
```
