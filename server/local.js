/* Вход для обычного сервера (VPS): node server/local.js, порт из PORT (по умолчанию 8080).
   Переменные окружения те же, что в bot.js. Поставьте перед ним nginx с HTTPS. */
const http = require('http');
const { route } = require('./bot');

http.createServer((req, res) => {
  let body = '';
  req.on('data', c => { body += c; if (body.length > 1e6) req.destroy(); });
  req.on('end', async () => {
    const u = new URL(req.url, 'http://x');
    const r = await route({ method: req.method, headers: req.headers, query: Object.fromEntries(u.searchParams), body }, process.env);
    res.writeHead(r.status, r.headers || {}); res.end(r.body);
  });
}).listen(Number(process.env.PORT) || 8080, () => console.log('SRV bot on', Number(process.env.PORT) || 8080));
