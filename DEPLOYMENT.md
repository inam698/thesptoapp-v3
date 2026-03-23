# Deployment Runbook — TheSpotApp v2

> **Date**: 2026-03-23
> **Status**: Code committed & pushed to `main` on `github.com/inam698/thesptoapp-v3`

---

## Pre-Deployment Checklist

| Check | Status |
|-------|--------|
| Admin dashboard builds (`next build`) | ✅ PASS — 19 pages, 0 errors |
| Mobile app TypeScript (`tsc --noEmit`) | ✅ PASS — 0 errors |
| Git commit | ✅ `02f9533` — 186 files |
| Git push to `origin/main` | ✅ Pushed |
| Firestore rules file ready | ✅ `firestore.rules` includes `app_config/*` |
| CI/CD workflows committed | ✅ `eas-update.yml` + `eas-build.yml` |
| No secrets in repo | ✅ Verified — `.p8`, `.env`, `node_modules` all gitignored |

---

## STEP 1 — Deploy Firestore Rules

The Firestore rules **must** be deployed before anything else. The rules in
`firestore.rules` add public read access to `app_config/*` which the mobile
app needs.

```bash
# Install Firebase CLI if not installed
npm install -g firebase-tools

# Login to Firebase (opens browser)
firebase login

# Deploy Firestore rules only
firebase deploy --only firestore:rules

# Deploy Storage rules too
firebase deploy --only storage
```

**Verify**: Go to Firebase Console →  Firestore → Rules tab → confirm
`app_config/{configId}` has `allow read: if true`.

---

## STEP 2 — Deploy Admin Dashboard

The admin is a Next.js 14 app. Recommended: deploy to **Vercel**.

### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# From the admin directory
cd thespotapp-admin

# Deploy (first time will prompt for project setup)
vercel --prod
```

**Configure in Vercel**:
- Root Directory: `thespotapp-admin`
- Build Command: `next build`
- Output Directory: `.next`
- Environment Variables: Copy from `thespotapp-admin/.env.local`

### Option B: Firebase Hosting

```bash
cd thespotapp-admin
npm run build

# From root
firebase deploy --only hosting
```

**Verify**:
- [ ] `/dashboard/deployment` page loads
- [ ] Rollout slider visible (0–100%)
- [ ] Kill switch toggle visible
- [ ] Feature flags section visible
- [ ] No console errors

---

## STEP 3 — Set Safe Initial Configuration

**CRITICAL**: Do this BEFORE enabling any OTA updates.

1. Open admin dashboard → `/dashboard/deployment`
2. **Rollout Control card**:
   - Kill Switch: **ON** (red)
   - Rollout Percentage: **0%**
   - Click **Save Rollout**
3. **Version Control card**:
   - Current App Version: `2.1.0`
   - Minimum Required Version: `1.0.0`
   - Force Update: **OFF**
   - Click **Save Config**

**Verify in Firebase Console**:
```
app_config/rollout → { disableUpdates: true, rolloutPercentage: 0 }
app_config/version → { currentVersion: "2.1.0", minimumVersion: "1.0.0", forceUpdate: false }
```

Or run verification script:
```bash
cd thespotapp-admin
node scripts/seed-safe-config.js
```

---

## STEP 4 — Publish OTA Update

### Automatic (CI/CD)
The push to `main` should have triggered the `eas-update.yml` workflow.

Check: https://github.com/inam698/thesptoapp-v3/actions

If not triggered (e.g., no `EXPO_TOKEN` secret):

### Manual

```bash
# Add EXPO_TOKEN to GitHub repo secrets first:
# Settings → Secrets → Actions → New secret → EXPO_TOKEN

# Or run manually:
cd thesptoapp-v2-main
npx eas update --channel production --message "v2.1.0 — rollout system" --non-interactive
```

### Via GitHub Actions (Manual Dispatch)
1. Go to Actions → "EAS Update (OTA)"
2. Click "Run workflow"
3. Select channel: `production`
4. Enter message: `v2.1.0 — deployment system with rollout control`
5. Click "Run workflow"

**Verify**:
```bash
npx eas update:list --channel production
```

---

## STEP 5 — Activate Deployment (Gradual Rollout)

**ONLY after OTA is confirmed published.**

### Phase A: Canary (5%)
1. Open admin → `/dashboard/deployment`
2. Kill Switch: **OFF**
3. Rollout Percentage: **5%**
4. Click **Save Rollout**
5. Monitor for 1 hour

### Phase B: Wider Rollout (25%)
1. Rollout Percentage: **25%**
2. Save → Monitor 2-4 hours

### Phase C: Majority (75%)
1. Rollout Percentage: **75%**
2. Save → Monitor 12-24 hours

### Phase D: Full Rollout (100%)
1. Rollout Percentage: **100%**
2. Save

### Optional: Force Update
Only if you need to force users off an old broken version:
1. Minimum Required Version: `2.1.0`
2. Force Update: **ON**
3. Save Config

---

## STEP 6 — Failsafe Test

After full rollout is stable:

1. Set Kill Switch: **ON**
2. Save Rollout
3. **Verify**: Open app → no update prompt appears
4. **Verify**: App still functions normally
5. Set Kill Switch: **OFF**, Rollout: **100%**
6. Save

---

## STEP 7 — Validate Live System

### On Device
- [ ] Open app fresh → `checkForUpdates` runs
- [ ] OTA update downloads and applies
- [ ] App reloads with new version
- [ ] Offline mode → app still opens without crash
- [ ] Feature flags are accessible via `getFeatureFlags()`

### Edge Cases
- [ ] Invalid Firebase data → app doesn't crash (validated by `validateVersionConfig`)
- [ ] Firebase unreachable (timeout) → app continues normally (5s timeout)
- [ ] Invalid semver in config → falls through safely (`isValidSemver` guard)

---

## Emergency Procedures

### Stop All Updates Immediately
```
Admin → Deployment → Kill Switch: ON → Save Rollout
```
Effect: All OTA updates stop. App continues working with current version.

### Rollback OTA
```bash
cd thesptoapp-v2-main
npx eas update:rollback --channel production
```

### Force Users to Store Update
```
Admin → Deployment:
- Minimum Version: [new version]
- Force Update: ON
- Save Config
```

---

## Architecture Reference

| Component | Location | Channel |
|-----------|----------|---------|
| Mobile App | `thesptoapp-v2-main/` | EAS: production/preview/development |
| Admin Dashboard | `thespotapp-admin/` | Vercel/Firebase Hosting |
| Firestore Config | `app_config/version`, `app_config/rollout`, `app_config/features` | Public read |
| Deployment Logs | `deployment_logs/` | Admin-only |
| CI/CD OTA | `.github/workflows/eas-update.yml` | Triggers on push to main |
| CI/CD Build | `.github/workflows/eas-build.yml` | Manual dispatch only |

### Update Flow
```
User opens app
  → checkForUpdates()
    → Step 1: Firebase version gate (5s timeout)
      → Force update? → Block user, link to store
    → Step 2: Rollout gate
      → Kill switch ON? → Skip update
      → User bucket >= rolloutPercentage? → Skip update
    → Step 3: EAS OTA check
      → Update available? → Download + reload
```
