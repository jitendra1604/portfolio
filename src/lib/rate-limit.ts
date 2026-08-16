// In-memory, per-instance rate limiting — resets on redeploy and doesn't
// share state across serverless instances/regions. Good enough as basic
// abuse mitigation, not a hard guarantee.
export function createRateLimiter(windowMs: number, maxRequests: number) {
  const requests = new Map<string, number[]>();

  return function isRateLimited(key: string) {
    const now = Date.now();
    const recent = (requests.get(key) ?? []).filter((time) => now - time < windowMs);
    if (recent.length >= maxRequests) {
      requests.set(key, recent);
      return true;
    }
    requests.set(key, [...recent, now]);
    return false;
  };
}

export function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
