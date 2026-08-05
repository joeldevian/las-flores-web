import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { CartProvider } from "../context/CartContext";
import { CartSidebar } from "../components/CartSidebar";
import { supabase } from "../lib/supabase";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Restaurante Las Flores — Cocina ayacuchana de autor" },
      {
        name: "description",
        content:
          "Tres generaciones celebrando la tradición culinaria de Ayacucho. Reservas, delivery y una experiencia sensorial en el corazón de los Andes.",
      },
      { name: "author", content: "Restaurante Las Flores" },
      { property: "og:title", content: "Restaurante Las Flores — Ayacucho" },
      {
        property: "og:description",
        content: "Cocina ayacuchana de autor. Tres generaciones, un mismo respeto por la tierra.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Spectral:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap",
        fetchPriority: "high",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="overflow-x-hidden">
        {children}
        {/* ScrollRestoration is deprecated in recent versions of Tanstack Router, handled in createRouter instead */}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [oauthLoading, setOauthLoading] = useState(false);

  // ── Procesar callback OAuth de Facebook/Google en la URL ──────────────
  // Cuando el proveedor redirige de vuelta con ?code=... o #access_token=...
  // Supabase necesita procesar ese token antes de que los componentes lean la sesión.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    const hasCode = url.searchParams.has("code");
    const hasAccessToken = window.location.hash.includes("access_token");
    const hasError = url.searchParams.has("error");

    if (hasError) {
      // Limpiar parámetros de error de la URL sin recargar la página
      url.searchParams.delete("error");
      url.searchParams.delete("error_description");
      window.history.replaceState({}, "", url.toString());
      return;
    }

    if (hasCode || hasAccessToken) {
      setOauthLoading(true);
      // Intercambiar el code por una sesión válida
      supabase.auth.exchangeCodeForSession(window.location.href)
        .then(({ error }) => {
          if (error) {
            // Fallback: intentar getSession directamente (para flujos implícitos con hash)
            return supabase.auth.getSession();
          }
        })
        .catch(() => supabase.auth.getSession())
        .finally(() => {
          // Limpiar los parámetros OAuth de la URL para que quede limpia
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete("code");
          cleanUrl.hash = "";
          window.history.replaceState({}, "", cleanUrl.toString());
          setOauthLoading(false);
        });
    }
  }, []);

  if (oauthLoading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#FBF5E6] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-[3px] border-[#2C4A3E] border-t-transparent rounded-full animate-spin" />
        <p className="font-serif text-[#2C4A3E] font-semibold text-base">Iniciando sesión…</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <Outlet />
        <CartSidebar />
      </CartProvider>
    </QueryClientProvider>
  );
}
