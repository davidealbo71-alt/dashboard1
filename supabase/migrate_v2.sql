-- Esegui questo nel SQL Editor di Supabase prima di reimportare il file Excel
alter table deals add column if not exists data_entrata_fase date;
alter table deals add column if not exists tipo_trattativa text;
alter table deals add column if not exists motivo_lost text;
