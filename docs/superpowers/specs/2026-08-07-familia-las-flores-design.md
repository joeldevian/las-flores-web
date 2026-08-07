# Design Spec: Sección "Familia Las Flores" (Reseñas de Colaboradores & Orgullo Institucional)

**Fecha:** 2026-08-07  
**Estado:** Aprobado por el usuario  
**Propósito:** Desarrollar e implementar la sección "Familia Las Flores", que presenta reseñas de colaboradores expresando por qué se sienten orgullosos de trabajar en el restaurante, conectando testimonios humanos con recomendaciones directas de platos para potenciar las ventas y la imagen de marca.

---

## 1. Concepto y Objetivos

- **Human & Employer Branding como Motor de Ventas**: Mostrar el rostro humano, la pasión y el orgullo del equipo de cocina, salón y repostería de Restaurante Las Flores.
- **Conexión Testimonio ➔ Plato**: Cada colaborador destaca su razón de orgullo y recomienda su plato estrella con botón interactivo para pedir o agregar al carrito.
- **Integración 360°**: 
  - Componente principal: `src/components/FamiliaLasFloresSection.tsx`.
  - Integrado en `/restaurante` (Nuestro Restaurante), `/unete-al-equipo` (Bolsa de Trabajo) e `index.tsx` (Página de Inicio).

---

## 2. Estructura del Componente `FamiliaLasFloresSection.tsx`

### 2.1 Encabezado de la Sección
- **Subtítulo**: "Nuestra Gente · Nuestro Orgullo" (dorado `#D4AF37`).
- **Título Principal**: "Familia Las Flores" (Playfair Display, `#2D473C`).
- **Descripción**: "El ingrediente secreto de nuestra cocina es el corazón, la dedicación y el orgullo de cada persona que forma parte de esta casa."

### 2.2 Rejilla / Carrusel de Tarjetas de Colaboradores
Cada tarjeta incluye:
1. **Fotografía del Colaborador**: Imagen de retrato en alta definición con marco curvo y efecto hover elegante.
2. **Rol & Antigüedad**: Ej. *Maritza Sulca — Jefa de Cocina (8 años en Las Flores)*.
3. **Cita / Testimonio de Orgullo**: Con comillas doradas estilizadas. Ej. *"Aquí la cocina se respeta como un altar. Me siento orgullosa de llevar el sabor de Ayacucho a familias que sonríen en cada mesa."*
4. **Ficha de Plato Recomendado por el Colaborador**:
   - Etiqueta: "Plato recomendado por [Nombre]"
   - Nombre del plato + Precio en S/
   - Botón de interacción para abrir modal del menú o agregar al pedido.

---

## 3. Datos Iniciales de Colaboradores

1. **Rosaura Huamán**  
   - *Rol*: Maestra Repostera y Bebidas Tradicionales (6 años)  
   - *Foto*: `/imagenes-reales/EQUIPO/02042026-DSC04926.webp`  
   - *Testimonio*: *"En Las Flores no solo servimos recetas, compartimos memorias de nuestros abuelos. Mi mayor orgullo es ver la cara de felicidad cuando prueban nuestros postres típicos."*  
   - *Plato Recomendado*: Mazamorra de Llipta / Chapla Tradicional

2. **Dante Galindo**  
   - *Rol*: Capitán de Salón & Hospitalidad (4 años)  
   - *Foto*: `/imagenes-reales/EQUIPO/02042026-DSC05081-opt.webp`  
   - *Testimonio*: *"Trabajar aquí es como recibir a invitados en mi propia casa. El respeto y el trato humano que la empresa tiene con nosotros se refleja en la atención cálida de cada mesa."*  
   - *Plato Recomendado*: Chicha de Jora de la Casa

3. **Carlos Avelino**  
   - *Rol*: Chef de Fuegos & Carnes (5 años)  
   - *Foto*: `/imagenes-reales/EQUIPO/encantados-de-atenderlos.webp`  
   - *Testimonio*: *"El fuego ayacuchano requiere técnica y alma. Me llena de orgullo saber que el Cuy Chactado que sale de mi cocina deja un recuerdo inolvidable en los visitantes."*  
   - *Plato Recomendado*: Cuy Chactado Crujiente

---

## 4. Estética & Paleta de Colores

- **Fondo**: `#F9F8F3` / `#FFFFFF` con sutil patrón Retablo Andino.
- **Tipografía**: Playfair Display (titulares) + Spectral / Inter (cuerpo y citas).
- **Acentos**: Dorado Chilca (`#D4AF37`) y Verde Eucalipto (`#2D473C`).
- **Iconos**: Exclusivamente `Lucide React` (Heart, Quote, Star, Utensils).

---

## 5. Criterios de Aceptación

1. Componente `FamiliaLasFloresSection.tsx` totalmente responsivo.
2. Integración en `src/routes/restaurante.tsx`, `src/routes/unete-al-equipo.tsx` y `src/routes/index.tsx`.
3. `npm run build` sin errores TypeScript.
4. Push a remotos `origin main` y `joeldevian main`.
