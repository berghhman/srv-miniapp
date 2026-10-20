/* Вход для Yandex Cloud Functions: точка входа index.handler, среда Node.js 18 или новее. */
const { route } = require('./bot');

module.exports.handler = async (event) => {
  const body = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : (event.body || '');
  const r = await route({ method: event.httpMethod, headers: event.headers || {}, query: event.queryStringParameters || {}, body }, process.env);
  return { statusCode: r.status, headers: r.headers || {}, body: r.body };
};
