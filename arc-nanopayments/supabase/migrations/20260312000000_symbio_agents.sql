-- Agent operator registry (Option B): who runs citation-paying agents
create table if not exists public.symbio_agents (
  id text primary key,
  name text not null,
  description text not null default '',
  operator_wallet text not null,
  agent_endpoint text not null,
  contact text not null default '',
  registered_at timestamptz not null default now()
);

alter table public.symbio_agents enable row level security;

create policy "symbio_agents_public_read"
  on public.symbio_agents for select
  using (true);
