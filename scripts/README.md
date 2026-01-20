# Build & Deploy Scripts

This folder contains scripts for building, deploying, and managing the Requestly monorepo.

## Available Scripts

### `build.sh`
Main build script for production deployments.

### `install.sh`
Installation and setup script.

### `run.sh`
Script to run various development tasks.

### `test.sh`
Testing script for CI/CD pipelines.

## Usage

All scripts should be run from the repository root:

```bash
# Example
./scripts/build.sh
./scripts/test.sh
```

## Monorepo Commands

For day-to-day development, use pnpm and turbo commands instead:

```bash
# Development
pnpm dev              # Start all clients
pnpm dev:web          # Start web app
pnpm dev:extension    # Start extension watch mode

# Building
pnpm build            # Build everything
pnpm build:web        # Build web app only
pnpm build:extension  # Build extension only

# Testing
pnpm test             # Run all tests
pnpm lint             # Lint all code
```

## Script Maintenance

When adding new scripts:
1. Place them in this `scripts/` folder
2. Make them executable: `chmod +x scripts/your-script.sh`
3. Update this README with description
4. Test scripts work from repository root
