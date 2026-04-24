/**
 * Safely parse a fetch Response as JSON.
 * Returns null if the response is not valid JSON (e.g., HTML error page).
 * Logs a warning for debugging.
 */
export async function safeJson<T = unknown>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    console.warn(
      `[safeJson] Non-JSON response from ${res.url} (status ${res.status})`
    );
    return null;
  }
}
