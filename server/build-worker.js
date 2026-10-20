/* Собирает server/dist/worker.js — один файл для Cloudflare Workers (вставить в редактор в браузере).
   Запуск: node server/build-worker.js */
const fs = require('fs');
const path = require('path');

const bot = fs.readFileSync(path.join(__dirname, 'bot.js'), 'utf8')
  .replace(/module\.exports\s*=\s*\{[^}]*\};?\s*$/, '');

const entry = `
/* ---------- вход Cloudflare Workers ---------- */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const body = request.method === 'POST' ? await request.text() : '';
    const r = await route({
      method: request.method,
      headers: Object.fromEntries(request.headers),
      query: Object.fromEntries(url.searchParams),
      body,
    }, env);
    return new Response(r.status === 204 ? null : r.body, { status: r.status, headers: r.headers || {} });
  },
};
`;

const out = `/* SRV Detailing: бот-менеджер для Cloudflare Workers. Собрано из server/bot.js — правьте там и пересоберите. */\n` + bot + entry;
fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'dist', 'worker.js'), out);
console.log('dist/worker.js', out.length, 'bytes');
