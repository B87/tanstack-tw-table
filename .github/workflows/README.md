# GitHub Actions Workflows

This directory contains CI/CD workflows for the `@b87/tanstack-tw-table` package.

## Workflows

### 📦 `publish.yml` - Automated Publishing

**Trigger:** Pushes to tags matching `v*.*.*` (e.g., `v0.1.0`, `v1.2.3`)

**What it does:**
1. Runs type checking
2. Runs tests
3. Builds the package
4. Verifies package version matches tag
5. Publishes to npm
6. Creates a GitHub release

**Prerequisites:**
- `NPM_TOKEN` secret must be configured in repository settings
- See [PUBLISH.md](./PUBLISH.md) for detailed setup instructions

### ✅ `ci.yml` - Continuous Integration

**Trigger:** Pushes to `main`/`develop` branches and pull requests

**What it does:**
1. Runs type checking
2. Runs linter (non-blocking)
3. Runs tests
4. Builds package
5. Verifies build outputs

## Quick Start

To publish a new version:

```bash
# 1. Update version in package.json
npm version patch  # or minor, major

# 2. Commit and push
git push && git push --tags

# 3. The workflow will automatically:
#    - Build and test
#    - Publish to npm
#    - Create GitHub release
```

For more details, see [PUBLISH.md](./PUBLISH.md).
