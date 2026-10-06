# `_auth` (`src/app/modules/_auth`)

Cross-cutting OIDC auth module. Not a feature module — see
[project-structure.md](../project-structure.md#auth-oidc) for the one-paragraph summary; this is
the full detail.

## Files

| File | Purpose |
|---|---|
| `auth.ts` | `AuthContext` + `useAuth()` hook; `logout()`; `checkPermissions()`; `checkRole()` |
| `auth.d.ts` | Types: `PermissionCondition` (`"AND"\|"OR"`), `AuthContextType`, `CustomClaims` (raw OIDC claims), `UserProperties` (normalized profile) |
| `authRedirect.ts` | sessionStorage guard (`setAuthRedirectInProgress`/`clearAuthRedirectInProgress`/`isAuthRedirectInProgress`, 30s timeout) preventing duplicate concurrent `signinRedirect()` calls |
| `components/AuthProvider.tsx` | The auth state machine — wires OIDC `UserManager` events, provides `AuthContext`, registers the global axios interceptor |
| `pages/NoticePage.tsx` | Generic notice screen (title/body, optional auto-redirect countdown) — used for `/unauthorized` and `/not-found` |
| `pages/PageWrapper.tsx` | Generic `Paper` page shell (title, divider, optional back-link) — layout helper, not auth-specific |
| `pages/SigninCallback.tsx` | Handles `/signin-callback`: fresh `UserManager`, `signinRedirectCallback()`, navigate to `state.returnUrl` (fallback `/`), retries `signinRedirect()` on failure if not already in-progress |
| `pages/SilentCallback.tsx` | Handles `/silent-callback` (inside the OIDC silent iframe): `signinSilentCallback(location.search)`, clears redirect-in-progress flag; renders nothing |

## `checkPermissions` / `checkRole`

```ts
checkPermissions(
  permissions: AuthContextType["permissions"],  // string[]
  pagePermissions: PermissionList[],
  condition: PermissionCondition = "OR"
): boolean
// pagePermissions.length === 0 => true; OR = .some(); AND = .every()

checkRole(
  roles: AuthContextType["roles"],
  pageRoles: string[],
  condition: PermissionCondition = "OR"
): boolean
// pageRoles.length === 0 => true; OR = .some(); AND branch ALSO uses .some() — likely a bug,
// AND doesn't actually require every role to match
```

## OIDC token flow, end to end

1. `AppRoot.tsx` builds **one** `UserManager` from `SSO_CONFIG` (`Const.ts` ← `window.__CONST__ENV__`):
   `loadUserInfo: true, response_type: "code", automaticSilentRenew: true, userStore:
   WebStorageStateStore(localStorage), monitorSession: true`. Passed to `<AuthProvider>`, which
   wraps `<ReduxProvider><QueryClientProvider><App/></QueryClientProvider></ReduxProvider>` — auth
   wraps everything.
2. `AuthProvider` subscribes to OIDC events: `addAccessTokenExpired` → clear state, silent-renew-
   then-redirect; `addUserLoaded` → `setLogin(user)` (extracts roles/permissions/profile from
   `CustomClaims`); `addUserUnloaded` → `setLogout()`; `addUserSignedOut` → remove user + force
   `signinRedirectWithGuard()`; `addAccessTokenExpiring` → `startSilentRenew()`.
3. On mount: `oidcUserManager.getUser()` — if a user exists, log in immediately; if not, log out,
   and **only force silent/redirect sign-in when the current path is NOT in `PUBLIC_PATHS`**
   (`Const.ts`: `["/slip/:id", "/survey/:id", "/survey/summary/:id"]`).
4. **The axios interceptor** lives inside `AuthProvider` (single `axios.interceptors.request.use(...)`,
   effect keyed on `[oidcUserManager]`) — on every outgoing request, calls
   `oidcUserManager.getUser()` and if present sets `Authorization: Bearer <access_token>`. This is
   global, so every module's axios calls — including module-local API files like
   `Survey/surveyAPI.ts` or `BankStatus/bankStatusCheckAPI.ts` — get the token automatically.
5. `logout()` (`auth.ts`), `SigninCallback.tsx`, `SilentCallback.tsx` each construct their **own**
   fresh `UserManager` (duplicating `SSO_CONFIG` + store setup) rather than reusing the
   `AppRoot.tsx` singleton — minor duplication, not currently a bug, just worth knowing if you're
   debugging a session/config drift issue.
6. `useAuth()` exposes: `isAuthenticated: boolean`, `authTokens: string` (raw access token),
   `roles: string[]`, `permissions: string[]`, `user: User | null` (raw oidc-client-ts `User`),
   `userProfile: UserProperties | null` (normalized: `fullName`, `branchDetail`, `employeeCode`, …).

## Public routes

`Survey` and `TransferSlips` are the only public routes: `/slip/:id`, `/survey`, `/survey/:id`,
`/survey/summary/:id`, rendered under `<LayoutPublic />` (`hideAppBar: true, hideAsideMenu: true`
in `src/App.tsx`). `LayoutPublic.tsx` is `Layout.tsx` minus the `isAuthenticated` gate and
`checkPermissions` check — it renders `<Outlet />` unconditionally. Net effect: an anonymous
customer can open an SMS link with zero login; the page fetches data by the `id`/`ref` in the URL
alone. The global axios interceptor still opportunistically attaches a token if the visitor
happens to already have a staff session, but nothing requires it.

## `PermissionList` reality check

`Const.ts`: `enum PermissionList { none = "none" }` — only one member exists. Every route in
`Routes.tsx` and every menu entry in `ASideMenuList.tsx` passes `permissions: []` (or omits it),
which both `checkPermissions`/`checkRole` short-circuit to `true` for. **The guarding mechanism
is fully wired and live** (`Layout.tsx` does call `checkPermissions(...)` and redirects to
`/unauthorized` on failure) **but nothing is actually gated today** — the only real access
control currently enforced anywhere is `isAuthenticated` (must be logged in) for routes under
`<Layout />`; `<LayoutPublic />` routes skip even that.
