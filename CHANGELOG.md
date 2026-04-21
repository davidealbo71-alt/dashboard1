# Changelog

## 2026-04-21

### Bug fix
- **A Rischio Stallo / Trattative Solide**: le schede non mostravano dati perché la colonna `data_creazione` era nella SELECT ma non esisteva nel DB — Postgres restituiva errore prima di eseguire qualsiasi filtro
- **A Rischio Stallo**: con filtro mese attivo la scheda si svuotava — rimosso il filtro mese da `data_chiusura` (un deal bloccato è rilevante indipendentemente dal mese di chiusura previsto)
- **Top Opportunità**: filtro `vinta/persa` spostato in JS come nelle altre route (`.eq('vinta', false)` in Supabase non matcha i valori `null`)
- **Schema Supabase**: aggiunta colonna `data_creazione date` (migrate_v3.sql) e tabella `metadata` (migrate_v4.sql)

### Nuove funzionalità
- **Data import nell'header**: l'upload estrae la data dal nome del file Excel (`YYYY-MM-DD.xlsx`) e la salva in `metadata`; l'header mostra "Dati al GG mese AAAA"
- **Filtro Service Line**: multi-selezione con checkbox (componente `MultiSelect`), filtra tutti i dati della dashboard
- **Filtro Mese**: convertito in multi-selezione con checkbox; supporta selezione di più mesi contemporaneamente
- **Top Opportunità — KPI**: aggiunte due card sopra la tabella con importo totale (non pesato) e importo pesato delle 10 trattative visualizzate
- **Deploy su Vercel**: progetto deployato, ogni push su `main` triggera il deploy automatico

### Migliorie grafiche
- `StatCard`: valori numerici colorati per accento (blu/verde/amber/rosa), hover shadow, icona con padding maggiore
- Tab navigation: indicatore underline blu sul tab attivo (sostituisce il pill `bg-blue-50`)
