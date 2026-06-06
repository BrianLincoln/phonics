create table profiles (
  id           text primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  avatar_emoji text not null,
  avatar_color text not null,
  companion    text,
  created_at   timestamptz not null default now()
);

create table phonics_progress (
  user_id    uuid not null references auth.users(id) on delete cascade,
  profile_id text not null,
  data       jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  primary key (user_id, profile_id)
);

create table map_progress (
  user_id    uuid not null references auth.users(id) on delete cascade,
  profile_id text not null,
  data       jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  primary key (user_id, profile_id)
);

alter table profiles enable row level security;
alter table phonics_progress enable row level security;
alter table map_progress enable row level security;

create policy "own" on profiles using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own" on phonics_progress using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own" on map_progress using (user_id = auth.uid()) with check (user_id = auth.uid());
