/**
 * Tracer-bullet tests para lib/api.ts — deja la infra de Vitest andando y cubre
 * el contrato del fetch wrapper: ApiError, token attach, mapeo de error y 204.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock del cliente Supabase: controlamos qué token devuelve getSession().
const getSession = vi.fn();
vi.mock("@/utils/supabase/client", () => ({
  createClient: () => ({ auth: { getSession } }),
}));

import { ApiError, api, apiFetch } from "@/lib/api";

describe("ApiError", () => {
  it("lleva status y message", () => {
    const err = new ApiError(404, "Not Found");
    expect(err).toBeInstanceOf(Error);
    expect(err.status).toBe(404);
    expect(err.message).toBe("Not Found");
    expect(err.name).toBe("ApiError");
  });
});

describe("apiFetch", () => {
  beforeEach(() => {
    getSession.mockReset();
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function mockFetchOk(body: unknown, status = 200) {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      statusText: "OK",
      json: async () => body,
    });
  }

  it("adjunta Authorization: Bearer cuando hay sesión", async () => {
    getSession.mockResolvedValue({
      data: { session: { access_token: "tok-123" } },
    });
    mockFetchOk({ ok: true });

    await apiFetch("/api/v1/me");

    const [, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(options.headers.Authorization).toBe("Bearer tok-123");
  });

  it("NO manda Authorization cuando no hay sesión", async () => {
    getSession.mockResolvedValue({ data: { session: null } });
    mockFetchOk({ ok: true });

    await apiFetch("/api/v1/me");

    const [, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(options.headers.Authorization).toBeUndefined();
  });

  it("lanza ApiError con el detail del body en respuestas no-ok", async () => {
    getSession.mockResolvedValue({ data: { session: null } });
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 403,
      statusText: "Forbidden",
      json: async () => ({ detail: "sin permisos" }),
    });

    await expect(apiFetch("/api/v1/secret")).rejects.toMatchObject({
      status: 403,
      message: "sin permisos",
    });
  });

  it("devuelve undefined en 204 sin parsear body", async () => {
    getSession.mockResolvedValue({ data: { session: null } });
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 204,
      statusText: "No Content",
      json: async () => {
        throw new Error("no debería parsear 204");
      },
    });

    await expect(api.del("/api/v1/conversations/abc")).resolves.toBeUndefined();
  });
});
