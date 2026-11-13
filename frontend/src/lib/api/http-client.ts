export type ErrorDetail = { field: string; message: string };

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: ErrorDetail[];

  constructor(status: number, code: string, message: string, details: ErrorDetail[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const GENERIC_MESSAGE = "Đã có lỗi xảy ra, vui lòng thử lại sau.";

type RequestOptions = { method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; body?: unknown; fetcher?: typeof fetch };

type ErrorEnvelope = { error?: { code?: string; message?: string; details?: ErrorDetail[] } };

export const request = async <T>(path: string, { method = "GET", body, fetcher = fetch }: RequestOptions = {}): Promise<T> => {
  let response: Response;
  try {
    response = await fetcher(`/api/v1${path}`, {
      method,
      credentials: "same-origin",
      headers: body === undefined ? undefined : { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Không kết nối được máy chủ. Vui lòng kiểm tra mạng và thử lại.");
  }
  if (response.status === 204) return undefined as T;
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = (payload as ErrorEnvelope | null)?.error;
    throw new ApiError(response.status, error?.code ?? "UNKNOWN_ERROR", error?.message ?? GENERIC_MESSAGE, error?.details ?? []);
  }
  return payload as T;
};

export const errorText = (error: unknown) => {
  if (!error) return undefined;
  if (error instanceof ApiError && error.details.length > 0) return error.details.map((detail) => detail.message).join(" ");
  return error instanceof Error ? error.message : GENERIC_MESSAGE;
};
