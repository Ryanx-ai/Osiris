export const FOUNDERS = new Set(['ryanchinqf2@gmail.com', 'mohamedizzatamin@gmail.com']);
export const PUBLIC_ORIGIN = 'https://www.osirisdeck.com';
export function founderIdentity(user) {
  if (!user || user.banned || user.locked) return null;
  const email = user.emailAddresses?.find(e => e.id === user.primaryEmailAddressId);
  const address = email?.emailAddress?.trim().toLowerCase();
  return email?.verification?.status === 'verified' && FOUNDERS.has(address)
    ? {id: user.id, email: address} : null;
}
export function allowedOrigins(env = process.env) {
  const origins = [PUBLIC_ORIGIN, 'https://osirisdeck.com', 'https://osiris-pangea6.vercel.app', 'https://osiris-ebon-kappa.vercel.app'];
  if (env.VERCEL_ENV !== 'production') {
    origins.push('http://localhost:3000', 'http://localhost:3001');
    if (env.VERCEL_URL) origins.push('https://' + env.VERCEL_URL);
  }
  return origins;
}
export function validSlug(slug) {
  return typeof slug === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 80;
}
export const publicationPath = slug => `publications/vertical-institute/${slug}.json`;
export function validatePublication(body) {
  if (!body || !validSlug(body.slug)) return 'Use a project name with lowercase letters, numbers and single hyphens (up to 80 characters).';
  if (typeof body.html !== 'string' || !/^<!doctype html>/i.test(body.html) || !body.html.includes('</html>')) return 'A complete proposal is required.';
  if (Buffer.byteLength(body.html, 'utf8') > 3_000_000) return 'This proposal is too large to share (3 MB maximum).';
  return null;
}
