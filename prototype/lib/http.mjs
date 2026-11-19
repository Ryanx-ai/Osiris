export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export function fail(res, error, stage = 'request') {
  const status = error instanceof HttpError ? error.status : 503;
  if (status === 503) console.error('OSIRIS request failed', {stage, name:error?.name, code:error?.code || null, status:error?.status || null});
  res.status(status).json({error: status === 503 ? 'Service temporarily unavailable. Please try again.' : error.message});
}
export function privateResponse(res) {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
}
