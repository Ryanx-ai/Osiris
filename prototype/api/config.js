import {PUBLIC_ORIGIN} from '../lib/access.mjs';
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).end();
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) return res.status(503).json({error:'Sign-in is not configured yet.'});
  res.json({publishableKey, signInOrigin: process.env.VERCEL_ENV === 'production' ? PUBLIC_ORIGIN : null});
}
