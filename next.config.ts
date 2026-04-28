import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // typedRoutes: true,  // Re-habilitar cuando todas las rutas Wave 3 esten creadas.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
  },
};

export default nextConfig;
