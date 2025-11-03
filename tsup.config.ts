import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/routing/index.ts'], // Main entry point and routing subpath
  format: ['cjs', 'esm'],
  dts: true, // Generate .d.ts files
  sourcemap: true,
  clean: true, // Clean output directory before building
  external: [
    'react',
    'react-dom',
    '@tanstack/react-table',
    'tailwindcss',
    // Radix UI dependencies
    '@radix-ui/react-checkbox',
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-label',
    '@radix-ui/react-popover',
    '@radix-ui/react-select',
    '@radix-ui/react-separator',
    '@radix-ui/react-slot',
    '@radix-ui/react-icons',
    // Other dependencies
    'class-variance-authority',
    'clsx',
    'cmdk',
    'date-fns',
    'lucide-react',
    'react-day-picker',
    'sonner',
    'tailwind-merge',
    'react-router-dom',
    'next',
    'next/navigation',
    '@tanstack/react-virtual',
  ],
  injectStyle: false, // Disable CSS bundling
});
