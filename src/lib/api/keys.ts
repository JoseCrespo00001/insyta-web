export const queryKeys = {
  projects: {
    all: ["projects"] as const,
    list: () => [...queryKeys.projects.all, "list"] as const,
    detail: (publicId: string) =>
      [...queryKeys.projects.all, "detail", publicId] as const,
    metrics: (
      publicId: string,
      params: { from?: string; to?: string; agent_id?: string } = {},
    ) =>
      [
        ...queryKeys.projects.all,
        "metrics",
        publicId,
        params.from ?? "",
        params.to ?? "",
        params.agent_id ?? "",
      ] as const,
    agents: (publicId: string) =>
      [...queryKeys.projects.all, "agents", publicId] as const,
    topProblematic: (
      publicId: string,
      params: { from?: string; to?: string; agent_id?: string } = {},
    ) =>
      [
        ...queryKeys.projects.all,
        "top-problematic",
        publicId,
        params.from ?? "",
        params.to ?? "",
        params.agent_id ?? "",
      ] as const,
  },
  uploads: {
    detail: (publicId: string) => ["uploads", publicId] as const,
  },
  conversations: {
    detail: (publicId: string) => ["conversations", publicId] as const,
  },
};
