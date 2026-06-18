# public/ — Assets estáticos que sirve la web

Todo lo que está acá Next.js lo sirve en la URL raíz.
Ej: `public/logo.svg` → se accede como `/logo.svg` en el navegador.

> Los archivos **maestros** de marca viven en `08-branding/logos/` (fuente de verdad).
> Acá van las **copias listas para producción** que usa el sitio.

## Dónde va cada cosa

| Carpeta / archivo | Qué |
|-------------------|-----|
| `logos/` | SVGs del logo (full, mark, wordmark, variante dark) |
| `icons/` | favicon.ico, icon-192.png, icon-512.png (PWA) |
| `og-image.png` | Imagen 1200×630 para compartir en redes (Open Graph) |
| `images/` | Imágenes de la landing (hero, screenshots, ilustraciones) |

## Cómo usar un asset en el código

```tsx
import Image from "next/image";

// SVG/img desde public/ — la ruta arranca en "/"
<Image src="/logos/logo-full.svg" alt="Insyta" width={120} height={32} />
```

## Reglas

- **SVG** para logos e íconos (escala sin perder calidad).
- **PNG** solo para favicon, og-image y screenshots.
- Cada logo en dos variantes si hace falta: una para fondo claro, otra para `-dark`.
- Usar el verde de marca `#6BE78E` (ver `08-branding/colors.md`).
- Mantené sincronizado: si actualizás el logo en `08-branding/logos/`, copiá la versión final acá.
