create table if not exists public.watchlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null,
  company text,
  created_at timestamptz not null default now(),
  unique (user_id, symbol)
);

create table if not exists public.positions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null,
  shares numeric not null check (shares >= 0),
  average_cost numeric not null check (average_cost >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, symbol)
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null,
  type text not null check (type in ('buy', 'sell', 'dividend', 'deposit', 'withdrawal')),
  quantity numeric,
  price numeric,
  amount numeric,
  executed_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  currency text not null default 'USD',
  timezone text not null default 'America/New_York',
  dashboard_layout jsonb not null default '{}'::jsonb,
  notifications jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.watchlists enable row level security;
alter table public.positions enable row level security;
alter table public.transactions enable row level security;
alter table public.settings enable row level security;

create policy "Users can read their own watchlist"
  on public.watchlists for select
  using (auth.uid() = user_id);

create policy "Users can manage their own watchlist"
  on public.watchlists for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can read their own positions"
  on public.positions for select
  using (auth.uid() = user_id);

create policy "Users can manage their own positions"
  on public.positions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can read their own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can manage their own transactions"
  on public.transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can read their own settings"
  on public.settings for select
  using (auth.uid() = user_id);

create policy "Users can manage their own settings"
  on public.settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists positions_set_updated_at on public.positions;
create trigger positions_set_updated_at
  before update on public.positions
  for each row
  execute function public.set_updated_at();

drop trigger if exists settings_set_updated_at on public.settings;
create trigger settings_set_updated_at
  before update on public.settings
  for each row
  execute function public.set_updated_at();
