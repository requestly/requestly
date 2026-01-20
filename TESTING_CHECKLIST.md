# Testing & Verification Checklist

## ✅ Initial Setup
- [ ] Run `pnpm install` successfully
- [ ] Verify all workspace packages are linked correctly
- [ ] Check for any dependency conflicts or errors

## 📦 Package Builds
- [ ] Build packages/constants: `cd packages/constants && pnpm build`
- [ ] Build packages/core: `cd packages/core && pnpm build`
- [ ] Build packages/utils: `cd packages/utils && pnpm build`
- [ ] Build packages/shared: `cd packages/shared && pnpm build`
- [ ] Build packages/analytics-vendors: `cd packages/analytics-vendors && pnpm build`
- [ ] Verify all packages have dist/ folders with proper outputs

## 🌐 Web App (clients/web)
- [ ] Install dependencies work
- [ ] Dev server starts: `turbo dev --filter=@requestly/web`
- [ ] No import errors in console
- [ ] Constants imported correctly from @requestly/constants
- [ ] Shared types/helpers work from @requestly/shared
- [ ] Hot module replacement works
- [ ] Build succeeds: `turbo build --filter=@requestly/web`
- [ ] Preview works: `cd clients/web && pnpm preview`

### Web App Feature Tests
- [ ] Login/authentication works
- [ ] Rules creation works
- [ ] API client works
- [ ] Mock server works
- [ ] Session recording works
- [ ] All pages load without errors

## 🔧 Browser Extension (clients/extension)
- [ ] Config generation works: `cd clients/extension/config && pnpm build`
- [ ] Extension common builds: `cd clients/extension/common && pnpm build`
- [ ] Extension MV3 builds: `cd clients/extension/mv3 && pnpm build`
- [ ] Build outputs exist in clients/extension/mv3/dist/
- [ ] Manifest is properly generated
- [ ] Load extension in browser (Chrome/Edge)

### Extension Feature Tests
- [ ] Extension loads without errors
- [ ] Service worker starts
- [ ] Content scripts inject
- [ ] Popup opens and works
- [ ] Rules apply to requests
- [ ] Session recording works
- [ ] Storage/sync works

## 🔄 Turbo Build System
- [ ] `turbo build` builds all packages in correct order
- [ ] `turbo dev` starts all development servers
- [ ] Cache works: run `turbo build` twice, second should be instant
- [ ] Filters work: `turbo build --filter=@requestly/web`

## 📝 Import Resolution Tests
- [ ] Search for any remaining `@requestly/requestly-core` imports (should be 0)
- [ ] Search for any `file:..` references in package.json files (should be 0)
- [ ] Verify all imports use workspace:* protocol
- [ ] Check TypeScript compilation has no errors: `turbo type-check`

## 🧹 Cleanup (After Verification)
- [ ] Delete `common/` folder (backed up)
- [ ] Delete root `index.js` file
- [ ] Delete root `rollup.config.js` file
- [ ] Clean old node_modules: `rm -rf node_modules && pnpm install`
- [ ] Remove package-lock.json files if any remain
- [ ] Update .gitignore if needed

## 🚀 Deployment Tests
- [ ] Test beta deployment script still works
- [ ] Test production build pipeline
- [ ] Verify no hardcoded paths to old structure
- [ ] Update CI/CD workflows if necessary

## 📚 Documentation Updates
- [x] README.md updated with monorepo structure
- [x] MIGRATION_SUMMARY.md created
- [ ] Update getting-started.md with new commands
- [ ] Update contributing guidelines if needed
- [ ] Update any other docs referencing old structure

## Known Issues to Monitor
1. **Extension config path**: May need to update `clients/extension/mv3/rollup.config.js` if config path is hardcoded
2. **Build scripts**: Scripts in `scripts/` folder may reference old `app/` paths
3. **Webpack analytics-vendors**: Check if webpack build in packages/analytics-vendors still works
4. **Concurrent builds**: Shared package needs to build before web app in dev mode

## Commands Quick Reference
```bash
# Install
pnpm install

# Build all
turbo build

# Dev all
turbo dev

# Dev specific
turbo dev --filter=@requestly/web
turbo dev --filter=@requestly/extension-mv3

# Build specific
turbo build --filter=@requestly/web

# Test
turbo test

# Lint
turbo lint

# Type check
turbo type-check
```
