# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Contentful App that implements a custom Rich Text Editor with enhanced features. The app is built as a React application using TypeScript and Vite, with a sophisticated rich text editor based on Slate.js and Plate plugins.

## Development Commands

### Core Development
- `npm start` or `npm run dev` - Start development server with Vite
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Code Quality
- `npm run lint` - Run Biome linter (replaces ESLint)
- `npm run lint:fix` - Auto-fix linting issues with Biome
- `npm test` - Run tests with Vitest

### Contentful App Management
- `npm run create-app-definition` - Create app definition in Contentful
- `npm run add-locations` - Add locations to app definition
- `npm run upload` - Upload app bundle to Contentful (interactive)
- `npm run upload-ci` - Upload app bundle to Contentful (CI mode, requires env vars)

## Architecture

### Entry Point & App Structure
- `src/index.tsx` - App entry point with React root and SDK provider
- `src/App.tsx` - Main app component that routes based on SDK location
- `src/locations/` - Contains components for different Contentful app locations (Field, ConfigScreen, Dialog, etc.)

### Core Rich Text Architecture
- `src/CoreRichText/` - **DO NOT EDIT**: This is essentially a clone of Contentful's official rich text editor
  - Built on Slate.js editor framework with Plate plugins
  - `RichTextEditor.tsx` - Main editor component
  - `plugins/` - Extensive plugin system for editor features (marks, blocks, embeds, etc.)
  - `Toolbar/` - Editor toolbar components
  - Custom serialization/deserialization for Contentful's rich text format
  - **Extension Points**: The editor supports adding custom plugins and render functions through props
  - Only modify CoreRichText if absolutely necessary for core functionality changes
  - **CRITICAL**: Do NOT add new block types or mark types - Contentful strictly validates against its schema

### Custom Implementation (Preferred Approach)
- `src/components/SERichTextEditor.tsx` - Custom wrapper that extends CoreRichText with color functionality
- `src/components/plugins.tsx` - Custom color plugin implementation
- Uses custom `renderLeaf` function to handle text coloring
- **Best Practice**: Extend functionality through the wrapper component rather than modifying CoreRichText directly
- Add new plugins via `additionalPlugins` prop and toolbar buttons via `additionalToolbarButtons` prop
- **Schema Compliance**: Extensions must work within Contentful's existing rich text schema - use data attributes or rendering changes, not new node types

### Key Dependencies
- **Slate.js ecosystem**: Core editor (slate, slate-react, slate-history, slate-hyperscript)
- **Plate plugins**: Extensive plugin system (@udecode/plate-*)
- **Contentful**: App SDK and field editors (@contentful/*)
- **Forma 36**: Contentful's design system (@contentful/f36-*)
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Vitest**: Testing framework
- **Biome**: Linting and formatting (replaces ESLint/Prettier)

## Code Style & Formatting

- Uses Biome for linting and formatting (configured in `biome.json`)
- 2-space indentation, 80-character line width
- Strict TypeScript configuration
- No console statements allowed in production code
- Auto-imports cleanup enabled

## Testing

- Tests use Vitest with jsdom environment
- Test files follow `*.test.tsx` or `*.spec.tsx` patterns
- Setup file: `src/setupTests.ts`
- Mock utilities available in `test/mocks/`

## Deployment

The app can be deployed to Contentful using the upload commands. For CI deployment, set these environment variables:
- `CONTENTFUL_ORG_ID`
- `CONTENTFUL_APP_DEF_ID` 
- `CONTENTFUL_ACCESS_TOKEN`
- don't run the dev server - I run that