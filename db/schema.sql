-- Ranking común para todos los juegos. Una fila por partida; `game` identifica el juego.
-- level = oleada/nivel alcanzado, score = puntos (en Fecundaroids: bebés).
create table if not exists game_scores (
  id         bigserial primary key,
  game       text        not null,
  name       text        not null check (name ~ '^[A-Z0-9]{1,3}$'),
  country    text        not null check (country ~ '^[A-Z]{2}$'),
  level      integer     not null check (level >= 0),
  score      integer     not null check (score >= 0),
  created_at timestamptz not null default now()
);
create index if not exists game_scores_rank_idx on game_scores (game, level desc, score desc, created_at);
