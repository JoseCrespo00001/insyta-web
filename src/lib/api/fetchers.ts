import { createClient } from "@/lib/supabase/client";
import type {
  Agent,
  ApiConversationDetail,
  ApiConversationSummary,
  ApiMeResponse,
  ApiProjectCreateResponse,
  ApiProjectScoreResponse,
  ApiUploadCreatedResponse,
  ApiUploadStatusResponse,
  ConversationDetail,
  ConversationSummary,
  Evaluation,
  Message,
  MeResponse,
  Paginated,
  Platform,
  Project,
  ProjectCreatePayload,
  ProjectCreateResponse,
  ProjectMetrics,
  Upload,
} from "@/lib/api/schemas";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function authHeaders(): Promise<HeadersInit> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {};
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function jsonFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(await authHeaders()),
      ...init.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    let detail: string | undefined;
    try {
      const parsed = JSON.parse(text) as { detail?: string };
      detail = parsed.detail;
    } catch {
      detail = text;
    }
    throw new ApiError(res.status, detail || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Helpers para mapear ApiX → tipos de dominio ────────────────────────────

function mapProjectFromScore(score: ApiProjectScoreResponse): Project {
  return {
    public_id: score.project_public_id,
    avg_score: score.score ?? null,
    evaluations_count: score.evaluation_count,
  };
}

function mapMessage(m: ApiConversationDetail["messages"][number]): Message {
  return {
    public_id: m.public_id,
    role: m.role,
    content_anonymized: m.content_anonymized,
    timestamp: m.timestamp,
  };
}

function mapEvaluation(
  e: NonNullable<ApiConversationDetail["evaluation"]>,
): Evaluation {
  return {
    score: e.score,
    resolution: e.resolution,
    satisfaction: e.satisfaction,
    tone: e.tone,
    summary: e.summary,
  };
}

function mapConversationSummary(
  c: ApiConversationSummary,
): ConversationSummary {
  return {
    public_id: c.public_id,
    platform: c.platform,
    started_at: c.started_at,
    status: c.status,
    score: c.score ?? null,
    external_id: c.external_id,
  };
}

function mapConversationDetail(c: ApiConversationDetail): ConversationDetail {
  return {
    public_id: c.public_id,
    platform: c.platform,
    status: c.status,
    started_at: c.started_at,
    messages: c.messages.map(mapMessage),
    evaluation: c.evaluation ? mapEvaluation(c.evaluation) : null,
    external_id: c.external_id,
  };
}

function mapUpload(u: ApiUploadStatusResponse): Upload {
  return {
    public_id: u.upload_id,
    project_id: u.project_public_id,
    status: u.status as Upload["status"],
    rows_total: u.rows_total,
    rows_processed: u.rows_processed,
    error_message: u.error_message,
  };
}

// ─── projectsApi ─────────────────────────────────────────────────────────────

export const projectsApi = {
  // Backend aun NO expone GET /projects ni GET /projects/{id} (solo /score).
  // Como workaround para que /projects (lista) muestre algo: tomamos
  // allowed_project_ids de /me y, opcionalmente, hacemos un GET /score por
  // cada uno para enriquecer con el numero. Cuando el backend exponga GET
  // /projects (Linear: tech debt Wave 4), cambiamos esto a una sola llamada.
  list: async (): Promise<Paginated<Project>> => {
    const me = await meApi.get();
    const ids = me.allowed_project_ids ?? [];
    if (ids.length === 0) {
      return { items: [], next_cursor: null, total: 0 };
    }
    const items = await Promise.all(
      ids.map(async (publicId): Promise<Project> => {
        try {
          const score = await projectsApi.score(publicId);
          return mapProjectFromScore(score);
        } catch {
          // Score query fallida — devolvemos solo el id para que el
          // usuario al menos pueda navegar.
          return { public_id: publicId };
        }
      }),
    );
    return { items, next_cursor: null, total: items.length };
  },

  // Backend NO expone GET /projects/{id}. Devolvemos un Project derivado
  // de /score con los campos disponibles. UI debe ser tolerante a name
  // ausente (fallback al public_id).
  get: async (publicId: string): Promise<Project> => {
    const score = await projectsApi.score(publicId);
    return mapProjectFromScore(score);
  },

  score: (publicId: string) =>
    jsonFetch<ApiProjectScoreResponse>(`/api/v1/projects/${publicId}/score`),

  create: async (
    payload: ProjectCreatePayload,
  ): Promise<ProjectCreateResponse> => {
    const r = await jsonFetch<ApiProjectCreateResponse>(`/api/v1/projects`, {
      method: "POST",
      body: JSON.stringify({
        name: payload.name,
        slug: payload.slug,
        description: payload.description ?? null,
      }),
    });
    return {
      public_id: r.public_id,
      name: r.name,
      slug: r.slug,
      webhook_secret: r.webhook_secret,
    };
  },

  // Backend solo expone score + evaluation_count. Devolvemos el resto como
  // null/empty hasta que /score se extienda (issue Linear Wave 4).
  metrics: async (
    publicId: string,
    _params: { from?: string; to?: string; agent_id?: string } = {},
  ): Promise<ProjectMetrics> => {
    const score = await projectsApi.score(publicId);
    return {
      avg_score: score.score ?? null,
      evaluations_count: score.evaluation_count,
      resolution_rate: null,
      avg_satisfaction: null,
      frustration_rate: null,
      escalation_rate: null,
      trend_7d: [],
      top_topics: [],
    };
  },

  // Backend aun NO expone GET /projects/{id}/agents. Devolvemos lista vacia
  // hasta que se cree (issue Linear Wave 4). UI maneja empty con CTA.
  agents: async (_publicId: string): Promise<Paginated<Agent>> => {
    return { items: [], next_cursor: null, total: 0 };
  },

  conversations: async (
    publicId: string,
    params: { cursor?: string; limit?: number } = {},
  ): Promise<Paginated<ConversationSummary>> => {
    const search = new URLSearchParams();
    if (params.cursor) search.set("cursor", params.cursor);
    if (params.limit) search.set("limit", String(params.limit));
    const qs = search.toString();
    const r = await jsonFetch<{
      items: ApiConversationSummary[];
      next_cursor: string | null;
    }>(`/api/v1/projects/${publicId}/conversations${qs ? `?${qs}` : ""}`);
    return {
      items: r.items.map(mapConversationSummary),
      next_cursor: r.next_cursor,
    };
  },

  // Backend NO acepta sort=score_asc — devolvemos los primeros `limit`
  // ordenados client-side por score asc (los null al final). Cuando
  // backend agregue ?sort=, simplificar.
  topProblematicConversations: async (
    publicId: string,
    params: {
      limit?: number;
      from?: string;
      to?: string;
      agent_id?: string;
    } = {},
  ): Promise<Paginated<ConversationSummary>> => {
    const limit = params.limit ?? 10;
    // Pedimos un poco mas para tener margen de ordenamiento client-side.
    const r = await projectsApi.conversations(publicId, { limit: limit * 3 });
    const sorted = [...r.items].sort((a, b) => {
      if (a.score === null && b.score === null) return 0;
      if (a.score === null) return 1;
      if (b.score === null) return -1;
      return a.score - b.score;
    });
    return {
      items: sorted.slice(0, limit),
      next_cursor: null,
    };
  },
};

// ─── meApi ──────────────────────────────────────────────────────────────────

export const meApi = {
  get: async (): Promise<MeResponse> => {
    const r = await jsonFetch<ApiMeResponse>(`/api/v1/me`);
    return {
      user_id: r.user_id,
      email: r.email,
      org_id: r.org_id,
      allowed_project_ids: r.allowed_project_ids ?? [],
    };
  },
};

// ─── uploadsApi ─────────────────────────────────────────────────────────────

export const uploadsApi = {
  // Endpoint REAL: POST /api/v1/uploads/csv (multipart) con field
  // `project_public_id` en el form y `file`. NO acepta agent_id ni platform
  // todavia — esos campos se inferiran del project + agent default cuando
  // el backend lo soporte.
  create: async (
    projectPublicId: string,
    { file }: { file: File; agentId?: string; platform?: Platform },
  ): Promise<Upload> => {
    const fd = new FormData();
    fd.append("project_public_id", projectPublicId);
    fd.append("file", file);
    const res = await fetch(`${API_URL}/api/v1/uploads/csv`, {
      method: "POST",
      headers: await authHeaders(),
      body: fd,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new ApiError(res.status, text || res.statusText);
    }
    const created = (await res.json()) as ApiUploadCreatedResponse;
    return {
      public_id: created.upload_id,
      project_id: projectPublicId,
      status: (created.status as Upload["status"]) ?? "pending",
      rows_total: null,
      rows_processed: null,
      error_message: null,
      filename: file.name,
      size_bytes: file.size,
    };
  },

  get: async (uploadPublicId: string): Promise<Upload> => {
    const r = await jsonFetch<ApiUploadStatusResponse>(
      `/api/v1/uploads/${uploadPublicId}`,
    );
    return mapUpload(r);
  },
};

// ─── conversationsApi ───────────────────────────────────────────────────────

export const conversationsApi = {
  get: async (publicId: string): Promise<ConversationDetail> => {
    const r = await jsonFetch<ApiConversationDetail>(
      `/api/v1/conversations/${publicId}`,
    );
    return mapConversationDetail(r);
  },
};
