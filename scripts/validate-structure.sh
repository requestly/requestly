#!/bin/bash

# Quick validation script for monorepo migration
set -e

echo "🔍 Validating Requestly Monorepo Structure..."
echo ""

# Check directory structure
echo "✓ Checking directory structure..."
if [ -d "clients/web" ] && [ -d "clients/extension" ]; then
    echo "  ✓ Clients folders exist"
else
    echo "  ✗ Missing clients folders"
    exit 1
fi

if [ -d "packages/constants" ] && [ -d "packages/core" ] && [ -d "packages/utils" ] && [ -d "packages/shared" ]; then
    echo "  ✓ Package folders exist"
else
    echo "  ✗ Missing package folders"
    exit 1
fi

# Check configuration files
echo "✓ Checking configuration files..."
if [ -f "pnpm-workspace.yaml" ] && [ -f "turbo.json" ]; then
    echo "  ✓ Monorepo configs exist"
else
    echo "  ✗ Missing monorepo configs"
    exit 1
fi

# Check package.json files
echo "✓ Checking package.json files..."
for pkg in packages/constants packages/core packages/utils clients/web clients/extension/common clients/extension/mv3; do
    if [ -f "$pkg/package.json" ]; then
        echo "  ✓ $pkg/package.json exists"
    else
        echo "  ✗ Missing $pkg/package.json"
        exit 1
    fi
done

# Check for old structure remnants
echo "✓ Checking for old structure..."
if grep -r "@requestly/requestly-core" clients/web/src 2>/dev/null | head -1; then
    echo "  ⚠️  Found old @requestly/requestly-core imports - should be @requestly/constants"
else
    echo "  ✓ No old import patterns found"
fi

echo ""
echo "✅ Basic structure validation passed!"
echo ""
echo "Next steps:"
echo "  1. Run: pnpm install"
echo "  2. Run: turbo build"
echo "  3. Run: turbo dev --filter=@requestly/web"
echo ""
echo "For detailed testing, see TESTING_CHECKLIST.md"
