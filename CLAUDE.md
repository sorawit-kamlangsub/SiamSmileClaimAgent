# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

ClaimAgent — an insurance claims back-office SPA (React 18 + TypeScript + Vite 4 + MUI v5) for Smile Solution Development (SSD). Built from the internal `react-ts-template-2023` template. UI copy, comments, and route titles are written in Thai; that is expected, keep it.

## Commands

```bash
npm start            # vite dev server on http://localhost:3000 (mode "" → .env + .env.local)
npm run build        # tsc (typecheck, noEmit) then vite build — mode "" / production
npm run build:dev    # build with --mode dev   (.env.dev)
npm run build:uat    # build with --mode uat   (.env.uat)
npm run lint         # eslint src --ext ts,tsx --max-warnings 0  (warnings fail)
npm run lint:fix     # eslint --fix
npm run codegen      # regenerate ./api.client.ts from a live Swagger endpoint (see below)
npm run serve        # vite preview of a prior build
```

There is **no test runner** configured (no `test` script, no jest/vitest). "Run a single test" does not apply. Verify changes with `npm run build` (runs `tsc`) and `npm run lint`.

`tsc` is strict and enforces `noUnusedLocals` / `noUnusedParameters` / `noFallthroughCasesInSwitch`, so unused imports/vars break the build, not just lint.

## Environment & runtime config

Env is **not** read from `import.meta.env` at runtime. `vite.config.ts` collects every `VITE_*` key for the build mode and writes `public/configuration.js`, which sets a frozen `window.__CONST__ENV__`. [src/Const.ts](src/Const.ts) destructures that global and re-exports typed constants (`API_URL`, `APIGW_URL`, `SSO_CONFIG`, …). Import config from `Const.ts`, never `process.env` / `import.meta.env`.

- Adding a new env var: add it to **every** `.env*` file, declare it in [src/Const.d.ts](src/Const.d.ts), and export it from `Const.ts`.
- `public/configuration.js` and `public/config.json` are generated (gitignored). `npm start` / `build` regenerate them.
- `npm run codegen` requires a local `.env.local` with `VITE_API_URL`; it runs NSwag against `<VITE_API_URL>/swagger/v1/swagger.json`, writes root `./api.client.ts` (gitignored), and post-processes it (strips `/api/` prefix, rewrites `.toISOString()` → dayjs format, injects `customFormatter`). The per-domain clients under `src/app/api/*.client.ts` are committed and edited by re-running codegen against the relevant service.

## Architecture

### Bootstrapping
[src/main.tsx](src/main.tsx) → [src/AppRoot.tsx](src/AppRoot.tsx) mounts providers in this order: `AuthProvider` (OIDC) → `ReduxProvider` → `QueryClientProvider` → `App`. `AppRoot` also configures dayjs globally: Thai locale, `buddhistEra` plugin, timezone fixed to `Asia/Bangkok`. React Query defaults: `retry: 3`, `retryDelay: 5000`, `staleTime: 5min`.

### Routing
[src/App.tsx](src/App.tsx) builds a `createBrowserRouter` from arrays of `RouteMapType` ([src/app/routes/AuthRoutes.tsx](src/app/routes/AuthRoutes.tsx)): `AuthRoutes` (callbacks, unauthorized) + app routes under `<Layout />` from [src/app/routes/Routes.tsx](src/app/routes/Routes.tsx) + public routes (`/slip/:id`, `/survey/*`) under `<LayoutPublic />`. `createRouteObject` maps each `RouteMapType` into a router `RouteObject`, moving `title`, `permissions`, `condition`, `icon`, `hideAppBar`, `hideAsideMenu` into `handle`. Add a page by appending to the `Routes` array; guard it with `permissions: PermissionList[]` + `condition: "AND" | "OR"`.

