# Dashboard1 — Memoria di Progetto

## Stato attuale
Progetto funzionante in locale. Supabase configurato. Vercel NON ancora deployato.

## Stack
- Next.js 14 App Router + TypeScript + Tailwind CSS
- shadcn/ui (Card, Badge, Button)
- Supabase (PostgreSQL) — project: `kohyhcezttenkzsydywa`
- xlsx (parsing Excel HubSpot CRM export)
- Recharts (grafici a barre)

## Repo & Links
- **GitHub:** https://github.com/davidealbo71-alt/dashboard1
- **Supabase:** https://kohyhcezttenkzsydywa.supabase.co
- **Tabella:** `deals` (schema in `supabase/schema.sql`)

## Sorgente dati
File Excel HubSpot CRM export (~746 righe di trattative commerciali).

Colonne mappate dall'Excel:
- `ID record` → `id_record`
- `Nome trattativa` → `nome_trattativa`
- `Importo` → `importo`
- `Fase trattativa` → `fase_trattativa`
- `Business Unit` → `business_unit`
- `Data di chiusura` → `data_chiusura` (Excel serial convertito in ISO date)
- `Proprietario della trattativa` → `proprietario`
- `Pipeline` → `pipeline`
- `Anno di Competenza` → `anno_competenza`
- `Azienda Associata` → `azienda_associata`
- `È con chiusura vinta` → `vinta` (boolean)
- `È con chiusura persa` → `persa` (boolean)
- `Categoria di previsione` → `categoria_previsione`
- `Probabilità trattativa` → `probabilita`
- `Service Line` → `service_line`
- `Importo previsto offerta` → `importo_previsto`
- `Paese della Trattativa` → `paese`

## KPI implementati
1. Pipeline Aperta — importo trattative con vinta=false e persa=false
2. Totale WON — importo trattative con vinta=true
3. Win Rate % — vinte / (vinte + perse) * 100
4. Totale Trattative — count
5. Importo per Business Unit (bar chart verticale)
6. Trattative per Fase — conteggio (bar chart verticale)
7. Top Proprietari per Importo (bar chart orizzontale, top 10)
8. Pipeline per Anno di Competenza (bar chart verticale)

## Variabili d'ambiente necessarie (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://kohyhcezttenkzsydywa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<chiave anon da Supabase → Settings → API Keys → Legacy>
```

## Cosa manca
- [ ] Deploy su Vercel (`vercel --prod`)
- [ ] Aggiungere env vars su Vercel dashboard
- [ ] Filtri (per anno, BU, proprietario, fase)
- [ ] Altre funzionalità da decidere

## Struttura file chiave
```
src/
  app/
    page.tsx              — dashboard principale
    api/upload/route.ts   — POST: parse Excel e inserisce in Supabase
    api/kpis/route.ts     — GET: aggrega KPI dai deals
  components/
    StatCard.tsx          — card KPI numerica
    BarChart.tsx          — grafico a barre (verticale + orizzontale)
    UploadExcel.tsx       — bottone upload file
  lib/supabase.ts         — client Supabase (lazy init)
  types/deal.ts           — tipi Deal e KpiData
supabase/schema.sql       — schema tabella deals
```
