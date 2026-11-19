import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { copyPublishedDecks } from './published.mjs';

test('publishes a recipient export at its three-part URL without replacing the builder', () => {
  const root = mkdtempSync(join(tmpdir(), 'osiris-test-'));
  try {
    const source = join(root, 'published'), output = join(root, 'dist');
    const route = 'vertical-institute/consultant-name/client-companya';
    mkdirSync(join(source, route), { recursive: true });
    mkdirSync(output);
    writeFileSync(join(output, 'index.html'), 'builder');
    writeFileSync(join(source, route, 'index.html'), '<html>recipient</html>');
    assert.equal(copyPublishedDecks(source, output), 1);
    assert.equal(readFileSync(join(output, route, 'index.html'), 'utf8'), '<html>recipient</html>');
    assert.equal(readFileSync(join(output, 'index.html'), 'utf8'), 'builder');
    assert.equal(existsSync(join(output, 'unknown/index.html')), false);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('rejects private data files and symlinks in the publication tree', () => {
  const root = mkdtempSync(join(tmpdir(), 'osiris-test-'));
  try {
    const source = join(root, 'published');
    mkdirSync(source);
    writeFileSync(join(source, 'draft.local.json'), '{}');
    assert.throws(() => copyPublishedDecks(source, join(root, 'out')), /Invalid publication/);
    rmSync(join(source, 'draft.local.json'));
    symlinkSync(root, join(source, 'linked'));
    assert.throws(() => copyPublishedDecks(source, join(root, 'out')), /symlinks/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
