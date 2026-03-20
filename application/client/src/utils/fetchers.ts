export class HTTPError<T = unknown> extends Error {
  responseJSON: T | null;
  status: number;

  constructor(message: string, status: number, responseJSON: T | null) {
    super(message);
    this.name = "HTTPError";
    this.status = status;
    this.responseJSON = responseJSON;
  }
}

async function readResponseJSON(response: Response): Promise<unknown | null> {
  const contentType = response.headers.get("Content-Type");
  if (contentType?.includes("application/json")) {
    return await response.json();
  }
  return null;
}

async function fetchWithError(url: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...init,
  });

  if (!response.ok) {
    const responseJSON = await readResponseJSON(response);
    const message =
      typeof responseJSON === "object" &&
      responseJSON !== null &&
      "message" in responseJSON &&
      typeof responseJSON.message === "string"
        ? responseJSON.message
        : response.statusText;

    throw new HTTPError(message, response.status, responseJSON);
  }

  return response;
}

export async function fetchBinary(url: string): Promise<ArrayBuffer> {
  return await (await fetchWithError(url)).arrayBuffer();
}

export async function fetchJSON<T>(url: string): Promise<T> {
  return (await (await fetchWithError(url)).json()) as T;
}

export async function sendFile<T>(url: string, file: File): Promise<T> {
  return (await (
    await fetchWithError(url, {
      body: file,
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
      },
    })
  ).json()) as T;
}

export async function sendJSON<T>(url: string, data: object): Promise<T> {
  return (await (
    await fetchWithError(url, {
      body: JSON.stringify(data),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
  ).json()) as T;
}
