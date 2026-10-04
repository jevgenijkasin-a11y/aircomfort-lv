// Runs after `next build`: makes sure the site CSS and the admin CSS were each
// compiled with their own Tailwind config. If the configs get mixed up, site
// classes (cards, buttons) silently disappear — the build fails instead.
import fs from 'fs';
import path from 'path';

const dir = path.join(process.cwd(), '.next', 'static', 'css');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.css')).map((f) => ({ f, css: fs.readFileSync(path.join(dir, f), 'utf8') }));

const site = files.filter(({ css }) => css.includes('.glass-card') && css.includes('.pc-ib'));
const admin = files.filter(({ css }) => css.includes('.menu-item'));
const problems = [];
if (!site.length) problems.push('no CSS file with the site classes (.glass-card, .pc-ib)');
if (!admin.length) problems.push('no CSS file with the admin classes (.menu-item)');
for (const { f, css } of site) if (css.includes('.menu-item') || css.includes('bg-brand-500')) problems.push(`${f}: admin classes inside the site CSS`);
for (const { f, css } of admin) if (css.includes('.glass-card')) problems.push(`${f}: site classes inside the admin CSS`);

if (problems.length) {
  console.error('\n[check-css] Tailwind configs mixed up:\n  ' + problems.join('\n  ') + '\n');
  process.exit(1);
}
console.log(`[check-css] ok — site CSS: ${site.map((x) => x.f).join(', ')}; admin CSS: ${admin.map((x) => x.f).join(', ')}`);
