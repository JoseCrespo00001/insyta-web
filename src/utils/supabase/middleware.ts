import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // Refresca el token en cada request, PERO con timeout: getUser() es una llamada
  // de red al auth de Supabase y corre en el edge. Si Supabase tarda o falla, sin
  // guard el middleware se cuelga y Vercel tira 504 (MIDDLEWARE_INVOCATION_TIMEOUT)
  // en toda la web. Con el guard degradamos con gracia: seguimos sin refrescar esta
  // vez (el cliente reintenta en el próximo request). Mejor una sesión no-refrescada
  // que una web caída.
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      supabase.auth.getUser(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("supabase-auth-timeout")),
          3000,
        );
      }),
    ]);
  } catch {
    // Supabase lento/caído: no rompemos el request.
  } finally {
    if (timer) clearTimeout(timer);
  }

  return supabaseResponse;
};