### Auth
OIDC via `oidc-client-ts` (`UserManager` created in `AppRoot`, tokens in `localStorage`, silent renew on). [src/app/modules/_auth/components/AuthProvider.tsx](src/app/modules/_auth/components/AuthProvider.tsx) registers a single `axios.interceptors.request` that attaches `Authorization: Bearer <access_token>` to **every** axios call — API client classes take the bare `axios` instance and rely on this. `useAuth()` exposes `permissions` / `roles`; `checkPermissions` / `checkRole` in [src/app/modules/_auth/auth.ts](src/app/modules/_auth/auth.ts) back the route guards.

### Data layer
NSwag generates client classes (`CoreClaimClient`, etc.) in `src/app/api/*.client.ts`. Each has a sibling non-`.client` wrapper (e.g. [src/app/api/coreClaimApi.ts](src/app/api/coreClaimApi.ts)) that instantiates the client once with `API_URL` + `axios` and exports **React Query hooks** (`useGetClaimHistory`, `useCalculateCaseClaim`, …) — one `queryKey` const per endpoint at the top of the file. Components consume these hooks; they do not call client classes or axios directly. Responses are typically a `*ServiceResponse` envelope with `isSuccess` / `message` / `exceptionMessage`; mutation wrappers check `isSuccess` and route to `onSuccessCallback` / `onErrorCallback`.

Company API convention: **GET and POST only** — no PUT / PATCH / DELETE. Mutations are POST to an action path (`{id}/update`, `{id}/delete`).

Dates cross the wire as strings but are typed `dayjs.Dayjs` in generated DTOs (NSwag `dateTimeType: DayJS`). Format for display with `formatDateString` / helpers in [src/app/functionHelpers.ts](src/app/functionHelpers.ts) (default format `DD/MM/BBBB` — `BBBB` = Buddhist year). Call `.toString()` on a `Dayjs` before passing it to `formatDateString`.

**Generated API binding — hard rule:**
- Before writing a new API call, check whether the endpoint/DTO already exists on the relevant generated client (`src/app/api/*.client.ts` — `CoreClaimClient`, `MastersClient`, `DocumentClient`, `DocumentUploaderClient`, …) or its hook wrapper (the sibling `src/app/api/*.ts` file, no `.client` suffix). Reuse it — don't hand-roll a duplicate `axios` call or a second hook for something that's already wrapped. See [api-inventory.md](docs/api-inventory.md) for the full current list before adding a new hook.
- **Never hand-edit a `*.client.ts` file.** It's 100% NSwag output — `npm run codegen` overwrites it wholesale, so a manual fix silently disappears on the next regen and the file drifts from the backend contract. If a client is missing a method, has a stale/wrong DTO field, or is otherwise out of date, that's a backend/swagger problem: get the backend contract fixed, then `npm run codegen` (needs local `.env.local` with `VITE_API_URL`, see Commands) — don't patch the generated file directly.
- The sibling wrapper (`*.ts`, no `.client`) is the opposite: hand-written by design, and **is** where new `useGetX` / `useXMutation` hooks belong, following the pattern above.

### State (Redux)
[src/redux/rootReducer.ts](src/redux/rootReducer.ts) combines one slice per feature module (`checkeligible`, `claimph`, `claimpa`, `claimConsider`, …). Only `layout` is wrapped in `redux-persist`; feature slices are in-memory. Use the typed `useAppSelector` / `useAppDispatch` from [src/redux/hook.ts](src/redux/hook.ts). Each slice lives at `modules/<Feature>/store/<feature>Slice.ts` and exports its actions plus a `<feature>Selector`.

### Module layout
`src/app/modules/<Feature>/` follows a fixed shape: `pages/` (route entry components), `components/` (presentational + feature widgets), `hooks/` (feature logic, often wrapping the API hooks + Formik), `store/` (Redux slice). Cross-cutting code is in `modules/_common` (re-exported from its `index.ts`: `commonFunctions`, `commonValidators`, `sweetAlert`, `types`, shared `components`) and `modules/_auth`. Shared helpers also in `src/app/functionHelpers.ts`, `src/app/deathBenefitHelpers.ts`, `src/app/ocrCompareHelpers.ts`.

