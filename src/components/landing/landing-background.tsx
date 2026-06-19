import Image from "next/image";

/**
 * Fondo único de toda la landing: una sola capa del largo total que baja con el
 * scroll (no fija) con blobs de marca (logo_verde.svg) distribuidos a lo largo y
 * animados. Funciona en ambos temas: sutil sobre claro, glow sobre charcoal.
 */
const BLOBS = [
  "left-[-8rem] top-[1%] h-[34rem] w-[34rem] rotate-12 [animation-duration:24s]",
  "right-[-6rem] top-[9%] h-[26rem] w-[26rem] -rotate-12 [animation-duration:30s] [animation-delay:-6s]",
  "left-[8%] top-[22%] h-[22rem] w-[22rem] rotate-6 [animation-duration:34s] [animation-delay:-12s]",
  "right-[6%] top-[36%] h-[30rem] w-[30rem] -rotate-6 [animation-duration:28s] [animation-delay:-3s]",
  "left-[-4rem] top-[50%] h-[24rem] w-[24rem] rotate-3 [animation-duration:32s] [animation-delay:-18s]",
  "right-[-5rem] top-[64%] h-[28rem] w-[28rem] rotate-12 [animation-duration:26s] [animation-delay:-9s]",
  "left-[12%] top-[78%] h-[24rem] w-[24rem] -rotate-6 [animation-duration:36s] [animation-delay:-15s]",
  "right-[10%] top-[91%] h-[30rem] w-[30rem] rotate-6 [animation-duration:30s] [animation-delay:-22s]",
];

export function LandingBackground() {
  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
      {/* Mesh/radiales verdes — suaves en claro, más presentes en dark */}
      <div className="absolute inset-0 bg-[radial-gradient(80%_45%_at_15%_0%,hsl(137_72%_66%/0.12),transparent_60%)] dark:bg-[radial-gradient(120%_60%_at_15%_3%,hsl(137_72%_66%/0.16),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(70%_40%_at_90%_85%,hsl(137_72%_66%/0.09),transparent_60%)] dark:bg-[radial-gradient(90%_50%_at_90%_88%,hsl(137_72%_66%/0.10),transparent_55%)]" />

      {BLOBS.map((cls, i) => (
        <Image
          key={i}
          src="/logos/logo_verde.svg"
          alt=""
          width={544}
          height={544}
          unoptimized
          priority={i === 0}
          className={`aurora absolute opacity-[0.18] dark:opacity-[0.13] ${cls}`}
        />
      ))}
    </div>
  );
}
