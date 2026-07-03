-- Creator registry for RFB 6 traction (persists across Vercel cold starts)
create table if not exists public.symbio_creators (
  id text primary key,
  name text not null,
  feed_url text not null,
  wallet text not null,
  split_bps int not null default 10000,
  registered_at timestamptz not null default now()
);

alter table public.symbio_creators enable row level security;

-- Public read for registry API; writes via service_role only
create policy "symbio_creators_public_read"
  on public.symbio_creators for select
  using (true);
