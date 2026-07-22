import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
const ayacuchoHero = "/inicio/ayacucho.webp";
const culturaImg = "/imagenes-reales/ARTE Y CULTURA LISTO/CERAMICA/CERAMICA-AYACUCHANA.webp";
const retabloImg = "/imagenes-reales/ARTE Y CULTURA LISTO/RETABLO AYACUCHANO/Retablo-Ayacuchano.webp";
const platoPucaImg = "/imagenes-reales/RUTA GASTRONOMICA FALTA FOTOS/PLATOS/PUCA PICANTE/puca.webp"; // placeholder if needed
const platoCuyImg = "/imagenes-reales/RUTA GASTRONOMICA FALTA FOTOS/PLATOS/CUY FRITO/cuy.webp"; // placeholder
const platoMondongoImg = "/imagenes-reales/RUTA GASTRONOMICA FALTA FOTOS/PLATOS/MONDONGO/mondongo.webp"; // placeholder
const platoMaizImg = "/imagenes-reales/RUTA GASTRONOMICA FALTA FOTOS/POSTRES Y BEBIDAS/CHAPLA/chapla.webp"; // placeholder
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ayacucho — Las Flores | Tierra, cultura y sabor" },
      {
        name: "description",
        content:
          "Un viaje sensorial por Ayacucho: su gente, sus retablos, sus fogones. La carta de presentación del alma andina que inspira Restaurante Las Flores.",
      },
      { property: "og:title", content: "Ayacucho — Las Flores" },
      {
        property: "og:description",
        content:
          "Cultura, tradición y platos típicos de Ayacucho. La tierra que da vida a Restaurante Las Flores.",
      },
      {
        property: "og:image",
        content: new URL(ayacuchoHero, "https://restaurantelasflores.pe").toString(),
      },
      {
        name: "twitter:image",
        content: new URL(ayacuchoHero, "https://restaurantelasflores.pe").toString(),
      },
    ],
  }),
  component: Index,
});

// ─── TIPOS ────────────────────────────────────────────────────────────────────

type Festividad = {
  id: number;
  nombre: string;
  fecha: string;
  colorAccent: string; // clase tailwind para el detalle de color
  imagen: string;
  descripcionCorta: string;
  descripcion: string;
  tradiciones: string[];
  dato: string;
};

type Lugar = {
  id: number;
  numeral: string; // I, II, III…
  nombre: string;
  categoria: string; // solo texto, sin emojis
  imagen: string;
  descripcion: string;
  consejo: string;
};

// ─── DATA ─────────────────────────────────────────────────────────────────────

