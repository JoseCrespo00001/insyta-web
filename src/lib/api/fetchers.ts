import { createClient } from "@/lib/supabase/client";
import type {
  Agent,
  ConversationDetail,
  Paginated,
  Platform,
  Project,
  ProjectCreatePayload,
  ProjectCreateResponse,
  ProjectMetrics,
  ConversationSummary,
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
  return res.json() as Promise<T>;
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

export const projectsApi = {
  list: () => jsonFetch<Paginated<Project>>(`/api/v1/projects`),
  get: (publicId: string) => jsonFetch<Project>(`/api/v1/projects/${publicId}`),
  create: (payload: ProjectCreatePayload) =>
    jsonFetch<ProjectCreateResponse>(`/api/v1/projects`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  metrics: (
    publicId: string,
    params: { from?: string; to?: string; agent_id?: string } = {},
  ) => {
    const search = new URLSearchParams();
    if (params.from) search.set("from", params.from);
    if (params.to) search.set("to", params.to);
    if (params.agent_id) search.set("agent_id", params.agent_id);
    const qs = search.toString();
    return jsonFetch<ProjectMetrics>(
      `/api/v1/projects/${publicId}/metrics${qs ? `?${qs}` : ""}`,
    );
  },
  agents: (publicId: string) =>
    jsonFetch<Paginated<Agent>>(`/api/v1/projects/${publicId}/agents`),
  topProblematicConversations: (
    publicId: string,
    params: {
      limit?: number;
      from?: string;
      to?: string;
      agent_id?: string;
    } = {},
  ) => {
    const search = new URLSearchParams();
    search.set("sort", "score_asc");
    search.set("limit", String(params.limit ?? 10));
    if (params.from) search.set("from", params.from);
    if (params.to) search.set("to", params.to);
    if (params.agent_id) search.set("agent_id", params.agent_id);
    return jsonFetch<Paginated<ConversationSummary>>(
      `/api/v1/projects/${publicId}/conversations?${search.toString()}`,
    );
  },
};

export const uploadsApi = {
  create: async (
    projectPublicId: string,
    {
      file,
      agentId,
      platform,
    }: { file: File; agentId: string; platform: Platform },
  ) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("agent_id", agentId);
    fd.append("platform", platform);
    const res = await fetch(
      `${API_URL}/api/v1/projects/${projectPublicId}/uploads`,
      {
        method: "POST",
        headers: await authHeaders(),
        body: fd,
      },
    );
    if (!res.ok) {
      const text = await res.text();
      throw new ApiError(res.status, text || res.statusText);
    }
    return res.json() as Promise<Upload>;
  },
  get: (uploadPublicId: string) =>
    jsonFetch<Upload>(`/api/v1/uploads/${uploadPublicId}`),
};

export const conversationsApi = {
  get: (publicId: string) =>
    jsonFetch<ConversationDetail>(`/api/v1/conversations/${publicId}`),
};
