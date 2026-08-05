-- ============================================================
-- SCRIPT DE MUESTRA PARA CONVOCATORIAS Y POSTULACIONES
-- Restaurante Las Flores Ayacucho
-- ============================================================

-- 1. Insertar Ofertas de Trabajo de Muestra
INSERT INTO public.job_offers (
  id, title, slug, department, location, work_mode, summary, description,
  responsibilities, requirements, benefits, status, application_deadline, sort_order
) VALUES
(
  'a1111111-1111-1111-1111-111111111111',
  'Anfitrión / Anfitriona de Salón',
  'anfitrion-de-salon',
  'Servicio',
  'Ayacucho',
  'onsite',
  'Recibe a nuestros comensales con la calidez, amabilidad y hospitalidad que caracteriza a Las Flores.',
  'Buscamos personas apasionadas por la atención al cliente para brindar la primera bienvenida a nuestros visitantes, coordinar la asignación de mesas y garantizar una experiencia memorable desde su llegada.',
  ARRAY['Dar una cálida bienvenida a comensales y visitantes', 'Gestionar la ubicación de mesas y recepción de reservas', 'Coordinar con el equipo de mozos e informarle preferencias de clientes'],
  ARRAY['Experiencia previa en atención al cliente o protocolo (deseable)', 'Excelente fluidez verbal, empatía y buena presencia', 'Disponibilidad para trabajar en turnos rotativos en Huamanga'],
  ARRAY['Ingreso a planilla desde el primer día con todos los beneficios de ley', 'Almuerzo cubierto durante la jornada laboral', 'Capacitación constante en protocolo y cultura gastronómica regional'],
  'published',
  '2026-12-31',
  1
),
(
  'a2222222-2222-2222-2222-222222222222',
  'Cocinero(a) de Gastronomía Ayacuchana',
  'cocinero-gastronomia-ayacuchana',
  'Cocina',
  'Ayacucho',
  'onsite',
  'Especialista en la preparación de platillos tradicionales ayacuchanos como Puca Picante, Cuy Chactado y Chicharrón.',
  'Integrarás el equipo culinario principal de Las Flores, manteniendo la sazón autóctona, los estándares de higiene HACCAP y la presentación impecable en cada plato.',
  ARRAY['Preparar guisos tradicionales y especialidades ayacuchanas', 'Supervisar el correcto picado, sazón y cocción de insumos regionales', 'Mantener el orden e higiene estricta en el área de cocina hot line'],
  ARRAY['Experiencia mínima de 1 año en cocinas de comida peruana o regional', 'Conocimiento de técnicas de cocción autóctonas e insumos andinos', 'Puntualidad, trabajo bajo presión y pasión por la gastronomía'],
  ARRAY['Sueldo competitivo acorde al mercado + propinas', 'Alimentación cubierta al 100%', 'Oportunidad de línea de carrera e innovación en carta'],
  'published',
  '2026-12-31',
  2
),
(
  'a3333333-3333-3333-3333-333333333333',
  'Bartender Regional & Coctelería',
  'bartender-regional-cocteleria',
  'Bar',
  'Ayacucho',
  'onsite',
  'Encargado del bar, creación de cócteles de autor a base de pisco, macerados regionales y bebidas autóctonas.',
  'Buscamos un perfil creativo para liderar la barra de Las Flores, preparando bebidas refrescantes, aperitivos tradicionales y macerados de hierbas aromáticas ayacuchanas.',
  ARRAY['Preparación de cócteles clásicos y macerados de la casa', 'Control de stock de licores, frutas e insumos del bar', 'Atención directa a clientes en barra con recomendación de maridajes'],
  ARRAY['Estudios de coctelería o barismo finalizados o en curso', 'Experiencia en barra mínima de 6 meses', 'Gusto por la coctelería con insumos y botánicos locales'],
  ARRAY['Grato ambiente de trabajo colaborativo', 'Descuento del personal en consumo de carta', 'Capacitaciones en mixología artesanal'],
  'published',
  '2026-12-31',
  3
),
(
  'a4444444-4444-4444-4444-444444444444',
  'Asistente de Marketing & Contenido Digital',
  'asistente-marketing-contenido-digital',
  'Marketing',
  'Ayacucho',
  'hybrid',
  'Diseño de contenido, fotografía de platos y gestión de redes sociales para promover nuestra identidad cultural.',
  'Buscamos un perfil creativo e impulsador para gestionar la presencia digital del restaurante, crear videos cortos para Instagram/TikTok y coordinar promociones especiales.',
  ARRAY['Creación y edición de fotos/videos de platillos y salones', 'Redacción de copys e interacción en redes sociales', 'Apoyo en el diseño de piezas gráficas y menús digitales'],
  ARRAY['Estudios en Marketing, Ciencias de la Comunicación o Diseño Gráfico', 'Manejo de herramientas como Canva, CapCut, Premiere o Photoshop', 'Residencia en Ayacucho para tomas presenciales'],
  ARRAY['Modalidad híbrida (presencial para eventos/tomas + remoto)', 'Flexibilidad de horarios', 'Línea de crecimiento en área comercial'],
  'published',
  '2026-12-31',
  4
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  department = EXCLUDED.department,
  location = EXCLUDED.location,
  work_mode = EXCLUDED.work_mode,
  summary = EXCLUDED.summary,
  description = EXCLUDED.description,
  responsibilities = EXCLUDED.responsibilities,
  requirements = EXCLUDED.requirements,
  benefits = EXCLUDED.benefits,
  status = EXCLUDED.status,
  application_deadline = EXCLUDED.application_deadline,
  sort_order = EXCLUDED.sort_order;

-- 2. Insertar Postulaciones de Muestra (Vincular mediante slug)
INSERT INTO public.job_applications (
  id, job_offer_id, full_name, phone, email, city,
  experience_summary, availability, privacy_consent, cv_path, status, internal_notes
) VALUES
(
  'b1111111-1111-1111-1111-111111111111',
  (SELECT id FROM public.job_offers WHERE slug = 'anfitrion-de-salon' LIMIT 1),
  'María Fernanda Morales Quispe',
  '+51 966 123 456',
  'maria.morales@gmail.com',
  'Ayacucho',
  'Cuento con 2 años de experiencia como recepcionista y anfitriona en hoteles y restaurantes turísticos de Huamanga. Excelente trato al cliente.',
  'Inmediata - Disponibilidad full time',
  true,
  'a1111111-1111-1111-1111-111111111111/sample-cv-maria.pdf',
  'new',
  'Excelente perfil. Contactar para entrevista inicial.'
),
(
  'b2222222-2222-2222-2222-222222222222',
  (SELECT id FROM public.job_offers WHERE slug = 'cocinero-gastronomia-ayacuchana' LIMIT 1),
  'Carlos Alberto Huamán Mendoza',
  '+51 980 852 963',
  'carlos.huaman@hotmail.com',
  'Ayacucho',
  'Más de 3 años cocinando comida criolla y andina. Especialista en carnes, chicharrones y guisos tradicionales huamanguinos.',
  'Disponible a partir del próximo lunes',
  true,
  'a2222222-2222-2222-2222-222222222222/sample-cv-carlos.pdf',
  'reviewing',
  'Revisando referencias de su trabajo anterior.'
),
(
  'b3333333-3333-3333-3333-333333333333',
  (SELECT id FROM public.job_offers WHERE slug = 'bartender-regional-cocteleria' LIMIT 1),
  'Lucía Valeria Flores Rojas',
  '+51 977 441 225',
  'lucia.flores@gmail.com',
  'Ayacucho',
  'Egresada de coctelería con 1 año de experiencia preparando chilcanos, sours y cócteles de autor con hierbas locales.',
  'Inmediata - Fines de semana y turnos noche',
  true,
  'a3333333-3333-3333-3333-333333333333/sample-cv-lucia.pdf',
  'shortlisted',
  'Preseleccionada para prueba de barra.'
)
ON CONFLICT (id) DO NOTHING;