const festividades: Festividad[] = [
  {
    id: 1,
    nombre: "Semana Santa Ayacuchana",
    fecha: "Marzo / Abril",
    colorAccent: "bg-pantiwaita",
    imagen: "/imagenes-reales/FESTIVIDADES LISTO/SEMANA SANTA/semana santa.webp",
    descripcionCorta: "La mayor expresión de fe y fervor religioso en el Perú, con impresionantes alfombras de flores.",
    descripcion: "Celebrada habitualmente entre marzo y abril, la Semana Santa Ayacuchana, reconocida oficialmente como Patrimonio Cultural de la Nación, es la mayor expresión de fe y fervor religioso en el Perú, destacando por sus multitudinarias y solemnes procesiones, impresionantes alfombras de flores y profunda devoción andina. Una experiencia espiritual e histórica verdaderamente inigualable.",
    tradiciones: [
      "Procesión del Señor de los Ramos el Domingo de Ramos",
      "Quema del Judas y Pascua Toro el Sábado de Gloria",
      "Alfombras florales en las calles coloniales de Huamanga",
      "Certamen de pasos procesionales entre barrios rivales",
      "Degustación de los 12 platos típicos durante la semana",
    ],
    dato: "Más de 600 años de tradición ininterrumpida. La ciudad recibe hasta 80,000 visitantes en Semana Santa.",
  },
  {
    id: 2,
    nombre: "Carnaval Ayacuchano",
    fecha: "Febrero / Marzo",
    colorAccent: "bg-retama",
    imagen: "/imagenes-reales/FESTIVIDADES LISTO/CARNAVALES/Carnavales.webp",
    descripcionCorta: "Vibrante festividad que preserva la identidad andina a través de multitudinarias comparsas.",
    descripcion: "Celebrado entre febrero y marzo, el Carnaval Ayacuchano, reconocido oficialmente como Patrimonio Cultural de la Nación, es una vibrante festividad que preserva la identidad andina a través de multitudinarias comparsas, música y coloridos trajes tradicionales de danza. Una excelente oportunidad para vivir esta alegre tradición.",
    tradiciones: [
      "Yunzas o umishadas: tala del árbol adornado al ritmo del huayno",
      "Comparsas de danza con trajes típicos de cada barrio",
      "Batalla de agua, talco y serpentinas entre vecinos",
      "Concurso de huaynos y canciones de carnaval propias de Huamanga",
      "Preparación del ponche de frutas y la chicha de jora",
    ],
    dato: "El carnaval ayacuchano tiene melodías propias — los huaynos de carnaval — reconocidas a nivel internacional.",
  },
  {
    id: 3,
    nombre: "Hatun Yaku Raymi",
    fecha: "Agosto / Septiembre",
    colorAccent: "bg-eucalipto",
    imagen: "/imagenes-reales/FESTIVIDADES LISTO/HATUN YAKU RAYMI PARAS/HATUN YAKU RAYMI PARAS.webp",
    descripcionCorta: "Un ancestral tributo al agua y a la Pachamama con los Danzantes de Tijeras.",
    descripcion: "Celebrado entre agosto y septiembre en Paras, el Hatun Yaku Raymi es un ancestral tributo al agua y a la Pachamama. Destaca la participación de los Danzantes de Tijeras, quienes actúan como mediadores espirituales ante los Apus para bendecir el inicio del ciclo agrícola. Una gran oportunidad para presenciar esta milenaria tradición andina.",
    tradiciones: [
      "Duelos de Danza de las Tijeras entre competidores",
      "Rituales de ofrenda al agua y a la Pachamama",
      "Ferias de artesanía y retablos en torno a la festividad",
      "Banquetes comunales con los platos típicos del ande",
    ],
    dato: "La Danza de las Tijeras fue inscrita en la Lista del Patrimonio Cultural Inmaterial de la UNESCO en 2010.",
  },
  {
    id: 4,
    nombre: "Fiesta de las Cruces",
    fecha: "Mayo",
    colorAccent: "bg-retablo-blue",
    imagen: "/imagenes-reales/FESTIVIDADES LISTO/FIESTA DE LAS CRUCES/fiesta de las cruces(1).webp",
    descripcionCorta: "Fusiona la fe católica y andina con el tradicional descenso de cruces al ritmo de música.",
    descripcion: "Celebrada en mayo, especialmente en Luricocha (Huanta), la Fiesta de las Cruces fusiona la fe católica y andina con el tradicional descenso de cruces al ritmo de música costumbrista. Una gran oportunidad para vivir esta profunda devoción popular.",
    tradiciones: [
      "Peregrinación a los cerros al amanecer para adornar las cruces",
      "Bajada procesional de cruces hacia la Plaza de Armas",
      "Misas solemnes y velatones de toda la noche",
      "Festivales de música costumbrista y danzas",
      "Preparación de platos festivos comunales",
    ],
    dato: "Cada barrio tiene su propia cruz con nombre e historia propios. La Puca Cruz es la más antigua.",
  },
  {
    id: 5,
    nombre: "Vilcas Raymi",
    fecha: "Julio",
    colorAccent: "bg-adobe",
    imagen: "/imagenes-reales/FESTIVIDADES LISTO/VILCAS RAYMI/Vilcas raymi.webp",
    descripcionCorta: "Escenificación de la guerra Inca-Chanca en el antiguo centro administrativo inca.",
    descripcion: "Celebrado a fines de julio, el Vilcas Raymi escenifica la guerra Inca-Chanca en Vilcashuamán. Este antiguo centro administrativo inca, cuya imponente arquitectura está estrechamente ligada al diseño original del Cusco, ofrece la gran ventaja de disfrutar su majestuoso legado histórico con mucha menor afluencia turística y total tranquilidad.",
    tradiciones: [
      "Escenificación histórica en la plaza principal de Vilcashuamán",
      "Danzas folclóricas y representaciones teatrales",
      "Celebraciones en el imponente Ushnu incaico",
      "Ferias gastronómicas y artesanales",
      "Recorridos por el Templo del Sol y la Luna",
    ],
    dato: "Vilcashuamán es considerado el centro geográfico del antiguo Imperio Inca (Tahuantinsuyo).",
  },
];

