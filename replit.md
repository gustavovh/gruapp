# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Project: GruaYa

GruaYa is an Uber-like roadside-assistance / tow-truck app for the Mexican market (all UI in Spanish, MXN pricing). The user originally wanted three apps (client mobile, driver mobile, admin web) on React Native + NestJS + PostgreSQL + WebSockets. On the free tier only one artifact is allowed, so we are building the **client mobile app first** as a self-contained Expo app with simulated driver/realtime logic. The driver app and admin web panel are deferred.

### Active artifact

- `artifacts/grua-cliente` — Expo (React Native + Web) client app, slug `grua-cliente`, mounted at `/`.
  - Stack: Expo Router 6, expo-location, expo-haptics, react-native-maps (native only), react-native-safe-area-context, AsyncStorage, LinearGradient, Material Community Icons.
  - State: AsyncStorage persistence (keys `@gruaya/auth-user`, `@gruaya/history`, `@gruaya/active-service`).
  - Realtime is **simulated** via `ServiceContext` state machine: `searching → assigned → enroute → arrived → in_progress → completed`, with a driver-position tween while en-route.
  - Map: native uses `react-native-maps`. Web uses a stylized `MapPreview.web.tsx` fallback (no Google Maps key required). Do **not** add `react-native-maps` to `app.json` plugins — it crashes Expo Go.
  - Auth is local-only (no backend); any email/password creates a session in AsyncStorage.

### Screens

- `(auth)/login`, `(auth)/register` — local sign-in / sign-up.
- `(tabs)/index` — Home with greeting, active-service callout, location map, quick actions, main CTA.
- `(tabs)/history` — Past + active services with stats and clear-history.
- `(tabs)/profile` — User profile, vehicle, menu, logout.
- `service/select-type` — Service-type picker, vehicle/notes form, price summary.
- `service/[id]` — Live tracking screen with map, status timeline, driver card, cancel & rate.

### Brand

- Primary: amber `#F59E0B` on dark slate `#0F172A`. Inter font family.
- Service types defined in `constants/serviceTypes.ts`: platform, hook, tire, fuel, battery, lockout.
