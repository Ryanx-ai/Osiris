import { existsSync, readdirSync, mkdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

// Only deliberate, three-part public exports are included in the deployment.
// No catch-all rewrite: unknown client links must never open the authoring app.
export function copyPublishedDecks(source, destination) {
  if (!existsSync(source)) return 0;
  let count = 0;
  function walk(directory, segments = []) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (segments.length === 0 && entry.name === 'README.md') continue;
      if (entry.isSymbolicLink()) throw new Error('Published pages cannot contain symlinks');
      const path = join(directory, entry.name);
      if (entry.isDirectory() && segments.length < 3 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.name)) {
        walk(path, [...segments, entry.name]);
      } else if (entry.isFile() && segments.length === 3 && entry.name === 'index.html') {
        const target = join(destination, ...segments);
        mkdirSync(target, { recursive: true });
        copyFileSync(path, join(target, 'index.html'));
        count++;
      } else {
        throw new Error(`Invalid publication path: ${[...segments, entry.name].join('/')}`);
      }
    }
  }
  walk(source);
  return count;
}
