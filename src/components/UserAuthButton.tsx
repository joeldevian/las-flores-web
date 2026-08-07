import { useState, useEffect } from "react";
import {
  User,
  Loader2,
  BarChart3,
  UtensilsCrossed,
} from "lucide-react";
import { supabase, signInWithGoogle, signInWithFacebook } from "../lib/supabase";
import { LoginModal } from "./LoginModal";

interface UserAuthButtonProps {
  textColorClass: string;
}

export function UserAuthButton({ textColorClass }: UserAuthButtonProps) {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // ── Cargar sesión y perfil ──────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { data: { session: s } } = await supabase.auth.getSession();
      setSession(s);
      if (s) await fetchProfile(s.user.id);
      setLoading(false);
    };
    init();

    const handleAuthSync = async () => {
      const { data: { session: s } } = await supabase.auth.getSession();
      setSession(s);
      if (s) await fetchProfile(s.user.id);
    };

    window.addEventListener("message", handleAuthSync);
    window.addEventListener("storage", handleAuthSync);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
      setSession(s);
      if (s) {
        const { data: p } = await supabase.from("profiles").select("role").eq("id", s.user.id).single();
        setProfile(p);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("message", handleAuthSync);
      window.removeEventListener("storage", handleAuthSync);
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfile(data);
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleLoginGoogle = async () => {
    if (signingIn) return;
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      console.error(e);
    } finally {
      setSigningIn(false);
      setShowLoginModal(false);
    }
  };

  const handleLoginFacebook = async () => {
    if (signingIn) return;
    setSigningIn(true);
    try {
      await signInWithFacebook();
    } catch (e) {
      console.error(e);
    } finally {
      setSigningIn(false);
      setShowLoginModal(false);
    }
  };

  const handleClick = () => {
    if (!session) {
      setShowLoginModal(true);
      return;
    }
    // Siempre abre el historial de cliente sin importar el rol (el pie de página ya tiene los links ocultos para admin/caja)
    window.dispatchEvent(new Event("open_customer_history"));
  };

  // ── Loading ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <button className={`flex items-center justify-center p-1 rounded-md pointer-events-auto ${textColorClass}`}>
        <Loader2 size={24} className="animate-spin opacity-60" />
      </button>
    );
  }

  // ── Sin sesión ─────────────────────────────────────────────────────
  if (!session) {
    return (
      <>
        <button
          onClick={handleLoginClick}
          disabled={signingIn}
          className={`flex items-center justify-center p-1 rounded-md hover:bg-black/10 transition-colors pointer-events-auto ${textColorClass}`}
          aria-label="Iniciar sesión"
          title="Iniciar sesión"
        >
          {signingIn ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <User size={26} strokeWidth={2} />
          )}
        </button>

        {showLoginModal && (
          <LoginModal
            onClose={() => setShowLoginModal(false)}
            onGoogle={handleLoginGoogle}
            onFacebook={handleLoginFacebook}
            loading={signingIn}
          />
        )}
      </>
    );
  }

  const role = profile?.role;
  const avatarUrl =
    session.user?.user_metadata?.avatar_url ||
    session.user?.user_metadata?.picture ||
    profile?.avatar_url;
  const initials = (
    session.user?.user_metadata?.full_name ||
    session.user?.user_metadata?.name ||
    session.user?.email ||
    "?"
  )
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();

  // Avatar con punto verde — abre el CustomerHistoryModal del CartSidebar (o redirige a admin según lógica en el modal)
  return (
    <button
      onClick={handleClick}
      className={`relative flex items-center justify-center p-1 rounded-full hover:bg-black/10 transition-colors pointer-events-auto ${textColorClass}`}
      aria-label="Mi cuenta y pedidos"
      title="Ver mis pedidos y reservas"
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-7 h-7 rounded-full object-cover border-2 border-white/40 shadow-sm"
        />
      ) : (
        <div className="w-7 h-7 rounded-full bg-eucalipto text-chilca flex items-center justify-center text-[11px] font-black border-2 border-white/30">
          {initials}
        </div>
      )}
      <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border border-white shadow-xs" />
    </button>
  );
}
