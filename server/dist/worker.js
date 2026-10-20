/* SRV Detailing: бот-менеджер для Cloudflare Workers. Собрано из server/bot.js — правьте там и пересоберите. */
/* SRV Detailing: бот-менеджер.
   Одна функция без базы данных. Каждое сообщение, которое бот присылает менеджеру,
   заканчивается строкой «#id<номер клиента>». Менеджер отвечает на него (свайп → «Ответить»),
   бот берёт номер из исходного сообщения и пересылает ответ клиенту от имени SRV.

   Переменные окружения:
     BOT_TOKEN        токен бота (секрет)
     MANAGER_CHAT_ID  куда приходят заявки: id менеджера или рабочей группы (узнать — команда /id)
     WEBHOOK_SECRET   любая длинная строка: защищает вход от чужих запросов
     PUBLIC_URL       адрес этой функции (нужен для одноразовой настройки)
     MINIAPP_URL      адрес мини-аппа, по умолчанию https://berghhman.github.io/srv-miniapp/
     ALLOW_ORIGIN     с какого сайта принимать заявки, по умолчанию https://berghhman.github.io
     CHANNEL_ID       канал для публикаций (@srvdetailing или -100…)
     APP_LINK         ссылка на мини-апп для кнопок в канале: https://t.me/<бот>/app (после /newapp) */
const DEFAULT_MINIAPP = 'https://berghhman.github.io/srv-miniapp/';

