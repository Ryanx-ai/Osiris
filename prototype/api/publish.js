import {get, put} from '@vercel/blob';
import {requireFounder} from '../lib/auth.mjs';
import {privateResponse, fail, HttpError} from '../lib/http.mjs';
import {publishSnapshot} from '../lib/publications.mjs';
export default async function handler(req, res) {
  privateResponse(res);
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const user = await requireFounder(req);
    if (!req.headers['content-type']?.startsWith('application/json')) throw new HttpError(415, 'Expected JSON.');
    let body;
    try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; }
    catch { throw new HttpError(400, 'Invalid proposal.'); }
    res.status(201).json(await publishSnapshot(user, body, {get, put}));
  } catch (error) { fail(res, error); }
}
