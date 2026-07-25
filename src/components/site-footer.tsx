import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, BookOpen, Lock, Loader2 } from "lucide-react";
import { useState } from "react";
import { signInWithGoogle, supabase } from "../lib/supabase";

export function SiteFooter() {
  const [signingIn, setSigningIn] = useState(false);

  const handleAdminLogin = async () => {
    if (signingIn) return;
    setSigningIn(true);

    try {
      // Revisa si ya hay sesión
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        window.location.href = "/restaurante";
        setSigningIn(false);
        return;
      }

      await signInWithGoogle();
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        if (newSession) {
          subscription.unsubscribe();
          window.location.href = "/restaurante";
          setSigningIn(false);
        }
      });
    } catch (e) {
      console.error(e);
      setSigningIn(false);
    }
  };

  return (
    <footer className="bg-eucalipto-dark text-cream/80 py-16 md:py-20 text-sm border-t border-cream/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 pb-16">
          {/* Logo and Policies */}
          <div className="md:col-span-4 flex flex-col items-start space-y-6">
            <Link
              to="/restaurante"
              className="inline-block mb-2"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <img
                src="/images.png"
                alt="Las Flores Logo"
                className="h-12 md:h-16 w-auto object-contain brightness-0 invert"
              />
            </Link>

            <div className="flex flex-col space-y-2 text-sm">
              <a href="#" className="hover:text-retama transition-colors">
                Política de Privacidad
              </a>
              <a href="#" className="hover:text-retama transition-colors">
                Términos y Condiciones
              </a>
            </div>

            <a
              href="#"
              className="flex items-center gap-3 mt-4 hover:opacity-80 transition-opacity bg-white text-ink py-2 px-3 rounded-sm"
            >
              <BookOpen size={24} className="text-eucalipto" />
              <div className="leading-none text-left">
                <span className="text-[10px] uppercase font-bold text-eucalipto">Libro de</span>
                <br />
                <span className="text-[10px] uppercase font-bold text-eucalipto">
                  Reclamaciones
                </span>
              </div>
            </a>
          </div>

          {/* Central info (Address, Email, Phone) */}
          <div className="md:col-span-4 flex flex-col items-start md:items-center justify-center text-left md:text-center space-y-4">
            <span className="text-cream font-medium tracking-[0.2em] uppercase text-xs">
              @RESTLASFLORES
            </span>
            <p className="leading-[1.8]">
              Jr. José Olaya 106, Ayacucho, Perú.
              <br />
              +51 066 312 450 / reservas@lasflores.pe
            </p>
          </div>

          {/* Schedule and Socials */}
          <div className="md:col-span-4 flex flex-col items-start md:items-end justify-center space-y-4 text-left md:text-right">
            <div className="space-y-1">
              <p className="font-semibold text-cream">Horario de Atención</p>
              <p>Lunes a Domingo</p>
              <p>11:00 - 18:00</p>
            </div>

            <div className="flex gap-4 pt-4">
              <a
                href="#"
                className="p-2 border border-cream/20 rounded-full hover:bg-cream/10 hover:text-retama transition-all"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="p-2 border border-cream/20 rounded-full hover:bg-cream/10 hover:text-retama transition-all"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 border-t border-cream/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] tracking-wider text-cream/40">
          <span>© 2026 Restaurante Las Flores S.A.C.</span>
          <div className="flex items-center gap-4">
            <button
              onClick={handleAdminLogin}
              disabled={signingIn}
              className="hover:text-cream transition-colors"
              title="Acceso Administrativo"
            >
              {signingIn ? <Loader2 size={12} className="animate-spin" /> : <Lock size={12} />}
            </button>
            <span>Todos los derechos reservados</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
