create table if not exists kpis (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  value numeric not null default 0,
  unit text,
  category text,
  date text,
  created_at timestamptz not null default now()
);

alter table kpis enable row level security;

create policy "Allow all" on kpis for all using (true) with check (true);
