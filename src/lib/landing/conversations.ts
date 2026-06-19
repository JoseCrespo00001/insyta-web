// Demo de conversaciones para la landing (mock, no i18n — fixture de marketing).
export type ChatMsg = { from: "cliente" | "agente"; text: string };

export type ReportDim = {
  label: string;
  value: string;
  intent: "good" | "bad" | "warn";
};

export type Conversation = {
  id: string;
  channel: "whatsapp" | "instagram";
  person: string;
  topic: string;
  date: string;
  score: number;
  status: string;
  intent: "good" | "bad" | "warn";
  chat: ChatMsg[];
  report: {
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
    person: "Cliente · conv_8f3a",
    topic: "“¿Dónde está mi pedido?”",
    date: "hace 2 h",
    score: 34,
    status: "Sin resolver",
    intent: "bad",
    chat: [
      {
        from: "cliente",
        text: "Hola! hace 5 días hice un pedido y no me llegó nada",
      },
      { from: "agente", text: "Hola 👋 ¿en qué puedo ayudarte?" },
      { from: "cliente", text: "¿Dónde está mi pedido?? ya pagué" },
      {
        from: "agente",
        text: "Para consultas de envío te recomiendo revisar la sección de ayuda de la web.",
      },
      {
        from: "cliente",
        text: "Ya la revisé y no dice nada. Necesito saber cuándo llega",
      },
      { from: "agente", text: "Entiendo, lamento las molestias." },
    ],
    report: {
      pattern: "Tracking de pedido + frustración — score 31% bajo el baseline",
      patternIntent: "bad",
      dimensions: [
        { label: "Resolución", value: "Parcial", intent: "bad" },
        { label: "Satisfacción", value: "2 / 5", intent: "bad" },
        { label: "Frustración", value: "Alta", intent: "bad" },
      ],
      improvement:
        "Pedir el número de pedido antes de escalar y dar un ETA concreto.",
      delta: "+18 pts verificado a 14 días",
    },
  },
  {
    id: "conv_2b71",
    channel: "whatsapp",
    person: "Cliente · conv_2b71",
    topic: "“¿Hay stock del modelo azul?”",
    date: "hace 5 h",
    score: 88,
    status: "Resuelta",
    intent: "good",
    chat: [
      { from: "cliente", text: "Hola, ¿tienen el modelo azul en talle M?" },
      {
        from: "agente",
        text: "¡Hola! Sí, tenemos stock del modelo azul en M 🙌",
      },
      { from: "cliente", text: "Genial, ¿cuánto sale?" },
      {
        from: "agente",
        text: "$24.900 con envío gratis. ¿Querés que te pase el link de pago?",
      },
      { from: "cliente", text: "Dale!" },
      { from: "agente", text: "Acá tenés 👉 pago.insyta.shop/azul-m" },
    ],
    report: {
      pattern: "Consulta de stock resuelta con cierre de venta",
      patternIntent: "good",
      dimensions: [
        { label: "Resolución", value: "Completa", intent: "good" },
        { label: "Satisfacción", value: "5 / 5", intent: "good" },
        { label: "Frustración", value: "Baja", intent: "good" },
      ],
      improvement:
        "Mantener: ofrecer el link de pago directo subió la conversión.",
      delta: "patrón ganador",
    },
  },
  {
    id: "conv_9d05",
    channel: "instagram",
    person: "Cliente · conv_9d05",
    topic: "Reclamo por producto fallado",
    date: "ayer",
    score: 52,
    status: "Escaló a humano",
    intent: "warn",
    chat: [
      { from: "cliente", text: "me llegó el producto roto, es una vergüenza" },
      {
        from: "agente",
        text: "Lamento mucho lo ocurrido. ¿Podrías enviarme una foto del producto?",
      },
      { from: "cliente", text: "ahí va la foto 📷" },
      {
        from: "agente",
        text: "Gracias. Voy a derivar tu caso a un agente humano para gestionar el cambio.",
      },
      { from: "cliente", text: "ok pero quiero una solución rápida" },
    ],
    report: {
      pattern: "Reclamo con riesgo reputacional — respuesta lenta en Instagram",
      patternIntent: "warn",
      dimensions: [
        { label: "Resolución", value: "Escaló", intent: "warn" },
        { label: "Satisfacción", value: "3 / 5", intent: "warn" },
        { label: "Frustración", value: "Media", intent: "warn" },
      ],
      improvement:
        "Responder reclamos de IG en menos de 15 min y ofrecer compensación proactiva.",
      delta: "+11 pts estimado",
    },
  },
];
