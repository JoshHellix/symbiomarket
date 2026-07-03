-- Free-tier remote state for /swarm on Vercel (alternative to paid Redis / limited Blob)
create table if not exists public.symbio_remote_state (
  key text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.symbio_remote_state enable row level security;

-- No public policies: only service_role (server ingest + API routes) reads/writes.
