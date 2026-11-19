import test from 'node:test';
import assert from 'node:assert/strict';
import {cp, mkdir, mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL, fileURLToPath} from 'node:url';
import vm from 'node:vm';

// Reproduce a server function bundle containing source assets but no .private
// output. Its working directory also differs from the original project root.
test('server-only builder renders in an isolated bundle without generated HTML', async () => {
  const fixture = await mkdtemp(join(tmpdir(), 'osiris-builder-bundle-'));
  const root = fileURLToPath(new URL('../', import.meta.url));
  const before = process.cwd();
  try {
    await mkdir(join(fixture, 'lib'));
    await Promise.all([
      cp(join(root, 'src'), join(fixture, 'src'), {recursive:true}),
      cp(join(root, 'assets'), join(fixture, 'assets'), {recursive:true}),
      cp(join(root, 'lib/builder.mjs'), join(fixture, 'lib/builder.mjs'))
    ]);
    process.chdir(tmpdir());
    const {renderBuilder} = await import(pathToFileURL(join(fixture, 'lib/builder.mjs')));
    const html = renderBuilder();
    assert.ok(html.includes('id="share-deck"'));
    assert.ok(html.includes('id="account-signout"'));
    assert.ok(html.includes('data:image/svg+xml;base64,'));
    assert.ok(!/@@(?:file|b64):|@@seeds@@/.test(html));
    assert.ok(!html.includes('seed-drafts.local.js'));
    assert.ok(html.includes('id="preview-fullscreen"'));
    for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
      if (/type="(?:text\/plain|application\/json)"/.test(match[1])) continue;
      assert.doesNotThrow(() => new vm.Script(match[2]), 'assembled executable script must parse');
    }
  } finally {
    process.chdir(before);
    await rm(fixture, {recursive:true,force:true});
  }
});