const lugares: Lugar[] = [
  {
    id: 1,
    numeral: "I",
    nombre: "Aguas Turquesas de Millpu",
    categoria: "Naturaleza",
    imagen: "/imagenes-reales/DESTINOS LISTO/EXCURSIONES/MILLPU/millpu.webp",
    descripcion: "Ubicadas a casi 4 horas de Huamanga, las Aguas Turquesas de Millpu conforman una impresionante sucesión de piscinas naturales escalonadas en el interior de un cañón.",
    consejo: "Visitar de mayo a noviembre para disfrutar del vibrante color, llevar calzado de trekking.",
  },
  {
    id: 2,
    numeral: "II",
    nombre: "Pampa de Quinua",
    categoria: "Historia",
    imagen: "/imagenes-reales/DESTINOS LISTO/EXCURSIONES/PAMPA DE QUINUA/pampa de quinua.webp",
    descripcion: "A solo 45 minutos de Huamanga, la Pampa de Quinua es un majestuoso escenario histórico coronado por un obelisco que conmemora la Batalla de Ayacucho.",
    consejo: "Complementar la visita explorando la tradicional alfarería del pueblo aledaño.",
  },
  {
    id: 3,
    numeral: "III",
    nombre: "Complejo Arqueológico Wari",
    categoria: "Arqueología",
    imagen: "/imagenes-reales/DESTINOS LISTO/EXCURSIONES/COMPLEJO WARI/complejo wari.webp",
    descripcion: "A solo 30 minutos de Huamanga, destaca por haber sido la imponente capital del primer gran imperio andino, siendo pionero en la planificación urbana preincaica.",
    consejo: "Llevar protector solar y calzado cómodo para explorar sus extensas edificaciones de piedra.",
  },
  {
    id: 4,
    numeral: "IV",
    nombre: "Catedral de Huamanga",
    categoria: "Arquitectura Colonial",
    imagen: "/imagenes-reales/DESTINOS LISTO/CITY TOUR/CATEDRAL DE HUAMANGA/CATEDRAL.webp",
    descripcion: "Majestuosa obra del siglo XVII que destaca por su fachada renacentista y sus interiores barrocos, albergando impresionantes altares bañados en pan de oro.",
    consejo: "Recorrer el centro histórico a pie para admirar su arquitectura y riqueza histórica.",
  },
  {
    id: 5,
    numeral: "V",
    nombre: "Arte y Cultura Ayacuchana",
    categoria: "Artesanía",
    imagen: "/imagenes-reales/ARTE Y CULTURA LISTO/RETABLO AYACUCHANO/Retablo-Ayacuchano.webp",
    descripcion: "El retablo ayacuchano plasma magistralmente las costumbres andinas y religiosas mediante diminutas figuras en coloridas cajas de madera. Patrimonio Cultural de la Nación.",
    consejo: "Visitar los talleres artesanales para admirar este minucioso arte y adquirir piezas únicas.",
  },
  {
    id: 6,
    numeral: "VI",
    nombre: "Vilcashuamán",
    categoria: "Patrimonio Inca",
    imagen: "/imagenes-reales/DESTINOS LISTO/EXCURSIONES/VILCASHUAMAN/DSC09327-2.webp",
    descripcion: "A 3 horas de Huamanga, este imponente complejo arqueológico fue un importante centro administrativo inca, conectado estratégicamente con el Cusco.",
    consejo: "Llevar ropa abrigadora y recorrer sus majestuosas edificaciones de piedra como el Templo del Sol.",
  },
];



// ─── COMPONENTES ──────────────────────────────────────────────────────────────

