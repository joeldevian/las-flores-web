import { Quote, Heart, Award, Utensils, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

export interface CollaboratorReview {
  id: string;
  name: string;
  role: string;
  years: string;
  photo: string;
  quote: string;
  recommendedDish: string;
  dishPrice: string;
}

const defaultReviews: CollaboratorReview[] = [
  {
    id: "1",
    name: "Rosaura Huamán",
    role: "Maestra Repostera y Bebidas Tradicionales",
    years: "6 años en Las Flores",
    photo: "/imagenes-reales/EQUIPO/02042026-DSC04926.webp",
    quote:
      "En Las Flores no solo servimos recetas, compartimos memorias de nuestros abuelos. Mi mayor orgullo es ver la cara de sorpresa y felicidad cuando nuestros clientes prueban los postres artesanales hechos con amor.",
    recommendedDish: "Mazamorra de Llipta & Chapla Tradicional",
    dishPrice: "S/ 18.00",
  },
  {
    id: "2",
    name: "Dante Galindo",
    role: "Capitán de Salón & Hospitalidad",
    years: "4 años en Las Flores",
    photo: "/imagenes-reales/EQUIPO/02042026-DSC05081-opt.webp",
    quote:
      "Trabajar aquí es como recibir a invitados en mi propia casa. El respeto, la dignidad y el buen ambiente que nos da la empresa se refleja en la atención cálida y sonriente con la que atendemos cada mesa.",
    recommendedDish: "Chicha de Jora Especial de la Casa",
    dishPrice: "S/ 16.00",
  },
  {
    id: "3",
    name: "Carlos Avelino",
    role: "Chef de Fuegos & Carnes Andinas",
    years: "5 años en Las Flores",
    photo: "/imagenes-reales/EQUIPO/encantados-de-atenderlos.webp",
    quote:
      "El fuego ayacuchano requiere técnica, paciencia y mucho orgullo. Me llena el alma saber que el Cuy Chactado que sale de mi cocina deja un recuerdo imborrable en las familias que nos visitan.",
    recommendedDish: "Cuy Chactado Crujiente Tradicional",
    dishPrice: "S/ 68.00",
  },
];

export function FamiliaLasFloresSection({
  title = "Familia Las Flores",
  subtitle = "Nuestra Gente · Nuestro Orgullo",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <section id="familia-las-flores" className="py-16 px-4 bg-[#F9F8F3] relative overflow-hidden font-sans border-y border-[#D4AF37]/20">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#2D473C]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-sans font-black uppercase tracking-widest text-[#D4AF37] flex items-center justify-center gap-2">
            <Sparkles size={14} />
            {subtitle}
            <Sparkles size={14} />
          </span>
          <h2 className="font-serif font-black text-3xl md:text-4xl text-[#2D473C] tracking-tight">
            {title}
          </h2>
          <p className="text-sm text-gray-600 font-serif italic leading-relaxed">
            "El ingrediente secreto de nuestra cocina es el corazón, la dedicación y el orgullo de cada persona que forma parte de nuestra gran familia."
          </p>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {defaultReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-3xl p-6 border border-gray-200/90 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div className="space-y-4">
                {/* Photo & Header */}
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#D4AF37] shadow-md shrink-0">
                    <img
                      src={review.photo}
                      alt={review.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-gray-900 leading-tight">
                      {review.name}
                    </h3>
                    <p className="text-xs text-[#2D473C] font-semibold">
                      {review.role}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 font-extrabold uppercase mt-0.5">
                      <Award size={12} className="text-[#D4AF37]" />
                      {review.years}
                    </span>
                  </div>
                </div>

                {/* Quote */}
                <div className="relative pt-2">
                  <Quote size={24} className="text-[#D4AF37]/40 mb-1" />
                  <p className="text-xs text-gray-700 italic font-serif leading-relaxed">
                    "{review.quote}"
                  </p>
                </div>
              </div>

              {/* Recommended Dish Footer */}
              <div className="mt-6 pt-4 border-t border-gray-100 bg-[#F9F8F3]/80 -mx-6 -mb-6 p-4 rounded-b-3xl flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-black tracking-wider text-gray-400 block">
                    Recomendación de {review.name.split(" ")[0]}
                  </span>
                  <p className="font-serif font-bold text-xs text-[#2D473C] truncate max-w-[170px]">
                    {review.recommendedDish}
                  </p>
                </div>

                <Link
                  to="/carta"
                  className="px-3 py-1.5 rounded-xl bg-[#2D473C] hover:bg-[#243B31] text-white text-[11px] font-black flex items-center gap-1 shadow-2xs transition-transform active:scale-95 shrink-0"
                >
                  <Utensils size={12} className="text-[#D4AF37]" />
                  <span>Ver Carta</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Community Trust Badge Footer */}
        <div className="bg-[#2D473C] rounded-2xl p-6 text-white text-center flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg border border-[#D4AF37]/40">
          <div className="flex items-center gap-3 text-left">
            <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center shrink-0 border border-[#D4AF37]">
              <Heart size={24} className="text-[#D4AF37]" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-base text-white">
                ¿Quieres formar parte de la Familia Las Flores?
              </h4>
              <p className="text-xs text-emerald-100/80">
                Buscamos personas apasionadas por la alta gastronomía y la cultura ayacuchana.
              </p>
            </div>
          </div>

          <Link
            to="/unete-al-equipo"
            className="px-5 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#c29e2f] text-[#2D473C] font-black text-xs transition-all shadow-md shrink-0 active:scale-95"
          >
            Postular a Oportunidades
          </Link>
        </div>
      </div>
    </section>
  );
}
