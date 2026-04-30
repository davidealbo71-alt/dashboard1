---
name: Dashboard1 - stato progetto
description: Stato attuale del progetto Dashboard1 (pipeline commerciale HubSpot con Next.js + Supabase + Vercel)
type: project
originSessionId: b98c55bb-873a-4552-b894-99653545a59e
---

Progetto funzionante in locale e deployato su Vercel. Supabase configurato con schema completo.

**Why:** Dashboard commerciale per analisi pipeline HubSpot CRM, usata dal team sales.

**Repo GitHub:** https://github.com/davidealbo71-alt/dashboard1  
**Directory locale:** /Users/davidealbo/Documents/Coding/Claude/dashboard1  
**Supabase project:** https://kohyhcezttenkzsydywa.supabase.co  

## Stack
- Next.js 16.2.4 App Router + TypeScript + Tailwind CSS
- Supabase (PostgreSQL)
- xlsx (parsing Excel HubSpot CRM export)

## Schema Supabase (tabella `deals`)
Colonne: id, id_record, nome_trattativa, importo, fase_trattativa, business_unit,
data_chiusura, data_entrata_fase, data_creazione, proprietario, pipeline, anno_competenza,
azienda_associata, vinta, persa, categoria_previsione, probabilita, service_line,
importo_previsto, tipo_trattativa, motivo_lost, paese, created_at.

Tabella `metadata`: key (PK), value — usata per salvare last_import_date.

Migrations applicate: migrate_v2.sql, migrate_v3.sql (data_creazione), migrate_v4.sql (metadata), migrate_v5.sql (margine).

Colonna `margine numeric default null`: aggiunta 2026-04-30. Letta dall'Excel come `'Margine %'`
con `toNumNull` (null se vuota). HubSpot la esporta come decimale (0.35 = 35%).
Visualizzazione: `(d.margine * 100).toFixed(1) + '%'`. Soglie colore: verde ≥30%, ambra 20–29%, rosso <20%.
Presente nelle tabelle di: TopDealsTable, SolideTab, NonSolideTab, StalloTab, WonTab.

## Sorgente dati
File Excel HubSpot CRM export. Nome file formato: `hubspot-crm-exports-...-YYYY-MM-DD.xlsx`
La data viene estratta automaticamente dal filename all'upload e salvata in `metadata`.
L'header mostra "Dati al GG mese AAAA" in base all'ultimo import.

## Filtri dashboard (header) — tutti con multi-selezione checkbox
- **Service Line**: MultiSelect, passa `service_line=A,B` → API usa `.in()`
- **Sales** (proprietario): select singola
- **Anno**: select singola (resetta mese e sales al cambio)
- **Mese**: MultiSelect, passa `month=4,5` → API usa getDateRangeMulti + JS filter

## Componenti chiave
- `MultiSelect.tsx`: dropdown con checkbox, supporta prop `getLabel` per label custom
- `StatCard.tsx`: valore colorato per accento, hover shadow
- Tab navigation: underline blue sul tab attivo

## Schede implementate
1. **Dashboard**: KPI principali + grafici (funnel, fasi, clienti, service line, proprietari). In cima: due card "Totale Pipeline (non pesato)" e "Totale Pipeline (pesato)" = pipeline_aperta + totale_won (calcolato in componente, senza modifiche API)
2. **Top Opportunità**: KPI importo totale + pesato + tabella top 10
3. **Analisi Persi**: breakdown deal persi per sales/cliente/motivo
4. **Ricavi Ricorrenti**: split ricorrente vs nuovo
5. **A Rischio Stallo**: deal aperti fermi in fase >60gg — filtra per anno (ignora mese)
6. **Trattative Solide**: deal in fase Committed/Negotiation. KPI "Importo Totale": valore principale = pesato, sub = non pesato
7. **Trattative Non Solide**: deal aperti NON in Committed/Negotiation, ordinati per data chiusura prevista (più vicina). KPI "Importo Totale": valore principale = pesato, sub = non pesato
8. **Trattative WON**: deal vinti. Tabella ordinata alfabeticamente per nome_trattativa, paginata 20 righe/pagina con controlli prev/next e numeri di pagina

## API routes
- /api/kpis — KPI + proprietari_disponibili + service_line_disponibili
- /api/top-deals — top 10 deal aperti (filtro vinta/persa in JS)
- /api/lost-deals, /api/recurring, /api/solide, /api/non-solide, /api/won — stesse convenzioni
- /api/stallo — filtra per anno, ignora mese
- /api/metadata — last_import_date
- /api/upload — import Excel, estrae data dal filename

## Pattern consolidati
- Filtri booleani vinta/persa: sempre in JS (mai .eq('vinta', false) in DB — i null non matchano)
- Multi-mese: getDateRangeMulti ritorna span DB + array mesi per filter JS
- Stallo: ignora filtro mese (deal bloccato è tale indipendentemente dal mese di chiusura)

## Autenticazione (aggiunta 2026-04-22)
Sistema login completo con pagina `/login` come prima schermata del sito.

**Architettura:**
- `src/proxy.ts` — protegge tutte le route (pagine + API), redirect a `/login` se non autenticato, ritorna 401 JSON per le API
- `src/lib/session.ts` — JWT firmato con HS256 via `jose`, cookie httpOnly, durata 8h
- `src/app/actions/auth.ts` — server action login (timingSafeEqual) e logout
- `src/app/login/page.tsx` — form login con useActionState
- `src/components/LogoutButton.tsx` — pulsante "Esci" nell'header dashboard

**Variabili d'ambiente richieste (su Vercel e .env.local):**
- `AUTH_USERNAME`, `AUTH_PASSWORD` — credenziali accesso
- `SESSION_SECRET` — chiave HMAC per firmare JWT

**Note sicurezza:**
- Password mai nel codice sorgente, solo in env vars
- Confronto con `crypto.timingSafeEqual` (anti timing-attack)
- JWT contiene solo username, mai la password
- Cookie: httpOnly + secure (prod) + sameSite=lax

**URL produzione:** https://dashboard1-fawn-one.vercel.app

## Fix login produzione (2026-04-22)
Le env var `AUTH_USERNAME`, `AUTH_PASSWORD`, `SESSION_SECRET` erano state aggiunte su Vercel con
`echo "value" |` che aggiunge un trailing newline, causando il fallimento del confronto credenziali.
**Fix:** usare sempre `printf "value" |` (senza newline) per passare valori a `vercel env add`.

## How to apply
Deploy attivo su Vercel — ogni push su main triggera deploy automatico, oppure `vercel --prod` da CLI.
Usare `printf` (non `echo`) per passare env var a Vercel CLI.
