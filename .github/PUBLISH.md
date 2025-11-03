# Publishing Guide

This guide explains how to publish new versions of `@b87/tanstack-tw-table` to npm.

## Prerequisites

1. **npm Account Access**: Ensure you have access to publish to the `@b87` organization on npm
2. **NPM Token**: Add your npm token as a GitHub secret (see Setup below)
3. **Git Permissions**: Ability to create tags in the repository

## Setup (One-time)

### 1. Get Your npm Token

1. Log in to [npmjs.com](https://www.npmjs.com/)
2. Go to **Access Tokens** → **Generate New Token**
3. Choose **Automation** token type (recommended for CI/CD)
4. Copy the token (you won't see it again!)

### 2. Add Token to GitHub Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `NPM_TOKEN`
5. Value: Paste your npm automation token
6. Click **Add secret**

### 3. Verify Workflow File

The workflow file (`.github/workflows/publish.yml`) is already configured. It will:
- ✅ Trigger on tags matching `v*.*.*` (e.g., `v0.1.0`, `v1.2.3`)
- ✅ Run tests and type checking
- ✅ Build the package
- ✅ Verify package version matches tag
- ✅ Publish to npm
- ✅ Create a GitHub release

## Publishing a New Version

### Step 1: Update Version in package.json

```bash
# For patch release (0.1.0 → 0.1.1)
npm version patch

# For minor release (0.1.0 → 0.2.0)
npm version minor

# For major release (0.1.0 → 1.0.0)
npm version major

# Or manually edit package.json and commit
```

### Step 2: Update CHANGELOG.md (Optional but Recommended)

Document the changes in your release:

```markdown
## [0.1.0] - 2024-01-15

### Added
- Initial release
- Server-side filtering with QueryBuilder
- URL synchronization
- View management
```

### Step 3: Commit Changes

```bash
git add package.json CHANGELOG.md
git commit -m "chore: bump version to 0.1.0"
```

### Step 4: Create and Push Tag

The workflow triggers on tags. Create and push:

```bash
# Create tag matching package.json version
git tag v0.1.0

# Push tag (this triggers the GitHub Action)
git push origin v0.1.0

# Or push all tags
git push --tags
```

### Step 5: Monitor the Workflow

1. Go to **Actions** tab on GitHub
2. Watch the "Publish to npm" workflow run
3. Wait for it to complete (usually 2-3 minutes)
4. Check npm registry: https://www.npmjs.com/package/@b87/tanstack-tw-table

## Workflow Details

The publish workflow (`publish.yml`) does the following:

1. **Checks out code** from the tag
2. **Sets up pnpm and Node.js** (v20)
3. **Installs dependencies** with frozen lockfile
4. **Runs type check** (`pnpm typecheck`)
5. **Runs tests** (`pnpm test`)
6. **Builds package** (`pnpm build`)
7. **Verifies version** matches tag (prevents mismatched tags)
8. **Tests tarball** (`pnpm pack --dry-run`)
9. **Publishes to npm** (`pnpm publish`)
10. **Creates GitHub release** (with changelog link)

## Version Format

The workflow expects tags in the format: `v1.2.3`

- ✅ Valid: `v0.1.0`, `v1.2.3`, `v2.0.0-beta.1`
- ❌ Invalid: `0.1.0`, `release-0.1.0`

## Troubleshooting

### Workflow Fails: "package.json version doesn't match tag"

**Solution**: Update `package.json` version to match the tag before pushing:
```bash
# If tag is v0.1.0, package.json must have "version": "0.1.0"
npm version 0.1.0 --no-git-tag-version
git commit -am "chore: bump version"
git tag v0.1.0
git push origin v0.1.0
```

### Workflow Fails: "NPM_TOKEN not found"

**Solution**: Add the secret in GitHub repository settings (see Setup above)

### Workflow Fails: "Publish failed - Package name already exists"

**Solution**:
- For same version: Remove the failed release from npm or bump version
- For different version: Check if version was already published

### Test Locally First (Optional)

Before pushing a tag, you can test the publish process locally:

```bash
# Build and verify
pnpm build
pnpm pack --dry-run

# Test install in a temporary project
mkdir /tmp/test-install
cd /tmp/test-install
npm init -y
npm install /path/to/tanstack-data-table/b87-tanstack-tw-table-0.1.0.tgz
```

## Security Notes

- ✅ Uses **npm automation tokens** (recommended for CI/CD)
- ✅ Uses **npm provenance** (automatically enabled by GitHub Actions)
- ✅ Never commits tokens to repository
- ✅ Workflow only runs on tag pushes (prevents accidental publishes)

## Next Steps After Publishing

1. **Verify on npm**: Check https://www.npmjs.com/package/@b87/tanstack-tw-table
2. **Test installation**: `npm install @b87/tanstack-tw-table@latest` in a test project
3. **Update documentation**: If API changed, update README/examples
4. **Announce**: Share on Twitter, Reddit, or your project's communication channels
