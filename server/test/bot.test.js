/* Проверка бота без интернета: Telegram подменён записью вызовов. Запуск: node server/test/bot.test.js */
const assert = require('assert');
const crypto = require('crypto');
const { route } = require('../bot');

const env = { BOT_TOKEN: '123:TEST', MANAGER_CHAT_ID: '777', WEBHOOK_SECRET: 's3cret', PUBLIC_URL: 'https://srv-bot.example.workers.dev', ALLOW_ORIGIN: 'https://berghhman.github.io' };
let calls = [], reply = () => ({ ok: true, result: {} });
const fetch = async (url, opt) => {
  const method = url.split('/').pop();
  const payload = opt.body instanceof FormData ? Object.fromEntries([...opt.body.entries()].map(([k, v]) => [k, typeof v === 'string' ? v : { type: v.type, size: v.size }])) : JSON.parse(opt.body);
  calls.push({ method, payload }); return { json: async () => reply(method, payload) };
};
const deps = { fetch };
const req = (body, headers = {}) => route({ method: 'POST', headers, query: {}, body: JSON.stringify(body) }, env, deps);
const tgHdr = { 'X-Telegram-Bot-Api-Secret-Token': 's3cret' };

function initData(user, token = env.BOT_TOKEN, authDate = Math.floor(Date.now() / 1000)) {
  const p = new URLSearchParams({ auth_date: String(authDate), query_id: 'AAE', user: JSON.stringify(user) });
  const check = [...p.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, v]) => `${k}=${v}`).join('\n');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
  p.set('hash', crypto.createHmac('sha256', secret).update(check).digest('hex'));
  return p.toString();
}
const client = { id: 5551, first_name: 'Алексей', username: 'alex_camry' };
const t = async (name, fn) => { calls = []; reply = () => ({ ok: true, result: {} }); await fn(); console.log('ok  ', name); };

