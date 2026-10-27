// Verifica la clave del menú DEV contra la variable de entorno DEV_PASSWORD
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: '' };
  const expected = process.env.DEV_PASSWORD;
  if (!expected) return { statusCode: 500, body: 'DEV_PASSWORD no configurada' };
  let pass = '';
  try { pass = String(JSON.parse(event.body || '{}').password ?? ''); } catch {}
  return { statusCode: pass === expected ? 200 : 401, body: '' };
};
