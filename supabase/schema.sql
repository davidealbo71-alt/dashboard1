create table if not exists deals (
  id uuid primary key default gen_random_uuid(),
  id_record text,
  nome_trattativa text,
  importo numeric default 0,
  fase_trattativa text,
  business_unit text,
  data_chiusura date,
  proprietario text,
  pipeline text,
  anno_competenza integer,
  azienda_associata text,
  vinta boolean default false,
  persa boolean default false,
  categoria_previsione text,
  probabilita numeric default 0,
  service_line text,
  importo_previsto numeric default 0,
  data_creazione date,
  paese text,
  created_at timestamptz not null default now()
);

alter table deals enable row level security;

create policy "Allow all" on deals for all using (true) with check (true);
