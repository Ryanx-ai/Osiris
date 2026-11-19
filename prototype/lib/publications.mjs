import {createHash} from 'node:crypto';
import {HttpError} from './http.mjs';
import {validatePublication, publicationPath, PUBLIC_ORIGIN} from './access.mjs';
export async function publishSnapshot(user, body, storage) {
  const invalid = validatePublication(body);
  if (invalid) throw new HttpError(400, invalid);
  const {slug, html} = body;
  const path = publicationPath(slug);
  const hash = createHash('sha256').update(html).digest('hex');
  const record = {version:1, ownerId:user.id, hash, html, publishedAt:new Date().toISOString()};
  try {
    await storage.put(path, JSON.stringify(record), {access:'private', addRandomSuffix:false, allowOverwrite:false, contentType:'application/json'});
  } catch (error) {
    // A create-only write is atomic. Never overwrite or disclose another author's record.
    let existing;
    try { existing = await storage.get(path, {access:'private', useCache:false}); } catch { throw error; }
    if (!existing?.stream) throw error;
    const previous = await new Response(existing.stream).json();
    if (previous?.ownerId !== user.id || previous?.hash !== hash) throw new HttpError(409, 'This link already exists. Choose a new name (for example, add -v2). Existing links keep their published version.');
  }
  return {url:`${PUBLIC_ORIGIN}/vertical-institute/${slug}`, slug};
}
