# Monorepo Migration - Quick Reference

## What Changed?

### Directory Structure
```
BEFORE:                          AFTER:
app/                  →          clients/web/
browser-extension/    →          clients/extension/
shared/               →          packages/shared/
common/               →          packages/constants/, packages/core/, packages/utils/
                                packages/analytics-vendors/, packages/eslint-config/
```

### Package Names
| Before | After |
|--------|-------|
| `@requestly/app` | `@requestly/web` |
| `@requestly/browser-extension-common` | `@requestly/extension-common` |
| `@requestly/browser-extension-mv3` | `@requestly/extension-mv3` |
| `@requestly/requestly-core` | `@requestly/constants` |
| `@requestly/shared` | `@requestly/shared` (no change) |
| N/A | `@requestly/core` (new) |
| N/A | `@requestly/utils` (new) |
| `analytics-vendors` | `@requestly/analytics-vendors` |

### Import Changes
**Constants/Logger:**
```javascript
// Before
import { CONSTANTS } from "@requestly/requestly-core";
import LOGGER from "@requestly/requestly-core";

// After
import { CONSTANTS } from "@requestly/constants";
import { logger } from "@requestly/utils";
```

**Rule Processor:**
```javascript
// Before
import { RULE_PROCESSOR } from "@requestly/requestly-core";

// After
import { RULE_PROCESSOR } from "@requestly/core";
```

**Shared (No Change):**
```javascript
// Before & After - same
import { Rule } from "@requestly/shared/types/entities/rules";
```

### Dependency References
**package.json:**
```json
// Before
{
  "dependencies": {
    "@requestly/requestly-core": "file:..",
    "@requestly/shared": "file:../shared"
  }
}

// After
{
  "dependencies": {
    "@requestly/constants": "workspace:*",
    "@requestly/core": "workspace:*",
    "@requestly/utils": "workspace:*",
    "@requestly/shared": "workspace:*"
  }
}
```

### Scripts
**Root package.json:**
```json
// Before
{
  "scripts": {
    "start": "http-server -p 3000",
    "build": "rollup -c"
  }
}

// After
{
  "scripts": {
    "dev": "turbo run dev --parallel",
    "dev:web": "turbo run dev --filter=@requestly/web",
    "build": "turbo run build",
    "build:web": "turbo run build --filter=@requestly/web",
    "lint": "turbo run lint",
    "test": "turbo run test"
  }
}
```

**Web app (clients/web/package.json):**
```json
// Before
{
  "scripts": {
    "dev": "concurrently --kill-others --names \"@requestly/shared, @requestly/app\" \"cd ../shared && npm run watch\" \"vite\"",
    "build": "vite build"
  }
}

// After
{
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}
```
(Turbo handles dependency builds automatically now)

### Package Manager
**Before:** npm
**After:** pnpm

### File Count Updates
- **149 files** updated in clients/web/src with import changes
- **4 package.json files** updated with workspace protocol
- **3 new packages** created (constants, core, utils)
- **2 config files** created (pnpm-workspace.yaml, turbo.json)

## Migration Benefits

1. **Better Dependency Management**: pnpm workspace handles shared dependencies efficiently
2. **Faster Builds**: Turbo caching reduces build times significantly
3. **Clear Separation**: Clients and packages are clearly separated
4. **Reusability**: Packages can be easily shared across clients
5. **Modern Tooling**: Using industry-standard monorepo tools (pnpm + Turbo)
6. **Parallel Development**: Multiple packages can be developed independently
7. **Build Optimization**: Turbo only rebuilds what changed

## Common Issues & Solutions

### Issue: "Cannot find module @requestly/constants"
**Solution:** Run `pnpm install` and `turbo build` to ensure packages are built

### Issue: "workspace protocol not recognized"
**Solution:** Ensure you're using pnpm >= 8.0.0

### Issue: Web app fails to import from packages
**Solution:** Build packages first: `turbo build --filter=./packages/*`

### Issue: Extension can't find common/*
**Solution:** The path alias should work, but verify tsconfig.json paths are correct

## Rollback Plan

If you need to rollback:
1. Restore from git: `git checkout HEAD~1` (or specific commit)
2. Run `npm install` to restore old dependencies
3. The old structure files are still present (common/, etc) until cleanup

## Next Steps After Migration

1. ✅ Complete testing checklist (see TESTING_CHECKLIST.md)
2. Update CI/CD pipelines for new structure
3. Update deployment scripts
4. Train team on new commands and structure
5. Delete old files (common/, root index.js, etc.)
6. Update documentation for contributors
