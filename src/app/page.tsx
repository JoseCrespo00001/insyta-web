export default function HomePage() {
  return (
    <main className="container flex min-h-screen flex-col items-center justify-center gap-6 py-24">
      <h1 className="text-balance text-center text-4xl font-bold tracking-tight md:text-6xl">
        Insyta
      </h1>
      <p className="text-balance text-center text-lg text-muted-foreground md:text-xl">
        La capa de mejora continua para agentes de IA.
      </p>
      <p className="text-sm text-muted-foreground">
        Conecta tu agente, ve donde falla, y deja que nuestra IA lo mejore
        automaticamente.
      </p>
    </main>
  );
}
