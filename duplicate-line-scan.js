const fs = require('fs');
const path = require('path');
const root = process.cwd();
const exts = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.html', '.css', '.txt', '.yml', '.yaml']);
function walk(dir) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    if (name.name === 'node_modules' || name.name === '.git') continue;
    const p = path.join(dir, name.name);
    if (name.isDirectory()) {
      walk(p);
      continue;
    }
    if (!exts.has(path.extname(name.name).toLowerCase())) continue;
    const text = fs.readFileSync(p, 'utf8');
    const lines = text.split(/\r?\n/);
    const counts = new Map();
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      const arr = counts.get(line) || [];
      arr.push(i + 1);
      counts.set(line, arr);
    }
    const dups = [...counts.entries()].filter(([, idx]) => idx.length > 1);
    if (dups.length) {
      console.log('FILE', path.relative(root, p));
      for (const [line, idx] of dups) {
        console.log('  COUNT', idx.length, 'LINES', idx.join(','), JSON.stringify(line));
      }
    }
  }
}
walk(root);
