# Examples

This directory contains example applications demonstrating how to use `@b87/tanstack-tw-table` in different frameworks and scenarios.

## Structure

- **`nextjs-app/`** - Standalone Next.js example application


## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (workspace package manager)

### Setup

1. Install dependencies from the root:
```bash
pnpm install
```

2. Build the main package:
```bash
pnpm run build
```

### Running Examples

#### Next.js Standalone Example

```bash
cd examples/nextjs-app
pnpm dev
```


## Deployment

### Demo Site (Vercel)

The demo site is configured for deployment on Vercel. The `vercel.json` in `examples/demo-site/` configures:

- Build command to build both the package and the demo site
- Output directory for Next.js
- Framework detection

To deploy:

1. Push to GitHub
2. Import project in Vercel
3. Vercel will auto-detect Next.js configuration
4. Set root directory to `examples/demo-site`

Or use Vercel CLI:

```bash
cd examples/demo-site
vercel
```

### Standalone Examples

The standalone examples can be deployed independently:

- **Next.js App**: Deploy to Vercel or any Node.js hosting
- **Vite App**: Deploy to Vercel, Netlify, or any static hosting

## Package Linking

All examples use pnpm workspaces to link the local `@b87/tanstack-tw-table` package:

```json
{
  "dependencies": {
    "@b87/tanstack-tw-table": "workspace:*"
  }
}
```

This ensures examples always use the latest local changes. When developing, run `pnpm run build` from the root to rebuild the package before testing in examples.

## Development Workflow

1. Make changes to the main package in `src/`
2. Run `pnpm run build` to rebuild the package
3. Changes are automatically reflected in examples (or restart dev servers)
4. Test changes in the demo site or standalone examples

For continuous development:

```bash
# Terminal 1: Watch mode for package
pnpm run dev

# Terminal 2: Demo site
pnpm run dev:demos
```

## Adding New Examples

To add a new example:

1. Create a new directory under `examples/`
2. Set up the framework (Next.js, Vite, etc.)
3. Add `package.json` with `"@b87/tanstack-tw-table": "workspace:*"`
4. Configure the build tool (Next.js config, Vite config, etc.)
5. Import and use `DataTable` from `@b87/tanstack-tw-table`

## Troubleshooting

### Package Not Found

If you see errors about `@b87/tanstack-tw-table` not being found:

1. Ensure you've run `pnpm install` from the root
2. Run `pnpm run build` to build the package
3. Check that `workspace:*` is set in the example's `package.json`

### Build Errors

If examples fail to build:

1. Ensure the main package is built: `pnpm run build`
2. Check that all peer dependencies are installed
3. Verify TypeScript configuration matches the example's framework

### CSS Not Loading

Ensure you import the theme CSS in your app:

```css
@import "@b87/tanstack-tw-table/theme-v3.css";
```

Or for Tailwind v4:

```css
@import "@b87/tanstack-tw-table/theme.css";
```

## Learn More

- [Main README](../../README.md) - Package documentation
- [API Documentation](../../docs/) - Detailed API reference
- [Demo Site](./demo-site/) - Interactive examples