### Forms
Formik + `zod` via `zod-formik-adapter`; `focus-formik-error` for scroll-to-error. MUI form wrappers live in `_common/components`. Tables use `mui-datatables` with `StandardDataTable` and `cellAlignOptions` helpers.

## Code style

Prettier ([.prettierrc.json](.prettierrc.json)): 4-space indent, `printWidth` 120, double quotes, semicolons, `trailingComma: es5`, **CRLF** line endings (enforced by eslint `linebreak-style: windows` and `tsconfig` `newLine: CRLF`). All source files are UTF-8 / CRLF.

ESLint runs with `--max-warnings 0`. `@typescript-eslint/no-explicit-any` is **off** in config, but the SSD standard still forbids `any` — prefer real types. Naming: PascalCase for components/types, camelCase for values/functions, CONSTANT_CASE for module constants.

## Git & releases

Git Flow: branch off `develop` (main branch for PRs), naming `feature/<name>`. Conventional Commits (`feat:`, `fix:`, `chore:`, …) — `release-it` + conventional-changelog cut releases from `master` / `develop` into `CHANGELOG.md`. Gitignored build output dirs: `dev/`, `uat/`, `production/`, `dist/`.

### Commit message rules

**Type** — เลือกให้ตรงกับลักษณะการเปลี่ยนแปลงมากที่สุด:
`feat` เพิ่ม feature ใหม่ · `fix` แก้ bug · `refactor` ปรับโครงสร้างโค้ดโดยไม่เปลี่ยน business logic · `perf` ปรับปรุง performance · `style` ปรับ UI/CSS/formatting โดยไม่เปลี่ยน logic · `docs` แก้ documentation · `test` เพิ่ม/แก้ test · `build` เปลี่ยน build config หรือ dependency · `ci` เปลี่ยน CI/CD · `chore` งาน maintenance ทั่วไป · `revert` ย้อนการเปลี่ยนแปลงจาก commit ก่อนหน้า

**Header format:** `<type>(<scope>): <short description>` — เช่น `feat(claim): เพิ่มการตรวจสอบเอกสาร OCR`

**Body** — ต้องมี `## Summary` พร้อม 4 หัวข้อนี้เสมอ:
- **การเปลี่ยนแปลง:** โค้ดเปลี่ยนอะไร และเปลี่ยนเพื่ออะไร
- **ผลกระทบ/API/Security:** ผลกระทบต่อ API, Database, Authentication/Authorization, Security, existing functionality — ถ้าไม่มีให้ระบุ `ไม่มี`
- **การทดสอบ:** สิ่งที่ทดสอบแล้วจริง (unit test, integration test, manual test, build, lint, edge case) — ถ้าไม่ได้ทดสอบต้องระบุเหตุผลชัดเจน ห้ามอ้างว่า test ผ่านถ้าไม่ได้ทดสอบจริง
- **ข้อจำกัดหรือสิ่งที่ต้องติดตาม:** known issues, technical debt, TODO — ถ้าไม่มีให้ระบุ `ไม่มี`

**ข้อห้าม:**
- ห้ามใช้ `feat` หากเป็นเพียงการแก้ bug, ห้ามใช้ `fix` หากเป็นการเพิ่ม feature ใหม่
- ห้ามเขียน commit message ที่กว้างเกินไป เช่น `update code`, `fix issue`, `change stuff`
- ห้ามกล่าวอ้างว่า test ผ่านหากไม่มีข้อมูลยืนยัน
- ห้ามกล่าวอ้างว่าไม่มีผลกระทบต่อ API/Security หากยังไม่มีข้อมูลเพียงพอ

## SSD skill

The `ssd` skill ([.claude/skills/ssd/SKILL.md](.claude/skills/ssd/SKILL.md)) packages the team's React/.NET/Python/Git conventions. Invoke with `/ssd <command>` (e.g. `/ssd frontend-review`, `/ssd react-api`, `/ssd git-commit`, `/ssd ts-fix-unused`); `/ssd help` lists all commands. Follow its reference files exactly when a command matches the task.