function Modal({ imagen, titulo, subtitulo, accentBar, cuerpo, onClose }: {
  imagen: string;
  titulo: string;
  subtitulo: string;
  accentBar?: string;
  cuerpo: React.ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", fn); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10" onClick={onClose}>
      <div className="absolute inset-0 bg-ink/85 backdrop-blur-sm" />
      <div
        className="relative bg-cream text-ink max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Imagen cabecera con arco en CSS */}
        <div className="relative overflow-hidden" style={{ height: "18rem" }}>
          <img loading="lazy" src={imagen} alt={titulo} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center border border-cream/40 text-cream hover:bg-cream/10 transition-colors text-sm"
            aria-label="Cerrar"
          >
            ✕
          </button>
          <div className="absolute bottom-0 left-0 p-7">
            <p className="text-[10px] uppercase tracking-[0.35em] text-cream/60 mb-2">{subtitulo}</p>
            <h2 className="font-serif italic text-2xl md:text-3xl text-cream leading-snug">{titulo}</h2>
          </div>
        </div>

        {accentBar && <div className={`${accentBar} h-[3px] w-full`} />}

        <div className="px-8 py-9">{cuerpo}</div>
      </div>
    </div>
  );
}



// ─── SECCIÓN FESTIVIDADES — Carrusel / Slider ───────────────────────────────────