/* Web Crypto: одинаково работает в Node 18+ и в Cloudflare Workers */
const subtle = globalThis.crypto.subtle;
const enc = new TextEncoder();
async function hmac(key, data) {
  const k = await subtle.importKey('raw', typeof key === 'string' ? enc.encode(key) : key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await subtle.sign('HMAC', k, enc.encode(data)));
}
const hex = b => Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
function sameString(a, b) {
  if (a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

const ID_TAG = /#id(\d+)\s*$/m;
const tagOf = id => `#id${id}`;
const clip = (s, n) => String(s || '').slice(0, n);
const hhmm = () => new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow' });

function api(env, fetchImpl = (u, o) => fetch(u, o)) {
  return async (method, payload) => {
    const r = await fetchImpl(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    let j = {};
    try { j = await r.json(); } catch (e) {}
    return j;
  };
}

/* фото из заявки приходит как data:image/jpeg;base64,… — отправляем его файлом */
async function sendPhotoData(env, chatId, dataUrl, caption, replyTo, fetchImpl = (u, o) => fetch(u, o)) {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl || '');
  if (!m) return null;
  const bin = Uint8Array.from(atob(m[2]), ch => ch.charCodeAt(0));
  if (bin.length > 8e6) return null;
  const fd = new FormData();
  fd.append('chat_id', String(chatId));
  fd.append('caption', caption);
  if (replyTo) fd.append('reply_parameters', JSON.stringify({ message_id: replyTo, allow_sending_without_reply: true }));
  fd.append('photo', new Blob([bin], { type: m[1] }), 'car.jpg');
  const r = await fetchImpl(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendPhoto`, { method: 'POST', body: fd });
  try { return await r.json(); } catch (e) { return {}; }
}

/* подпись initData: заявка точно пришла из Telegram от этого пользователя */
async function checkInitData(initData, token, maxAgeSec = 86400) {
  if (!initData || !token) return null;
  const p = new URLSearchParams(initData);
  const hash = p.get('hash'); if (!hash) return null;
  p.delete('hash');
  const check = [...p.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([k, v]) => `${k}=${v}`).join('\n');
  const secret = await hmac('WebAppData', token);
  const sig = hex(await hmac(secret, check));
  if (!sameString(sig, hash)) return null;
  if (Date.now() / 1000 - Number(p.get('auth_date')) > maxAgeSec) return null;
  try { return JSON.parse(p.get('user')); } catch (e) { return null; }
}

const personLine = u => [u.first_name, u.last_name].filter(Boolean).join(' ') + (u.username ? ` (@${u.username})` : '');
const contactButton = u => (u.username ? [[{ text: 'Открыть чат с клиентом', url: `https://t.me/${u.username}` }]] : []);
const leadKeyboard = u => ({ inline_keyboard: [[{ text: 'Принять', callback_data: `a:${u.id}` }, { text: 'Закрыть', callback_data: `c:${u.id}` }], ...contactButton(u)] });

const TEXT = {
  start: 'SRV Detailing — детейлинг-центр на ул. Симонова, 11, Санкт-Петербург.\n\nВ приложении можно рассчитать защиту плёнкой на схеме своего авто, примерить тонировку, посмотреть цены и записаться онлайн.\n\nИли просто напишите вопрос сюда — ответит менеджер.',
  received: 'Заявка принята. Менеджер SRV подтвердит время и ответит здесь, в этом чате.',
  accepted: 'Менеджер SRV принял вашу заявку и скоро напишет здесь.',
  managerHelp: 'Чтобы ответить клиенту, ответьте на его сообщение (свайп влево → «Ответить»). Бот перешлёт ответ от имени SRV: текст, фото, файлы, голосовые.\n\nКнопки под заявкой: «Принять» — клиенту придёт уведомление, «Закрыть» — заявка отмечается как обработанная.\n\nКанал:\n/app — опубликовать в канале пост с кнопкой «Рассчитать и записаться» и закрепить его. Если отправить команду ответом на своё сообщение, в канал уйдёт оно.\n/post — ответом на своё сообщение (текст или одно фото с подписью): опубликовать его в канале с кнопкой приложения.\n/post ppf — кнопка ведёт сразу в раздел. Разделы: ppf (схема плёнки), tintfit (примерка тонировки), quiz (подбор), promo (акция), prices (все цены), ceramic, polish, tint, clean, noise, dents.',
  managerHint: 'Это сообщение никуда не ушло. Ответить клиенту — ответьте на его сообщение. Опубликовать это в канале — ответьте на него командой /post. Все команды — /help.',
  shopPost: 'SRV Detailing теперь в Telegram.\n\nРассчитайте защиту плёнкой на схеме своего автомобиля, примерьте тонировку, посмотрите все цены и запишитесь онлайн — без звонков.\n\nОткрывается кнопкой ниже.',
  noChannel: 'Канал не подключён. Добавьте бота в канал администратором (право «Публикация сообщений», для закрепления — «Редактирование сообщений»), затем перешлите сюда любой пост из канала — бот покажет его номер. Этот номер нужно вписать в настройку CHANNEL_ID воркера.',
  noAppLink: 'Не задана ссылка на приложение. В BotFather: /newapp → выберите этого бота → короткое имя app. Затем впишите https://t.me/<ник бота>/app в настройку APP_LINK воркера.',
  needReply: 'Отправьте /post ответом на сообщение, которое нужно опубликовать: свайп влево по своему сообщению → «Ответить» → /post.',
};
const SECTIONS = { ppf: 'Рассчитать защиту', tintfit: 'Примерить тонировку', quiz: 'Подобрать уход', promo: 'Забрать по акции', prices: 'Смотреть цены', ceramic: 'Цены на керамику', polish: 'Цены на полировку', tint: 'Цены на тонировку', clean: 'Цены на химчистку', noise: 'Цены на шумоизоляцию', dents: 'Удаление вмятин', book: 'Записаться' };

/* ---------- публикация в канал ---------- */
const CODE = /^[a-z0-9_-]{1,60}$/i;
function appButton(env, code) {
  /* в каналах кнопка web_app запрещена, поэтому обычная ссылка на мини-апп: Telegram откроет его поверх канала */
  return { inline_keyboard: [[code
    ? { text: SECTIONS[code] || 'Открыть в приложении', url: `${env.APP_LINK}?startapp=${encodeURIComponent(code)}` }
    : { text: 'Рассчитать и записаться', url: `${env.APP_LINK}?startapp=channel` }]] };
}
function channelError(r) {
  const d = (r && r.description) || 'ошибка Telegram';
  if (/not enough rights|administrator|CHAT_ADMIN_REQUIRED|need administrator rights/i.test(d)) return 'Боту не хватает прав в канале. Сделайте его администратором с правами «Публикация сообщений» и «Редактирование сообщений».';
  if (/chat not found/i.test(d)) return 'Канал не найден. Проверьте CHANNEL_ID и что бот добавлен в канал.';
  return `Не получилось: ${d}`;
}
async function channelCommand(m, env, call) {
  const text = m.text || '';
  const ch = env.CHANNEL_ID;
  const say = t => call('sendMessage', { chat_id: m.chat.id, reply_to_message_id: m.message_id, text: t, disable_web_page_preview: true });
  if (!ch) return say(TEXT.noChannel);
  if (!env.APP_LINK) return say(TEXT.noAppLink);
  const isShop = /^\/(app|shop)\b/.test(text);
  const arg = text.split(/\s+/)[1] || '';
  if (arg && !CODE.test(arg)) return say('Раздел — латиница, цифры, дефис или подчёркивание, например /post ppf');
  const src = m.reply_to_message;
  if (!isShop && !src) return say(TEXT.needReply);
  const kb = appButton(env, isShop ? '' : arg);
  const r = src
    ? await call('copyMessage', { chat_id: ch, from_chat_id: m.chat.id, message_id: src.message_id, reply_markup: kb })
    : await call('sendMessage', { chat_id: ch, text: TEXT.shopPost, reply_markup: kb });
  if (!r.ok) return say(channelError(r));
  const id = r.result && r.result.message_id;
  let note = arg ? `Опубликовано. Кнопка «${SECTIONS[arg] || 'Открыть в приложении'}» ведёт сюда: ${env.APP_LINK}?startapp=${arg}${SECTIONS[arg] ? '' : '\nТакого раздела нет в списке /help — приложение откроется на главной, а метка попадёт в заявку как источник.'}` : 'Опубликовано с кнопкой «Рассчитать и записаться».';
  if (isShop) {
    const p = await call('pinChatMessage', { chat_id: ch, message_id: id, disable_notification: true });
    note = p.ok ? 'Пост с кнопкой приложения опубликован и закреплён: кнопка теперь видна на плашке закрепа вверху канала.' : `Пост опубликован, но закрепить не вышло — закрепите его в канале вручную. (${channelError(p)})`;
  }
  return say(note);
}

/* ---------- заявка из мини-аппа ---------- */
async function handleLead(body, env, deps = {}) {
  const call = api(env, deps.fetch);
  const user = await checkInitData(body && body.initData, env.BOT_TOKEN);
  if (!user) return { status: 403, body: 'not from telegram' };
  const text = clip(body.text, 3000);
  const head = `Новая запись, ${hhmm()}\nTelegram: ${personLine(user)}`;
  const sent = await call('sendMessage', { chat_id: env.MANAGER_CHAT_ID, text: `${head}\n\n${text}\n\n${tagOf(user.id)}`, reply_markup: leadKeyboard(user) });
  if (!sent.ok) return { status: 502, body: 'telegram error' };
  if (body.photo) await sendPhotoData(env, env.MANAGER_CHAT_ID, body.photo, `Фото к заявке\nКлиент: ${personLine(user)}\n\n${tagOf(user.id)}`, sent.result && sent.result.message_id, deps.fetch);
  await call('sendMessage', { chat_id: user.id, text: `${TEXT.received}\n\n${text}` });
  return { status: 200, body: 'ok' };
}

/* ---------- всё, что Telegram присылает боту ---------- */
async function handleUpdate(u, env, deps = {}) {
  const call = api(env, deps.fetch);
  const manager = String(env.MANAGER_CHAT_ID || '');

  if (u.callback_query) {
    const q = u.callback_query; const [act, cid] = String(q.data || '').split(':');
    const msg = q.message;
    if (!msg || String(msg.chat.id) !== manager) return call('answerCallbackQuery', { callback_query_id: q.id });
    const who = q.from.first_name || 'менеджер';
    const status = act === 'a' ? `Принята: ${who}, ${hhmm()}` : `Закрыта: ${who}, ${hhmm()}`;
    const base = (msg.text || '').replace(ID_TAG, '').replace(/\n\nСтатус: .*$/s, '').trimEnd();
    const rest = (msg.reply_markup && msg.reply_markup.inline_keyboard || []).filter(row => row.some(b => b.url));
    const keep = act === 'a' ? [[{ text: 'Закрыть', callback_data: `c:${cid}` }], ...rest] : rest;
    await call('editMessageText', { chat_id: msg.chat.id, message_id: msg.message_id, text: `${base}\n\nСтатус: ${status}\n\n${tagOf(cid)}`, reply_markup: { inline_keyboard: keep } });
    if (act === 'a') await call('sendMessage', { chat_id: cid, text: TEXT.accepted });
    return call('answerCallbackQuery', { callback_query_id: q.id, text: act === 'a' ? 'Клиент получил уведомление' : 'Заявка закрыта' });
  }

  const m = u.message || u.edited_message;
  if (!m || !m.chat) return;
  const text = m.text || '';

  if (/^\/id\b/.test(text)) return call('sendMessage', { chat_id: m.chat.id, text: `id этого чата: ${m.chat.id}` });

  /* сообщения из чата менеджера */
  if (String(m.chat.id) === manager) {
    if (/^\/(post|shop|app)\b/.test(text)) return channelCommand(m, env, call);
    const fwd = m.forward_origin || (m.forward_from_chat ? { type: 'channel', chat: m.forward_from_chat } : null);
    if (fwd && fwd.type === 'channel' && fwd.chat) {
      return call('sendMessage', { chat_id: m.chat.id, text: `Канал «${fwd.chat.title || ''}»\nCHANNEL_ID: ${fwd.chat.username ? '@' + fwd.chat.username : fwd.chat.id}\n\nЭто значение нужно вписать в настройки воркера.` });
    }
    const orig = m.reply_to_message;
    const tag = orig && ((orig.text || orig.caption || '').match(ID_TAG));
    if (!tag) {
      if (/^\/(help|start)/.test(text)) return call('sendMessage', { chat_id: m.chat.id, text: TEXT.managerHelp });
      if (m.chat.type === 'private') return call('sendMessage', { chat_id: m.chat.id, reply_to_message_id: m.message_id, text: TEXT.managerHint });
      return; // обычная переписка менеджеров в группе
    }
    const r = await call('copyMessage', { chat_id: tag[1], from_chat_id: m.chat.id, message_id: m.message_id });
    if (!r.ok) {
      const blocked = /blocked|deactivated|chat not found/i.test(r.description || '');
      return call('sendMessage', { chat_id: m.chat.id, reply_to_message_id: m.message_id, text: blocked ? 'Не доставлено: клиент остановил бота. Напишите ему напрямую.' : `Не доставлено: ${r.description || 'ошибка Telegram'}` });
    }
    return;
  }

  /* клиент пишет боту */
  if (m.chat.type !== 'private') return;
  if (/^\/start/.test(text)) {
    const sp = (text.split(/\s+/)[1] || '').replace(/[^\w-]/g, '').slice(0, 60);
    const url = (env.MINIAPP_URL || DEFAULT_MINIAPP) + (sp ? `?startapp=${sp}` : '');
    return call('sendMessage', { chat_id: m.chat.id, text: TEXT.start, reply_markup: { inline_keyboard: [[{ text: 'Рассчитать и записаться', web_app: { url } }], [{ text: 'Маршрут: ул. Симонова, 11', url: 'https://yandex.ru/maps/-/CThXj29K' }]] } });
  }
  const head = `Сообщение от клиента\n${personLine(m.from)}`;
  const tag = tagOf(m.from.id);
  if (m.text) {
    return call('sendMessage', { chat_id: manager, text: `${head}\n\n${clip(m.text, 3500)}\n\n${tag}`, reply_markup: { inline_keyboard: contactButton(m.from) } });
  }
  /* фото, голосовые, файлы: копия с подписью, в которой есть номер клиента */
  const canCaption = m.photo || m.video || m.document || m.audio || m.voice || m.animation;
  if (canCaption) {
    return call('copyMessage', { chat_id: manager, from_chat_id: m.chat.id, message_id: m.message_id, caption: `${head}\n\n${clip(m.caption, 800)}\n\n${tag}`.replace(/\n\n\n/g, '\n\n') });
  }
  /* стикер, геопозиция, контакт: сначала заголовок с номером, потом сама копия */
  await call('sendMessage', { chat_id: manager, text: `${head}\nприслал${m.location ? ' геопозицию' : m.contact ? ' контакт' : ''}:\n\n${tag}` });
  return call('copyMessage', { chat_id: manager, from_chat_id: m.chat.id, message_id: m.message_id });
}

/* ---------- одноразовая настройка: вебхук, кнопка меню, команды ---------- */
async function setup(env, deps = {}) {
  const call = api(env, deps.fetch);
  const url = env.MINIAPP_URL || DEFAULT_MINIAPP;
  const out = {};
  out.webhook = await call('setWebhook', { url: env.PUBLIC_URL, secret_token: env.WEBHOOK_SECRET, allowed_updates: ['message', 'edited_message', 'callback_query'], drop_pending_updates: true });
  out.menu = await call('setChatMenuButton', { menu_button: { type: 'web_app', text: 'Записаться', web_app: { url } } });
  out.commands = await call('setMyCommands', { commands: [{ command: 'start', description: 'Открыть SRV Detailing' }] });
  out.description = await call('setMyDescription', { description: 'Детейлинг-центр SRV, СПб, ул. Симонова, 11. Защитная плёнка, керамика Krytex, тонировка, полировка, химчистка, шумоизоляция. Рассчитайте стоимость и запишитесь онлайн — или задайте вопрос менеджеру прямо здесь.' });
  out.shortDescription = await call('setMyShortDescription', { short_description: 'Детейлинг SRV, СПб: расчёт плёнки, цены и онлайн-запись' });
  if (env.MANAGER_CHAT_ID) {
    /* менеджер видит в меню свои команды, клиенты — только /start */
    out.managerCommands = await call('setMyCommands', { scope: { type: 'chat', chat_id: env.MANAGER_CHAT_ID }, commands: [
      { command: 'app', description: 'Пост с кнопкой приложения в канал + закрепить' },
      { command: 'post', description: 'Ответом на сообщение: опубликовать в канале' },
      { command: 'help', description: 'Как отвечать клиентам и публиковать' },
    ] });
  }
  return out;
}

/* ---------- общий вход для любого хостинга ---------- */
async function route(req, env, deps = {}) {
  const cors = { 'Access-Control-Allow-Origin': env.ALLOW_ORIGIN || 'https://berghhman.github.io', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
  const h = Object.fromEntries(Object.entries(req.headers || {}).map(([k, v]) => [k.toLowerCase(), v]));
  if (req.method === 'OPTIONS') return { status: 204, headers: cors, body: '' };
  if (req.method === 'GET' && req.query && req.query.setup) {
    if (!env.WEBHOOK_SECRET || req.query.setup !== env.WEBHOOK_SECRET) return { status: 403, body: 'wrong key' };
    return { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify(await setup(env, deps), null, 2) };
  }
  if (req.method !== 'POST') return { status: 200, body: 'SRV bot is running' };
  let body = {};
  try { body = JSON.parse(req.body || '{}'); } catch (e) { return { status: 400, headers: cors, body: 'bad json' }; }

  if (body.update_id != null) {
    if (env.WEBHOOK_SECRET && h['x-telegram-bot-api-secret-token'] !== env.WEBHOOK_SECRET) return { status: 403, body: 'bad secret' };
    try { await handleUpdate(body, env, deps); } catch (e) { console.error(e); }
    return { status: 200, body: 'ok' }; // Telegram не должен повторять апдейт
  }
  const r = await handleLead(body, env, deps);
  return { status: r.status, headers: cors, body: r.body };
}


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
