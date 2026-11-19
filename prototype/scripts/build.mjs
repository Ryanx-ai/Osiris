#!/usr/bin/env node
/**
 * Osiris build: reassembles src/ + assets/ into one self-contained dist/index.html.
 *
 *   node scripts/build.mjs            local build (includes data/seed-drafts.local.js if present)
 *   node scripts/build.mjs --public   public build (never includes client seed drafts)
 *
 * Markers in the sources:
 *   @@file:<path>@@   replaced with the file's text (used in src/index.html)
 *   @@b64:<path>@@    replaced with the file's bytes as base64 (images, fonts)
 *   @@seeds@@         replaced with data/seed-drafts.local.js, or nothing for a public build
 *
 * The builder is server-only; dist contains the public sign-in shell.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = process.argv.includes('--public') || process.env.VERCEL === '1' || process.env.OSIRIS_PUBLIC === '1';
const SEEDS = join(ROOT, 'data/seed-drafts.local.js');

const text = rel => readFileSync(join(ROOT, rel), 'utf8');
const b64 = rel => readFileSync(join(ROOT, rel)).toString('base64');

function expand(src) {
  return src
    .replace(/@@file:([^@]+)@@/g, (_, rel) => expand(text(rel)))
    .replace(/@@b64:([^@]+)@@/g, (_, rel) => b64(rel))
    .replace('@@seeds@@', () => (!PUBLIC && existsSync(SEEDS)) ? readFileSync(SEEDS, 'utf8') : '');
}

const html = expand(text('src/index.html'));
if (/@@(file|b64):|@@seeds@@/.test(html)) throw new Error('Unexpanded marker left in output');

// Rebuild from scratch so withdrawn publications cannot survive locally.
rmSync(join(ROOT, 'dist'), { recursive: true, force: true });
mkdirSync(join(ROOT, 'dist'), { recursive: true });
mkdirSync(join(ROOT, '.private'), { recursive: true });
writeFileSync(join(ROOT, '.private/builder.html'), html);
writeFileSync(join(ROOT, 'dist/index.html'), expand(text('src/login.html')));
const sha = createHash('sha256').update(html).digest('hex');
console.log(`.private/builder.html  ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB  sha256 ${sha}  ${PUBLIC ? '(public: no client seeds)' : existsSync(SEEDS) ? '(local: with client seeds)' : '(no seeds file)'}`);
