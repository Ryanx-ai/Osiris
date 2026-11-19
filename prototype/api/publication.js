import {get} from '@vercel/blob';
import {validSlug, publicationPath} from '../lib/access.mjs';
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  if (!['GET', 'HEAD'].includes(req.method)) return res.status(405).end();
  const slug = req.query.slug;
  if (!validSlug(slug)) return res.status(404).send('Proposal not found.');
  try {
    const result = await get(publicationPath(slug), {access:'private', useCache:false});
    if (!result || result.statusCode !== 200) return res.status(404).send('Proposal not found.');
    const record = await new Response(result.stream).json();
    // Published HTML is active content: isolate it from the author's cookies/storage.
    // Modals permit print dialogs; forms/downloads preserve the existing recipient flow.
    res.setHeader('Content-Security-Policy', "sandbox allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals");
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return req.method === 'HEAD' ? res.status(200).end() : res.status(200).send(record.html);
  } catch (error) {
    if (error.name === 'BlobNotFoundError') return res.status(404).send('Proposal not found.');
    console.error('Publication unavailable', error?.name);
    res.status(503).send('This proposal is temporarily unavailable. Please try again.');
  }
}
