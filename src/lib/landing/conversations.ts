// Demo de conversaciones para la landing (mock, no i18n — fixture de marketing).
// Casos: alucinaciones, automatización caída, problemas de flujo y objetivos de campaña.
export type ChatMsg = { from: "cliente" | "agente"; text: string };

export type ReportDim = {
  label: string;
  value: string;
  intent: "good" | "bad" | "warn";
};

export type ProblemFlag = {
  // "flow" = problema del flujo (no del agente); "objective" = objetivo de campaña.
  kind: "hallucination" | "automation" | "legal" | "flow" | "objective" | "ok";
  label: string;
  detail: string;
};

export type CampaignObjective = {
  source: string;
  goal: string;
  achieved: boolean;
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
    objective?: CampaignObjective;
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
          label: "Alucinación del agente",
          detail:
            "Inventó una política de 90 días con reintegro del 100% sin etiqueta. La real es 30 días y con etiqueta.",
        },
        {
          kind: "legal",
          label: "Riesgo legal",
          detail: "Generó una obligación que la empresa no puede cumplir.",
        },
        {
          kind: "flow",
          label: "Flujo de devoluciones",
          detail:
            "El flujo no obliga a citar la política oficial antes de responder sobre reintegros.",
        },
      ],
      dimensions: [
        { label: "Resolución", value: "Falsa", intent: "bad" },
        { label: "Precisión", value: "Baja", intent: "bad" },
        { label: "Riesgo", value: "Alto", intent: "bad" },
      ],
      improvement:
        "Anclar el agente solo a la política oficial y agregar al flujo un paso que valide plazos y reintegros.",
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
        {
          kind: "flow",
          label: "Flujo de checkout",
          detail:
            "El flujo confirma la venta antes de validar que el pedido se creó. Falta un chequeo intermedio.",
        },
      ],
      dimensions: [
        { label: "Resolución", value: "Fallida", intent: "bad" },
        { label: "Integración", value: "Caída", intent: "bad" },
        { label: "Frustración", value: "Alta", intent: "bad" },
      ],
      improvement:
        "No confirmar sin un ID de pedido válido; reintentar el webhook y alertar si la integración falla.",
      delta: "+19 pts verificado a 14 días",
    },
  },
  {
    id: "conv_5c12",
    channel: "instagram",
    name: "Camila Ortiz",
    handle: "@cami.ortiz",
    topic: "Lead de campaña · Promo invierno",
    date: "hace 1 d",
    score: 46,
    status: "Objetivo no cumplido",
    intent: "warn",
    chat: [
      {
        from: "cliente",
        text: "Hola! vi la promo de invierno en Instagram, ¿qué incluye?",
      },
      {
        from: "agente",
        text: "¡Hola! La promo es 30% off en toda la colección de invierno 🧥",
      },
      { from: "cliente", text: "buenísimo, ¿y cómo la aprovecho?" },
      {
        from: "agente",
        text: "Entrá a la web y usá el cupón INVIERNO al pagar 😊",
      },
      { from: "cliente", text: "ah dale, gracias!" },
    ],
    report: {
      objective: {
        source: "Meta Ads · Campaña Promo Invierno",
        goal: "Captar email y teléfono del lead",
        achieved: false,
        detail:
          "El lead estaba interesado pero el agente nunca pidió sus datos: se perdió el contacto que pagó la campaña.",
      },
      flags: [
        {
          kind: "objective",
          label: "Objetivo de campaña no cumplido",
          detail: "0 de 2 datos capturados (email y teléfono).",
        },
        {
          kind: "flow",
          label: "Flujo sin captura de lead",
          detail:
            "El flujo no incluye un paso para pedir contacto antes de derivar a la web.",
        },
      ],
      dimensions: [
        { label: "Objetivo", value: "No cumplido", intent: "bad" },
        { label: "Datos", value: "0 / 2", intent: "bad" },
        { label: "Interés", value: "Alto", intent: "warn" },
      ],
      improvement:
        "Sumar al flujo: pedir email y teléfono antes de enviar el cupón, así el lead queda registrado.",
      delta: "+27 pts estimado",
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
      objective: {
        source: "Meta Ads · Campaña Retargeting",
        goal: "Cerrar la venta del carrito abandonado",
        achieved: true,
        detail: "Cerró la compra y registró el pedido #4821 en el sistema.",
      },
      flags: [
        {
          kind: "ok",
          label: "Sin alucinaciones",
          detail: "Respuestas ancladas a stock y precios reales del catálogo.",
        },
        {
          kind: "ok",
          label: "Flujo completo",
          detail:
            "Consulta → link de pago → confirmación con pedido real. Todo el flujo funcionó.",
        },
      ],
      dimensions: [
        { label: "Resolución", value: "Completa", intent: "good" },
        { label: "Precisión", value: "Alta", intent: "good" },
        { label: "Objetivo", value: "Cumplido", intent: "good" },
      ],
      improvement:
        "Mantener: anclar el agente al stock real y pedir el cierre sube la conversión.",
      delta: "patrón ganador",
    },
  },
];
