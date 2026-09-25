// Retry transient failures once; never leave a rider request pending forever.
export async function riderRequest(url, { signal, timeoutMs = 12000 } = {}) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    signal?.throwIfAborted();
    const controller = new AbortController();
    const cancel = () => controller.abort(signal.reason);
    signal?.addEventListener("abort", cancel, { once: true });
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        const error = new Error("Rider data could not be loaded.");
        error.status = response.status;
        throw error;
      }
      return await response.json();
    } catch (error) {
      if (signal?.aborted) throw error;
      const retryable = !error.status || error.status === 429 || error.status >= 500;
      if (!retryable || attempt === 1) throw error;
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", cancel);
    }
  }
}
