# Ymonorepo: Nasazení na Vercel jako 2 aplikace

Tento repozitář je monorepo řízené PNPM a Turborepo. Obsahuje dvě Next.js aplikace:

- apps/frontend – veřejný web (Next.js 15)
- apps/backend – admin/backend UI (Next.js 15)

## Lokální vývoj

Předpoklady: Node.js 20+, PNPM 9/10

1) Instalace závislostí (z kořene repo):

```bash
pnpm install
```

2) Spuštění obou aplikací paralelně:

```bash
pnpm dev
```

Nebo samostatně:

```bash
pnpm -C apps/frontend dev
pnpm -C apps/backend dev
```

## Build lokálně

```bash
pnpm build:all
```

Případně po jedné aplikaci:

```bash
pnpm -C apps/frontend build
pnpm -C apps/backend build
```

## Nasazení na Vercel (monorepo, 2 projekty)

Vercel nevyžaduje žádný speciální config pro monorepo, stačí nastavit "Root Directory" projektu. V repu jsou pro jistotu přiloženy minimální `vercel.json` v obou aplikacích.

Postup:

1. Nahraj repo na GitHub (public nebo private).
2. Na Vercelu založ 2 projekty a oba připoj ke stejnému GitHub repu.
3. Pro každý projekt nastav Root Directory:
   - Frontend: `apps/frontend`
   - Backend: `apps/backend`
4. Build & Install Commands ponech default nebo nastav:
   - Install Command: `pnpm install`
   - Build Command: `pnpm run build`
5. Framework: Vercel sám detekuje Next.js. (Ve `vercel.json` je uvedeno `framework: "nextjs"`.)
6. Environment variables: nastav pro každý projekt samostatně (např. API klíče, SUPABASE apod.).

Poznámky:
- PNPM workspace je detekován z kořene repo (`pnpm-workspace.yaml`).
- Turborepo je volitelné. Vercel spustí build v rámci nastaveného rootu aplikace, takže `pnpm run build` spustí build jen dané appky.
- Pokud používáš Vercel KV/Blob/Analytics, dodej příslušné env proměnné v nastavení projektu na Vercelu.

## Struktura

- `pnpm-workspace.yaml` – definuje `apps/*` a `packages/*`
- `turbo.json` – základní pipeline pro build/dev
- `apps/frontend` – Next.js 15 (React 19)
- `apps/backend` – Next.js 15 (React 18)

## Poznámky k .gitignore

Root `.gitignore` ignoruje `.env*`. Ulož vzorové proměnné do `apps/<app>/.env.example` a reálné nastavuj na Vercelu.

## Tipy pro Vercel Monorepo

- Každý projekt na Vercelu směřuj na konkrétní složku v monorepu (Root Directory), ne na kořen.
- CI/CD: Po pushi na hlavní větev se oba projekty samostatně zbuildí podle vlastních pravidel.


## Vercel CLI (ruční nasazení)

Pro deploy přes Vercel CLI můžeš použít připravené skripty z kořene repo:

1) Poprvé propojit projekty (každý zvlášť) s Vercel účtem/organizací:

- Frontend:
  pnpm vercel:link:fe
- Backend:
  pnpm vercel:link:be

To vytvoří lokální složku `.vercel` (je v .gitignore) se spojením na vybrané Vercel projekty.

2) Stáhnout env proměnné z Vercelu (produkční):

- Frontend:
  pnpm vercel:pull:fe
- Backend:
  pnpm vercel:pull:be

3) Nasadit produkci:

- Frontend prod deploy:
  pnpm deploy:fe
- Backend prod deploy:
  pnpm deploy:be
- Oba najednou:
  pnpm deploy:all

Poznámky:
- CLI si vyžádá přihlášení (prohlížeč) nebo můžeš použít `VERCEL_TOKEN` v prostředí.
- `--prod` nasazuje rovnou produkci (ne Preview). Bez `--prod` vytvoří Preview.
- V monorepu se používá `--cwd apps/<app>` a v každé app je minimalistický `vercel.json`.
