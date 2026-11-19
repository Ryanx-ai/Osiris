import {readFileSync} from 'node:fs';

// Resolve from this module, not the function's working directory. Vercel bundles
// src/ and assets/ with the editor function; no generated build file is required.
const root = new URL('../', import.meta.url);
export function renderDocument(entry, {seeds = ''} = {}) {
  const text = path => readFileSync(new URL(path, root), 'utf8');
  const base64 = path => readFileSync(new URL(path, root)).toString('base64');
  const expand = source => source
    .replace(/@@file:([^@]+)@@/g, (_, path) => expand(text(path)))
    .replace(/@@b64:([^@]+)@@/g, (_, path) => base64(path))
    .replace('@@seeds@@', () => seeds);
  const html = expand(text(entry));
  if (/@@(?:file|b64):|@@seeds@@/.test(html)) throw new Error('Unexpanded builder marker');
  return html;
}
export function renderBuilder() {
  // Authenticated production requests must never load local client seed files.
  return renderDocument('src/index.html');
}
