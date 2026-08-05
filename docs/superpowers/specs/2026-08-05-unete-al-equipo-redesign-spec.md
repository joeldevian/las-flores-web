# Design Spec: Rediseño Master-Detail de Vacantes ("Únete al equipo")

## Problem Statement
In the current `/unete-al-equipo` page, when a user clicks on a job offer card (e.g., "Cocinero de Gastronomía Ayacuchana"), the detailed job information (responsibilities, requirements, benefits) renders below the 2-column grid of cards, out of the user's immediate viewport ("below the fold"). Users only see the right-hand application form and do not notice the job requirements unless they accidentally scroll down.

## Proposed Solution: Master-Detail Layout with Interactive Panel
Replace the disconnected grid + bottom details section with a unified **Master-Detail Layout**:

### Left Column: Master Job Cards List
- Clean, compact job cards list (`JobCard.tsx`).
- Active card highlighted with dark caoba/gold retablo border (`border-eucalipto`, `shadow-md`).
- Each card has a clear call-to-action button: `Ver detalle →` or `Viendo detalle`.

### Right Column: Detail & Application Panel with 2 Tabs
When any job offer is selected from the left column, the right panel updates immediately without page scroll or hidden sections:
- **Header**: Large Serif Job Title, Department tag, Location tag, Work Mode badge.
- **Tab Bar**:
  - `Pestaña 1: 📄 Detalles del Puesto` (Default active tab upon clicking any card)
  - `Pestaña 2: ✍️ Formulario de Postulación`
- **Tab 1 Content (Job Details)**:
  - **Overview**: Description paragraph.
  - **Responsabilidades**: Bullet list with `CheckCircle2` icons.
  - **Requisitos**: Bullet list with `ListChecks` icons.
  - **Beneficios**: Bullet list with `Gift` icons.
  - **Primary CTA**: Prominent button at bottom `Postular a este puesto →` which automatically switches to Tab 2 (`Formulario de Postulación`).
- **Tab 2 Content (Application Form)**:
  - Renders `JobApplicationForm.tsx` pre-focused on the selected job offer.

## Component Changes
1. `JobCard.tsx`:
   - Update CTA text to `Ver detalle →` when unselected and `Viendo detalle` when selected.
   - Enhanced visual feedback for selected state.
2. `unete-al-equipo.tsx`:
   - Re-architect 2-column layout into Master (left) and Detail Panel (right).
   - Add state `activeDetailTab: 'details' | 'apply'`.
   - Automatically switch `activeDetailTab` to `'details'` when a user clicks a new job card.
3. `JobApplicationForm.tsx`:
   - Styled to fit seamlessly within the detail panel's Tab 2.
