// Demo de conversaciones para la landing (mock, no i18n — fixture de marketing).
// Casos centrados en fallos reales de agentes: alucinaciones y automatización caída.
export type ChatMsg = { from: "cliente" | "agente"; text: string };

export type ReportDim = {
  label: string;
  value: string;
  intent: "good" | "bad" | "warn";
};

export type ProblemFlag = {
  kind: "hallucination" | "automation" | "legal" | "ok";
  label: string;
  detail: string;
};

export type Conversation = {
  id: string;
  channel: "whatsapp" | "instagram";
  name: string;
  handle: string;
  topic: string;
  date: string;
  score: number;
  status: string;
  intent: "good" | "bad" | "warn";
  chat: ChatMsg[];
  report: {
    flags: ProblemFlag[];
    pattern: string;
    patternIntent: "good" | "bad" | "warn";
    dimensions: ReportDim[];
    improvement: string;
    delta: string;
  };
};

export const CONVERSATIONS: Conversation[] = [
  {
    id: "conv_8f3a",
    channel: "whatsapp",
    name: "Lucía Fernández",
    handle: "+54 9 11 5821-4490",
    topic: "Devolución de una campera",
    date: "hace 2 h",
    score: 28,
    status: "Alucinación",
    intent: "bad",
    chat: [
      {
        from: "cliente",
        text: "Hola! compré una campera y me queda grande, ¿la puedo devolver?",
      },
      {
        from: "agente",
        text: "¡Hola Lucía! 😊 Claro, tenés 90 días para devolver cualquier prenda y te reintegramos el 100%, incluso sin la etiqueta puesta.",
      },
      {
        from: "cliente",
        text: "buenísimo! entonces la mando la semana que viene",
      },
      {
        from: "agente",
        text: "Perfecto, sin ningún problema. ¡Gracias por tu compra!",
      },
      {
        from: "cliente",
        text: "Listo, ya la envié pidiendo el reintegro completo 🙌",
      },
    ],
    report: {
      flags: [
        {
          kind: "hallucination",
          label: "Alucinación",
          detail:
            "Inventó una política de 90 días con reintegro del 100% sin etiqueta. La real es 30 días y con etiqueta.",
        },
        {
          kind: "legal",
          label: "Riesgo legal",
          detail: "Generó una obligación que la empresa no puede cumplir.",
        },
      ],
      pattern:
        "El agente alucinó una política inexistente — expone a un reclamo.",
      patternIntent: "bad",
      dimensions: [
        { label: "Resolución", value: "Falsa", intent: "bad" },
        { label: "Precisión", value: "Baja", intent: "bad" },
        { label: "Riesgo", value: "Alto", intent: "bad" },
      ],
      improvement:
        "Anclar el agente solo a la política oficial y bloquear afirmaciones sobre plazos y reintegros.",
      delta: "+22 pts verificado a 14 días",
    },
  },
  {
    id: "conv_2b71",
    channel: "instagram",
    name: "Martín Suárez",
    handle: "@martin.suarez",
    topic: "Compra de zapatillas",
    date: "hace 6 h",
    score: 34,
    status: "Automatización fallida",
    intent: "bad",
    chat: [
      { from: "cliente", text: "quiero las zapatillas negras talle 42" },
      {
        from: "agente",
        text: "¡Buenísimo Martín! Te confirmo el pedido #00000 de zapatillas negras talle 42. Llega en 3 días 🎉",
      },
      { from: "cliente", text: "perfecto, ya pagué" },
      {
        from: "agente",
        text: "¡Listo! Tu pedido está confirmado y en preparación ✅",
      },
      {
        from: "cliente",
        text: "pasaron 5 días y no llegó nada, ni figura el pedido…",
      },
    ],
    report: {
      flags: [
        {
          kind: "automation",
          label: "Automatización fallida",
          detail:
            "El webhook de checkout no se disparó: confirmó un pedido que nunca se creó en el sistema.",
        },
        {
          kind: "hallucination",
          label: "Dato inventado",
          detail: "Devolvió un número de pedido inexistente (#00000).",
        },
      ],
      pattern:
        "Venta fantasma — la automatización confirmó un pedido que no existe.",
      patternIntent: "bad",
      dimensions: [
        { label: "Resolución", value: "Fallida", intent: "bad" },
        { label: "Integración", value: "Caída", intent: "bad" },
        { label: "Frustración", value: "Alta", intent: "bad" },
      ],
      improvement:
        "No confirmar sin un ID de pedido válido devuelto por el sistema; reintentar el webhook y alertar si falla.",
      delta: "+19 pts verificado a 14 días",
    },
  },
  {
    id: "conv_9d05",
    channel: "whatsapp",
    name: "Sofía Ríos",
    handle: "+54 9 351 244-1075",
    topic: "Consulta de talle y stock",
    date: "ayer",
    score: 90,
    status: "Resuelta",
    intent: "good",
    chat: [
      { from: "cliente", text: "Hola, ¿tienen el buzo gris en talle M?" },
      {
        from: "agente",
        text: "¡Hola Sofía! Sí, hay stock del buzo gris en M. ¿Te paso el link de pago?",
      },
      { from: "cliente", text: "dale!" },
      {
        from: "agente",
        text: "Acá tenés 👉 pago.insyta.shop/buzo-gris-m. Envío gratis 🙌",
      },
      { from: "cliente", text: "listo, pagué!" },
      {
        from: "agente",
        text: "¡Gracias! Tu pedido #4821 quedó confirmado, llega en 48 h 📦",
      },
    ],
    report: {
      flags: [
        {
          kind: "ok",
          label: "Sin alucinaciones",
          detail: "Respuestas ancladas a stock y precios reales del catálogo.",
        },
      ],
      pattern: "Respuesta precisa + cierre de venta verificado.",
      patternIntent: "good",
      dimensions: [
        { label: "Resolución", value: "Completa", intent: "good" },
        { label: "Precisión", value: "Alta", intent: "good" },
        { label: "Frustración", value: "Baja", intent: "good" },
      ],
      improvement:
        "Mantener: anclar el agente al stock real sube la conversión.",
      delta: "patrón ganador",
    },
  },
];
