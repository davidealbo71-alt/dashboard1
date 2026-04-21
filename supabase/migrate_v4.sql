create table if not exists metadata (
  key text primary key,
  value text
);

alter table metadata enable row level security;
create policy "Allow all" on metadata for all using (true) with check (true);
