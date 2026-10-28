// Ranking de Fecundaroids en la tabla común game_scores (Neon). Cadena de conexión: CONNECTION_STRING
const { neon } = require('@neondatabase/serverless');

const GAME = 'fecundaroids';
const json = (statusCode, body) => ({ statusCode, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }, body: JSON.stringify(body) });

// tope razonable de bebés para la oleada alcanzada (descarta valores inventados a lo bruto)
const maxBabies = (waves) => 2 * (5 * waves + 1.5 * waves * (waves + 1)) + 300;

exports.handler = async (event) => {
  if (!process.env.CONNECTION_STRING) return json(500, { error: 'CONNECTION_STRING no configurada' });
  const sql = neon(process.env.CONNECTION_STRING);
  try {
    if (event.httpMethod === 'GET') {
      const rows = await sql`select name, country, level, score from game_scores where game = ${GAME}
        order by level desc, score desc, created_at asc limit 10`;
      return json(200, { rows });
    }
    if (event.httpMethod === 'POST') {
      let b = {};
      try { b = JSON.parse(event.body || '{}'); } catch {}
      const name = String(b.name ?? '').toUpperCase();
      const country = String(b.country ?? '').toUpperCase();
      const level = Number(b.level), score = Number(b.score);
      if (!/^[A-Z0-9]{1,3}$/.test(name) || !/^[A-Z]{2}$/.test(country)
        || !Number.isInteger(level) || !Number.isInteger(score)
        || level < 1 || level > 100 || score < 0 || score > maxBabies(level)) return json(400, { error: 'datos inválidos' });
      await sql`insert into game_scores (game, name, country, level, score) values (${GAME}, ${name}, ${country}, ${level}, ${score})`;
      const [{ rank }] = await sql`select count(*)::int + 1 as rank from game_scores where game = ${GAME}
        and (level > ${level} or (level = ${level} and score > ${score}))`;
      return json(200, { rank });
    }
    return json(405, { error: 'método no permitido' });
  } catch (err) {
    console.error(err);
    return json(500, { error: 'error de base de datos' });
  }
};