(async () => {
  await t('заявка из мини-аппа уходит менеджеру с кнопками и подтверждением клиенту', async () => {
    const r = await req({ text: 'Заявка SRV-12345 из мини-приложения SRV\nТелефон: +7 (921) 000-00-00\nУслуги:\n• Плёнка: пакет «Оптима» — от 45 000 ₽', initData: initData(client) });
    assert.equal(r.status, 200);
    assert.equal(r.headers['Access-Control-Allow-Origin'], 'https://berghhman.github.io');
    const [toMgr, toClient] = calls;
    assert.equal(toMgr.payload.chat_id, '777');
    assert.match(toMgr.payload.text, /^Новая запись, \d\d:\d\d\nTelegram: Алексей \(@alex_camry\)/);
    assert.match(toMgr.payload.text, /пакет «Оптима»/);
    assert.match(toMgr.payload.text, /#id5551$/);
    assert.deepEqual(toMgr.payload.reply_markup.inline_keyboard[0].map(b => b.callback_data), ['a:5551', 'c:5551']);
    assert.equal(toMgr.payload.reply_markup.inline_keyboard[1][0].url, 'https://t.me/alex_camry');
    assert.equal(toClient.payload.chat_id, 5551);
  });

  await t('фото из заявки на запчасти уходит менеджеру ответом на заявку', async () => {
    reply = m => (m === 'sendMessage' ? { ok: true, result: { message_id: 42 } } : { ok: true });
    const jpeg = 'data:image/jpeg;base64,' + Buffer.from('fake-jpeg-bytes').toString('base64');
    const r = await req({ text: 'Заявка: вмятина на двери', initData: initData(client), photo: jpeg });
    assert.equal(r.status, 200);
    assert.deepEqual(calls.map(c => c.method), ['sendMessage', 'sendPhoto', 'sendMessage']);
    const ph = calls[1].payload;
    assert.equal(ph.chat_id, '777');
    assert.match(ph.caption, /#id5551$/);
    assert.equal(JSON.parse(ph.reply_parameters).message_id, 42);
    assert.deepEqual(ph.photo, { type: 'image/jpeg', size: 15 });
  });

  await t('не-картинка вместо фото не отправляется', async () => {
    await req({ text: 'x', initData: initData(client), photo: 'data:text/html;base64,PGgxPg==' });
    assert.deepEqual(calls.map(c => c.method), ['sendMessage', 'sendMessage']);
  });

  await t('поддельная или чужая подпись отклоняется', async () => {
    assert.equal((await req({ text: 'x', initData: initData(client, '999:OTHER') })).status, 403);
    assert.equal((await req({ text: 'x', initData: '' })).status, 403);
    assert.equal((await req({ text: 'x', initData: initData(client, env.BOT_TOKEN, 1000) })).status, 403);
    assert.equal(calls.length, 0);
  });

  await t('клиент без ника: нет кнопки со ссылкой, заявка всё равно уходит', async () => {
    await req({ text: 'Заявка: консультация', initData: initData({ id: 42, first_name: 'Ира' }) });
    assert.equal(calls[0].payload.reply_markup.inline_keyboard.length, 1);
  });

  await t('вебхук без секрета отклоняется', async () => {
    const r = await req({ update_id: 1, message: { message_id: 1, chat: { id: 5551, type: 'private' }, from: client, text: 'привет' } });
    assert.equal(r.status, 403); assert.equal(calls.length, 0);
  });

  await t('/start клиенту: приветствие, кнопка приложения и маршрут', async () => {
    await req({ update_id: 2, message: { message_id: 1, chat: { id: 5551, type: 'private' }, from: client, text: '/start' } }, tgHdr);
    assert.equal(calls[0].method, 'sendPhoto');
    assert.equal(calls[0].payload.photo, 'https://berghhman.github.io/srv-miniapp/img/cover.png');
    const kb = calls[0].payload.reply_markup.inline_keyboard;
    assert.equal(kb[0][0].web_app.url, 'https://berghhman.github.io/srv-miniapp/');
    assert.equal(kb[1][0].web_app.url, 'https://berghhman.github.io/srv-miniapp/?startapp=works');
    assert.match(kb[1][1].url, /yandex\.ru\/maps/);
    assert.match(calls[0].payload.caption, /Симонова, 11/);
    // фото не отправилось — приветствие уходит текстом
    calls = []; reply = m => (m === 'sendPhoto' ? { ok: false, description: 'Bad Request: wrong file' } : { ok: true });
    await req({ update_id: 2, message: { message_id: 1, chat: { id: 5551, type: 'private' }, from: client, text: '/start' } }, tgHdr);
    assert.deepEqual(calls.map(c => c.method), ['sendPhoto', 'sendMessage']);
    assert.match(calls[1].payload.text, /Симонова, 11/);
  });

  await t('/start с меткой из рекламы открывает нужный раздел', async () => {
    await req({ update_id: 2, message: { message_id: 1, chat: { id: 5551, type: 'private' }, from: client, text: '/start ppf' } }, tgHdr);
    assert.equal(calls[0].payload.reply_markup.inline_keyboard[0][0].web_app.url, 'https://berghhman.github.io/srv-miniapp/?startapp=ppf');
    assert.equal(calls[0].method, 'sendPhoto');
  });

  await t('текст клиента приходит менеджеру с номером клиента', async () => {
    await req({ update_id: 3, message: { message_id: 9, chat: { id: 5551, type: 'private' }, from: client, text: 'Сколько стоит керамика на Camry?' } }, tgHdr);
    assert.equal(calls[0].payload.chat_id, '777');
    assert.match(calls[0].payload.text, /Сколько стоит керамика на Camry\?\n\n#id5551$/);
  });

  await t('фото клиента: копия с подписью и номером', async () => {
    await req({ update_id: 4, message: { message_id: 10, chat: { id: 5551, type: 'private' }, from: client, photo: [{}], caption: 'вот такой скол' } }, tgHdr);
    assert.equal(calls[0].method, 'copyMessage');
    assert.match(calls[0].payload.caption, /вот такой скол\n\n#id5551$/);
  });

  await t('стикер: заголовок с номером, затем копия', async () => {
    await req({ update_id: 5, message: { message_id: 11, chat: { id: 5551, type: 'private' }, from: client, sticker: {} } }, tgHdr);
    assert.deepEqual(calls.map(c => c.method), ['sendMessage', 'copyMessage']);
    assert.match(calls[0].payload.text, /#id5551$/);
  });

  await t('ответ менеджера на сообщение клиента уходит клиенту', async () => {
    await req({ update_id: 6, message: { message_id: 50, chat: { id: 777, type: 'private' }, from: { id: 777, first_name: 'Дима' }, text: 'Керамика Krytex — от 25 000 ₽', reply_to_message: { message_id: 49, text: 'Сообщение от клиента\nАлексей\n\nСколько?\n\n#id5551' } } }, tgHdr);
    assert.equal(calls[0].method, 'copyMessage');
    assert.deepEqual([calls[0].payload.chat_id, calls[0].payload.from_chat_id, calls[0].payload.message_id], ['5551', 777, 50]);
  });

  await t('ответ на фото клиента (номер в подписи) тоже доходит', async () => {
    await req({ update_id: 7, message: { message_id: 51, chat: { id: 777, type: 'private' }, from: { id: 777 }, voice: {}, reply_to_message: { message_id: 48, caption: 'Сообщение от клиента\n\n#id5551' } } }, tgHdr);
    assert.equal(calls[0].payload.chat_id, '5551');
  });

  await t('клиент заблокировал бота: менеджер узнаёт об этом', async () => {
    reply = m => (m === 'copyMessage' ? { ok: false, description: 'Forbidden: bot was blocked by the user' } : { ok: true });
    await req({ update_id: 8, message: { message_id: 52, chat: { id: 777, type: 'private' }, from: { id: 777 }, text: 'ау', reply_to_message: { message_id: 49, text: 'x\n\n#id5551' } } }, tgHdr);
    assert.match(calls[1].payload.text, /клиент остановил бота/);
  });

  await t('сообщение менеджера не ответом: подсказка, как отвечать', async () => {
    await req({ update_id: 9, message: { message_id: 53, chat: { id: 777, type: 'private' }, from: { id: 777 }, text: 'привет' } }, tgHdr);
    assert.match(calls[0].payload.text, /ответьте на его сообщение/);
    assert.match(calls[0].payload.text, /\/post/);
  });

  await t('в рабочей группе обычная переписка менеджеров игнорируется', async () => {
    const genv = { ...env, MANAGER_CHAT_ID: '-100500' };
    calls = [];
    await route({ method: 'POST', headers: tgHdr, query: {}, body: JSON.stringify({ update_id: 10, message: { message_id: 1, chat: { id: -100500, type: 'supergroup' }, from: { id: 1 }, text: 'кто возьмёт?' } }) }, genv, deps);
    assert.equal(calls.length, 0);
  });

  await t('«Принять»: статус в заявке и уведомление клиенту', async () => {
    const msg = { message_id: 70, chat: { id: 777 }, text: 'Новая запись, 13:10\nTelegram: Алексей\n\nЗаявка SRV-12345\n\n#id5551', reply_markup: { inline_keyboard: [[{ text: 'Принять', callback_data: 'a:5551' }, { text: 'Закрыть', callback_data: 'c:5551' }], [{ text: 'Открыть чат с клиентом', url: 'https://t.me/alex_camry' }]] } };
    await req({ update_id: 11, callback_query: { id: 'q1', from: { id: 777, first_name: 'Дима' }, data: 'a:5551', message: msg } }, tgHdr);
    const edit = calls.find(c => c.method === 'editMessageText');
    assert.match(edit.payload.text, /Статус: Принята: Дима, \d\d:\d\d\n\n#id5551$/);
    assert.deepEqual(edit.payload.reply_markup.inline_keyboard.map(r => r[0].text), ['Закрыть', 'Открыть чат с клиентом']);
    assert.ok(calls.some(c => c.method === 'sendMessage' && c.payload.chat_id === '5551'));
    // потом «Закрыть»: статус заменяется, клиенту ничего не уходит
    calls = [];
    await req({ update_id: 12, callback_query: { id: 'q2', from: { id: 777, first_name: 'Дима' }, data: 'c:5551', message: { ...msg, text: edit.payload.text, reply_markup: edit.payload.reply_markup } } }, tgHdr);
    const e2 = calls.find(c => c.method === 'editMessageText');
    assert.equal((e2.payload.text.match(/Статус:/g) || []).length, 1);
    assert.match(e2.payload.text, /Закрыта: Дима/);
    assert.ok(!calls.some(c => c.method === 'sendMessage'));
  });

  await t('кнопки работают только в чате менеджера', async () => {
    await req({ update_id: 13, callback_query: { id: 'q3', from: { id: 5551 }, data: 'a:5551', message: { message_id: 1, chat: { id: 5551 }, text: '#id5551' } } }, tgHdr);
    assert.deepEqual(calls.map(c => c.method), ['answerCallbackQuery']);
  });

  await t('/id показывает номер чата', async () => {
    await req({ update_id: 14, message: { message_id: 1, chat: { id: 5551, type: 'private' }, from: client, text: '/id' } }, tgHdr);
    assert.match(calls[0].payload.text, /5551/);
  });

  await t('настройка по ссылке только с секретом', async () => {
    const bad = await route({ method: 'GET', headers: {}, query: { setup: 'nope' }, body: '' }, env, deps);
    assert.equal(bad.status, 403);
    const ok = await route({ method: 'GET', headers: {}, query: { setup: 's3cret' }, body: '' }, env, deps);
    assert.equal(ok.status, 200);
    assert.deepEqual(calls.map(c => c.method), ['setWebhook', 'setChatMenuButton', 'setMyCommands', 'setMyDescription', 'setMyShortDescription', 'setMyCommands']);
    assert.equal(calls[1].payload.menu_button.text, 'Записаться');
    assert.equal(calls[1].payload.menu_button.web_app.url, 'https://berghhman.github.io/srv-miniapp/');
    assert.equal(calls[0].payload.secret_token, 's3cret');
    assert.deepEqual(calls[5].payload.scope, { type: 'chat', chat_id: '777' });
    assert.deepEqual(calls[5].payload.commands.map(c => c.command), ['app', 'post', 'help']);
    assert.ok(calls[4].payload.short_description.length <= 120);
  });

  const cenv = { ...env, CHANNEL_ID: '@srvdetailing', APP_LINK: 'https://t.me/srv_detailing_bot/app' };
  const mgr = (text, extra = {}) => route({ method: 'POST', headers: tgHdr, query: {}, body: JSON.stringify({ update_id: 20, message: { message_id: 90, chat: { id: 777, type: 'private' }, from: { id: 777 }, text, ...extra } }) }, cenv, deps);

  await t('/app публикует в канал пост с кнопкой приложения и закрепляет его', async () => {
    reply = m => (m === 'sendMessage' ? { ok: true, result: { message_id: 55 } } : { ok: true });
    await mgr('/app');
    const [post, pin, note] = calls;
    assert.equal(post.method, 'sendMessage');
    assert.equal(post.payload.chat_id, '@srvdetailing');
    assert.deepEqual(post.payload.reply_markup.inline_keyboard[0][0], { text: 'Рассчитать и записаться', url: 'https://t.me/srv_detailing_bot/app?startapp=channel' });
    assert.equal(pin.method, 'pinChatMessage');
    assert.equal(pin.payload.message_id, 55);
    assert.equal(note.payload.chat_id, 777);
    assert.match(note.payload.text, /закреплён/);
  });

  await t('/post ppf ответом на сообщение копирует его в канал с кнопкой в раздел', async () => {
    reply = m => (m === 'copyMessage' ? { ok: true, result: { message_id: 56 } } : { ok: true });
    await mgr('/post ppf', { reply_to_message: { message_id: 89, chat: { id: 777 }, caption: 'Оклеили Tank 300 в мат' } });
    const [copy, note] = calls;
    assert.equal(copy.method, 'copyMessage');
    assert.equal(copy.payload.chat_id, '@srvdetailing');
    assert.equal(copy.payload.message_id, 89);
    assert.deepEqual(copy.payload.reply_markup.inline_keyboard[0][0], { text: 'Рассчитать защиту', url: 'https://t.me/srv_detailing_bot/app?startapp=ppf' });
    assert.ok(!calls.some(c => c.method === 'pinChatMessage'));
    assert.match(note.payload.text, /startapp=ppf/);
  });

  await t('/post без ответа и без канала объясняет, что делать; клиенту команда недоступна', async () => {
    await mgr('/post');
    assert.match(calls[0].payload.text, /ответом на сообщение/);
    calls = [];
    await route({ method: 'POST', headers: tgHdr, query: {}, body: JSON.stringify({ update_id: 21, message: { message_id: 1, chat: { id: 777, type: 'private' }, from: { id: 777 }, text: '/app' } }) }, env, deps);
    assert.match(calls[0].payload.text, /Канал не подключён/);
    calls = [];
    await route({ method: 'POST', headers: tgHdr, query: {}, body: JSON.stringify({ update_id: 22, message: { message_id: 1, chat: { id: 5551, type: 'private' }, from: client, text: '/app' } }) }, cenv, deps);
    assert.ok(!calls.some(c => c.payload.chat_id === '@srvdetailing'));
    assert.equal(calls[0].payload.chat_id, '777'); // ушло менеджеру как обычное сообщение клиента
  });

  await t('нет прав в канале — понятная ошибка; закреп не вышел — пост всё равно опубликован', async () => {
    reply = () => ({ ok: false, description: 'Bad Request: need administrator rights in the channel chat' });
    await mgr('/shop');
    assert.match(calls[calls.length - 1].payload.text, /не хватает прав/);
    calls = [];
    reply = m => (m === 'pinChatMessage' ? { ok: false, description: 'Bad Request: not enough rights to manage pinned messages in the chat' } : { ok: true, result: { message_id: 57 } });
    await mgr('/shop');
    assert.match(calls[calls.length - 1].payload.text, /опубликован, но закрепить не вышло/);
  });

  await t('пересланный пост из канала показывает CHANNEL_ID', async () => {
    await mgr('', { forward_origin: { type: 'channel', chat: { id: -1001234, title: 'SRV DETAILING', type: 'channel' }, message_id: 3 } });
    assert.match(calls[0].payload.text, /CHANNEL_ID: -1001234/);
  });

  await t('кривой код раздела не публикуется', async () => {
    await mgr('/post <b>x', { reply_to_message: { message_id: 89, chat: { id: 777 }, text: 'x' } });
    assert.equal(calls.length, 1);
    assert.match(calls[0].payload.text, /Раздел — латиница/);
  });

  await t('канал есть, но нет ссылки на приложение — подсказка про /newapp', async () => {
    await route({ method: 'POST', headers: tgHdr, query: {}, body: JSON.stringify({ update_id: 30, message: { message_id: 1, chat: { id: 777, type: 'private' }, from: { id: 777 }, text: '/app' } }) }, { ...env, CHANNEL_ID: '@srvdetailing' }, deps);
    assert.equal(calls.length, 1);
    assert.match(calls[0].payload.text, /APP_LINK/);
  });

  console.log('\nвсе проверки пройдены');
})().catch(e => { console.error(e); process.exit(1); });