function FestividadesSlider({ onSelect }: { onSelect: (f: Festividad) => void }) {
  const [activo, setActivo] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setActivo((p) => (p + 1) % festividades.length), 5000);
  };

  useEffect(() => { resetTimer(); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);

  const goTo = (i: number) => { setActivo(i); resetTimer(); };
  const prev = () => { setActivo((p) => (p - 1 + festividades.length) % festividades.length); resetTimer(); };
  const next = () => { setActivo((p) => (p + 1) % festividades.length); resetTimer(); };
  
  const fest = festividades[activo];

  return (
    <div className="relative overflow-hidden bg-ink w-full aspect-[4/3] md:aspect-[21/9] rounded-3xl shadow-xl group">
      <style>{`
        @keyframes fillProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
      
      {festividades.map((f, i) => (
        <div key={f.id} className={`absolute inset-0 transition-opacity duration-1000 ${i === activo ? "opacity-100" : "opacity-0"}`}>
          <img loading="lazy" src={f.imagen} alt={f.nombre} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
          {/* Línea de color de la festividad arriba */}
          <div className={`absolute top-0 left-0 w-full h-1 ${f.colorAccent} z-20 opacity-80`} />
        </div>
      ))}

      <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10 text-cream">
        <div className="max-w-3xl">
          <p className="text-[10px] uppercase tracking-[0.35em] mb-3 text-cream/70">{fest.fecha}</p>
          <h3 className="font-serif italic text-3xl md:text-5xl mb-4 leading-tight">{fest.nombre}</h3>
          <p className="text-sm md:text-base text-cream/80 leading-relaxed mb-6 max-w-2xl hidden md:block">
            {fest.descripcionCorta}
          </p>
          <button
            onClick={() => onSelect(fest)}
            className="inline-flex items-center gap-3 px-6 py-3 bg-cream/10 hover:bg-cream text-cream hover:text-ink transition-colors text-[10px] uppercase tracking-[0.2em] font-semibold rounded-sm border border-cream/20"
          >
            Descubrir Festividad <span aria-hidden>→</span>
          </button>
        </div>
      </div>

      {/* Flechas de navegación */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 md:left-8 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button onClick={prev} className="p-3 bg-ink/40 hover:bg-ink/80 rounded-full text-cream backdrop-blur-sm transition-all" aria-label="Anterior">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 right-4 md:right-8 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button onClick={next} className="p-3 bg-ink/40 hover:bg-ink/80 rounded-full text-cream backdrop-blur-sm transition-all" aria-label="Siguiente">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>

      {/* Indicadores de carga tipo barra */}
      <div className="absolute bottom-6 md:bottom-12 right-6 md:right-12 z-10 flex gap-3 items-center">
        {festividades.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`relative overflow-hidden transition-all duration-500 ${i === activo ? "w-12 h-1.5 rounded-full bg-cream/30" : "w-1.5 h-1.5 rounded-full bg-cream/50 hover:bg-cream"}`}
            aria-label={`Ver festividad ${i + 1}`}
          >
            {i === activo && (
              <div 
                key={activo}
                className="absolute top-0 left-0 h-full bg-cream"
                style={{ animation: "fillProgress 5s linear forwards" }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── SECCIÓN LUGARES — Acordeón Expandible ───────────────────────────────────

function LugaresAccordion({ onSelect }: { onSelect: (l: Lugar) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="flex flex-col md:flex-row h-[750px] md:h-[500px] w-full gap-3 md:gap-5 overflow-hidden">
      {lugares.map((lugar, i) => {
        // En móviles y desktop, el primero se expande por defecto si no hay hover en ninguno.
        const isExpanded = hovered === null ? i === 0 : hovered === lugar.id;
        
        return (
          <div
            key={lugar.id}
            onMouseEnter={() => setHovered(lugar.id)}
            onClick={() => onSelect(lugar)}
            className={`relative rounded-3xl overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer shadow-sm group ${
              isExpanded ? "flex-[4] md:flex-[5]" : "flex-[1]"
            }`}
          >
            <img loading="lazy" 
              src={lugar.imagen} 
              alt={lugar.nombre} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" 
            />
            {/* Gradiente más oscuro abajo para que lea el texto */}
            <div className={`absolute inset-0 transition-opacity duration-700 ${isExpanded ? "bg-gradient-to-t from-ink via-ink/20 to-transparent" : "bg-ink/60 hover:bg-ink/40"}`} />
            
            {/* Número Romano */}
            <div className={`absolute top-4 transition-all duration-700 z-20 ${isExpanded ? "right-5 md:right-8" : "left-1/2 -translate-x-1/2 md:left-4 md:translate-x-0"}`}>
              <span className={`font-serif text-cream/40 select-none transition-all duration-700 ${isExpanded ? "text-4xl" : "text-xl md:text-2xl"}`}>
                {lugar.numeral}
              </span>
            </div>

            {/* Contenido expandido */}
            <div 
              className={`absolute bottom-0 left-0 w-full p-6 md:p-8 flex flex-col justify-end transition-all duration-500 z-20 ${
                isExpanded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
              }`}
            >
              <span className="text-eucalipto text-[10px] uppercase tracking-[0.35em] font-semibold mb-2 block">
                {lugar.categoria}
              </span>
              <h3 className="font-serif text-cream text-2xl md:text-4xl leading-tight mb-3">
                {lugar.nombre}
              </h3>
              <p className="text-cream/70 text-sm line-clamp-2 mb-5 hidden md:block max-w-[40ch]">
                {lugar.descripcion}
              </p>
              <div className="flex items-center gap-3 text-cream text-[10px] uppercase tracking-[0.2em] font-semibold mt-auto">
                <span className="w-8 h-[1px] bg-retama block"></span> Descubrir
              </div>
            </div>

            {/* Título para versión colapsada (Desktop) */}
            <div 
              className={`absolute inset-0 flex items-center justify-center pointer-events-none hidden md:flex transition-opacity duration-500 z-10 ${
                isExpanded ? "opacity-0" : "opacity-100"
              }`}
            >
              <span className="text-cream font-serif text-xl tracking-wider whitespace-nowrap -rotate-90">
                {lugar.nombre}
              </span>
            </div>
            
            {/* Título para versión colapsada (Mobile) */}
            <div 
              className={`absolute inset-0 flex items-center justify-center pointer-events-none md:hidden transition-opacity duration-500 z-10 ${
                isExpanded ? "opacity-0" : "opacity-100"
              }`}
            >
              <span className="text-cream font-serif text-sm tracking-widest text-center px-4 drop-shadow-md">
                {lugar.nombre}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────

function Index() {
  const [festividadActiva, setFestividadActiva] = useState<Festividad | null>(null);
  const [lugarActivo, setLugarActivo] = useState<Lugar | null>(null);

  return (
    <div className="bg-cream text-ink font-sans selection:bg-retama/30">

      {/* MODAL — Festividad */}
      {festividadActiva && (
        <Modal
          imagen={festividadActiva.imagen}
          titulo={festividadActiva.nombre}
          subtitulo={festividadActiva.fecha}
          accentBar={festividadActiva.colorAccent}
          onClose={() => setFestividadActiva(null)}
          cuerpo={
            <>
              <p className="text-ink/80 text-base md:text-lg leading-[1.85] mb-8">{festividadActiva.descripcion}</p>
              <h4 className="font-serif text-xl mb-5">Tradiciones</h4>
              <ul className="space-y-3 mb-8">
                {festividadActiva.tradiciones.map((t, i) => (
                  <li key={i} className="flex items-start gap-4 text-ink/75">
                    <span className="w-px h-4 bg-pantiwaita shrink-0 mt-1" />
                    <span className="text-sm leading-relaxed">{t}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-ink/10 pt-6">
                <p className="text-sm text-ink/55 leading-relaxed">
                  <span className="font-semibold text-eucalipto">Dato cultural — </span>
                  {festividadActiva.dato}
                </p>
              </div>
            </>
          }
        />
      )}

      {/* MODAL — Lugar */}
      {lugarActivo && (
        <Modal
          imagen={lugarActivo.imagen}
          titulo={lugarActivo.nombre}
          subtitulo={lugarActivo.categoria}
          accentBar="bg-eucalipto"
          onClose={() => setLugarActivo(null)}
          cuerpo={
            <>
              <p className="text-ink/80 text-base md:text-lg leading-[1.85] mb-8">{lugarActivo.descripcion}</p>
              <div className="border-l-2 border-eucalipto pl-6 py-1">
                <p className="text-[10px] uppercase tracking-[0.3em] text-eucalipto font-semibold mb-2">
                  Consejo de visita
                </p>
                <p className="text-sm text-ink/70 leading-relaxed">{lugarActivo.consejo}</p>
              </div>
            </>
          }
        />
      )}

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-10 py-1 md:py-2 mix-blend-difference text-cream">
        <div className="flex-1" />
        <Link to="/" className="flex-none" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <img loading="lazy" src="/images.png" alt="Las Flores Logo" className="h-10 md:h-16 w-auto object-contain brightness-0 invert" />
        </Link>
        <div className="flex-1 flex justify-end gap-8 text-[11px] md:text-sm uppercase tracking-[0.1em] md:tracking-[0.15em] font-semibold">
          <Link to="/restaurante" className="hover:text-retama transition-colors">
            <span className="md:hidden">RESTAURANTE</span>
            <span className="hidden md:inline">NUESTRO RESTAURANTE</span>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <header className="relative h-screen w-full overflow-hidden bg-ink">
        <img
          src={ayacuchoHero}
          alt="Vista panorámica de Ayacucho al atardecer con sus iglesias coloniales y los Andes"
          width={1920} height={1088}
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover opacity-70 animate-hero"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-transparent to-ink/80" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
          <span className="text-retama/90 uppercase tracking-[0.4em] text-xs md:text-sm mb-6 animate-reveal font-semibold">
            Huamanga · Perú
          </span>
          <h1 className="font-serif italic text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-cream leading-[1.05] text-balance max-w-[20ch] animate-reveal [animation-delay:200ms]">
            Guardianes de la Cultura Ayacuchana
          </h1>
          <p className="mt-8 max-w-[52ch] text-cream/80 text-sm sm:text-base md:text-lg leading-[1.7] animate-reveal [animation-delay:400ms]">
            Treinta y tres iglesias, retablos que guardan siglos y calles donde la tradición respira.
            Nosotros no solo servimos comida, preservamos el alma de Ayacucho.
          </p>
          <Link
            to="/restaurante"
            className="mt-14 inline-flex items-center gap-3 px-8 py-4 text-[11px] uppercase tracking-[0.25em] font-bold animate-reveal [animation-delay:600ms] rounded-sm btn-yellow-hover"
          >
            <span>Nuestra Historia</span> <span aria-hidden>→</span>
          </Link>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-cream/60 text-[10px] uppercase tracking-[0.4em]">
          Desliza
        </div>
      </header>

      {/* CULTURA Y TRADICIÓN */}
      <section className="py-24 md:py-40 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-5">
            <img
              src={retabloImg} alt="Retablo ayacuchano tallado a mano con figuras policromadas"
              width={800} height={1200} loading="lazy"
              className="w-full aspect-[4/5] object-cover"
            />
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <span className="text-eucalipto font-medium uppercase tracking-[0.3em] text-xs mb-6 block">
              Cultura y Tradición
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-6xl leading-[1.05] text-balance mb-8">
              El retablo, la textilería y el fogón
            </h2>
            <p className="text-base sm:text-lg leading-[1.7] text-pretty max-w-[48ch] text-ink/75">
              En Ayacucho el arte y la comida comparten origen: manos que tallan retablos,
              tejen mantas y avivan el fogón con la misma paciencia. Cada grano de maíz morado,
              cada aroma a leña y cada textura de la piedra volcánica cuentan la historia de
              una tierra que se niega a olvidar su esencia.
            </p>
          </div>
        </div>
      </section>

      {/* LUGARES PARA VISITAR */}
      <section className="py-20 md:py-32 px-6 bg-eucalipto/5">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <span className="text-eucalipto font-medium uppercase tracking-[0.3em] text-xs mb-4 block">
                Lugares para Visitar
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-[1.05] text-balance max-w-[24ch]">
                Ayacucho más allá de la mesa
              </h2>
            </div>
            <p className="text-sm sm:text-base text-ink/60 leading-[1.7] max-w-[36ch] md:text-right">
              Historia, naturaleza y arte vivo en cada rincón. Conoce la tierra que inspira nuestros sabores.
            </p>
          </div>
          {/* Acordeón expandible */}
          <LugaresAccordion onSelect={setLugarActivo} />
        </div>
      </section>

      {/* FESTIVIDADES DE HUAMANGA */}
      <section className="py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <span className="text-eucalipto font-medium uppercase tracking-[0.3em] text-xs mb-4 block">
                Festividades de Huamanga
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-[1.05] text-balance max-w-[28ch]">
                El calendario que da vida a nuestra cocina
              </h2>
            </div>
            <p className="text-base text-ink/60 leading-[1.7] max-w-[36ch] md:text-right">
              Cada plato de Las Flores tiene una celebración detrás. Estas son las fiestas de nuestra tierra.
            </p>
          </div>
          <FestividadesSlider onSelect={setFestividadActiva} />
        </div>
      </section>

      {/* PLATOS TÍPICOS */}
      <section className="py-12 md:py-16 px-6 bg-ink text-cream selection:bg-retama/30">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 max-w-3xl">
            <span className="text-retama font-medium uppercase tracking-[0.3em] text-[10px] mb-4 block">
              Platos Típicos
            </span>
            <h2 className="font-serif text-3xl md:text-5xl leading-[1.1] text-balance">
              La despensa de la sierra en cinco sabores
            </h2>
            <p className="mt-4 text-base text-cream/70 leading-[1.6] max-w-2xl">
              Recetas que definen la identidad ayacuchana. El fruto del fogón y las festividades
              que atraviesan generaciones.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { img: "/gastronomia/puca-picante.webp", nombre: "Puca Picante", desc: "Remolacha, maní tostado y chicharrón sobre arroz graneado." },
              { img: "/gastronomia/mondongo.webp", nombre: "Mondongo", desc: "Sopa ancestral de mote, panceta y hierbas de la puna." },
              { img: "/gastronomia/cuy-chactado.webp", nombre: "Cuy Chactado", desc: "Confitado con hierbas y servido bajo la piedra caliente." },
              { img: "/gastronomia/chicharron.webp", nombre: "Chicharrón", desc: "Cerdo dorado en su propia manteca con sarsa criolla." },
              { img: "/gastronomia/qapchi.webp", nombre: "Qapchi", desc: "Queso fresco, rocoto y huacatay sobre papas nativas." },
            ].map((p) => (
              <article key={p.nombre} className="flex flex-col group">
                <div className="dish-card-hover aspect-[5/4] bg-ink/40 rounded-lg">
                  <img
                    src={p.img} alt={p.nombre} width={1000} height={800} loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <div className="dish-card-overlay">
                    <span className="text-retama font-bold text-[10px] uppercase tracking-[0.25em] mb-1">
                      Plato Tradicional
                    </span>
                    <h4 className="font-serif text-lg font-bold text-cream mb-1">{p.nombre}</h4>
                    <p className="text-xs text-cream/80 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PREMIOS */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-6">
            <span className="text-eucalipto font-medium uppercase tracking-[0.3em] text-xs mb-6 block">
              Excelencia Reconocida
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-6xl leading-[1.05] text-balance mb-8">
              Nuestra devoción <span className="italic">premiada</span>
            </h2>
            <p className="text-base sm:text-lg leading-[1.7] text-pretty max-w-[48ch] text-ink/75 mb-10">
              Ser el mejor restaurante de Ayacucho no es solo un título, es una responsabilidad.
              Estos galardones reflejan nuestro respeto inquebrantable por la herencia culinaria.
            </p>
            <ul className="space-y-6 max-w-md">
              <li className="flex items-start gap-5">
                <span className="w-px h-10 bg-pantiwaita shrink-0 mt-1" />
                <div>
                  <h4 className="font-serif text-xl font-semibold mb-0.5">Mejor Restaurante Regional</h4>
                  <p className="text-sm text-ink/50 uppercase tracking-[0.2em]">Premios Summum 2024</p>
                </div>
              </li>
              <li className="flex items-start gap-5">
                <span className="w-px h-10 bg-pantiwaita shrink-0 mt-1" />
                <div>
                  <h4 className="font-serif text-xl font-semibold mb-0.5">Guardianes de la Tradición</h4>
                  <p className="text-sm text-ink/50 uppercase tracking-[0.2em]">Ministerio de Cultura</p>
                </div>
              </li>
              <li className="flex items-start gap-5">
                <span className="w-px h-10 bg-pantiwaita shrink-0 mt-1" />
                <div>
                  <h4 className="font-serif text-xl font-semibold mb-0.5">Ayacucho Emprende</h4>
                  <p className="text-sm text-ink/50 uppercase tracking-[0.2em]">Municipalidad de Huamanga</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="md:col-span-5 md:col-start-8">
            <img
              src="/imagenes-reales/EQUIPO/encantados-de-atenderlos.webp" alt="Personal de Las Flores encantados de atenderlos"
              width={800} height={1200} loading="lazy"
              className="w-full aspect-square object-cover rounded-3xl"
            />
          </div>
        </div>
      </section>

      {/* CITA DEL PERSONAL */}
      <section className="relative bg-eucalipto py-24 md:py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-retama font-medium uppercase tracking-[0.3em] text-xs block mb-8">
            El Orgullo de nuestro Personal
          </span>
          <blockquote className="font-serif italic text-3xl md:text-5xl leading-[1.15] text-cream/95 text-balance">
            «Siento un profundo respeto al portar los colores de nuestra tierra. Aquí no solo atendemos, aquí somos embajadores de Ayacucho.»
          </blockquote>
          <cite className="not-italic block mt-10 text-xs uppercase tracking-[0.3em] text-cream/60">
            — Carmen R., Anfitriona
          </cite>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative w-full">
        <img
          src={ayacuchoHero} alt="Vista andina al atardecer"
          width={1920} height={800} loading="lazy"
          className="w-full h-[60vh] md:h-[600px] object-cover"
        />
        <div className="absolute inset-0 bg-ink/75" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <span className="text-cream/70 uppercase tracking-[0.35em] text-xs block mb-6">
            Vive la Experiencia
          </span>
          <h2 className="font-serif italic text-cream text-4xl md:text-6xl max-w-[24ch] leading-tight text-balance">
            De esta tierra nace Las Flores
          </h2>
          <p className="mt-6 max-w-[40ch] text-cream/80 text-sm md:text-base leading-relaxed">
            Reserva una mesa en nuestro santuario de tradición o recibe el sabor de Ayacucho en tu hogar.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              to="/restaurante"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 font-serif font-bold text-lg tracking-wide rounded-xl btn-yellow-hover"
            >
              <span>Reserva tu Mesa</span>
            </Link>
            <Link
              to="/restaurante"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-cream/30 text-cream text-[11px] uppercase tracking-[0.25em] font-bold hover:bg-cream/10 transition-colors rounded-sm"
            >
              Pedir por Delivery
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
