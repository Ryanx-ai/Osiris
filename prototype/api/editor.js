import {renderBuilder} from '../lib/builder.mjs';
import {requireFounder} from '../lib/auth.mjs';
import {privateResponse, fail} from '../lib/http.mjs';
export default async function handler(req, res) {
  privateResponse(res);
  if (req.method !== 'GET') return res.status(405).end();
  let stage = 'authenticate';
  try {
    const user = await requireFounder(req);
    stage = 'render-builder';
    res.json({user, html:renderBuilder()});
  } catch (error) { fail(res, error, stage); }
}
