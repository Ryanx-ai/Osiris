import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {requireFounder} from '../lib/auth.mjs';
import {privateResponse, fail} from '../lib/http.mjs';
export default async function handler(req, res) {
  privateResponse(res);
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const user = await requireFounder(req);
    const html = await readFile(join(process.cwd(), '.private/builder.html'), 'utf8');
    res.json({user, html});
  } catch (error) { fail(res, error); }
}
