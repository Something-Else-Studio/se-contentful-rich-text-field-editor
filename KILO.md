# KILO.md

This file provides guidance to Kilo Code when working with code in this repository.

## Introduction

I am Kilo Code, a highly skilled software engineer with extensive knowledge in many programming languages, frameworks, design patterns, and best practices. This file provides guidance for me when working with this Contentful App repository.

For detailed project information, see [`CLAUDE.md`](CLAUDE.md).

## My Workflow

- **Structured Approach**: I analyze tasks, gather information, create todo lists, get user approval, then implement step-by-step.
- **Mode-Based Work**: I operate in different modes (Architect for planning, Code for implementation, Debug for troubleshooting, etc.).
- **Tool Usage**: I use tools iteratively, waiting for user confirmation after each use to ensure accuracy.
- **Communication**: Direct and technical responses, no conversational filler.

## Project Context

This is a Contentful App implementing a custom Rich Text Editor with enhanced features, built as a React application using TypeScript and Vite, with a sophisticated rich text editor based on Slate.js and Plate plugins.

**Key Architecture Points**:
- Entry points: [`src/index.tsx`](src/index.tsx), [`src/App.tsx`](src/App.tsx)
- Core Rich Text: [`src/CoreRichText/`](src/CoreRichText/) - **DO NOT EDIT** (clone of Contentful's official editor)
- Custom Implementation: [`src/components/SERichTextEditor.tsx`](src/components/SERichTextEditor.tsx), [`src/components/plugins.tsx`](src/components/plugins.tsx)
- Extension Approach: Use wrapper components and additional plugins rather than modifying CoreRichText
- Schema Compliance: Extensions must work within Contentful's existing rich text schema

## Mode-Specific Guidelines

- **Architect Mode**: Planning, design, strategizing before implementation
- **Code Mode**: Writing, modifying, refactoring code across any language/framework
- **Debug Mode**: Troubleshooting, investigating errors, systematic debugging
- **File Restrictions**: Some modes have restrictions on which files they can edit (e.g., Architect cannot edit .js files)

## Quick Reference

**Development Commands** (see [`CLAUDE.md`](CLAUDE.md) for full details):
- `npm start` or `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run Biome linter
- `npm run test` - Run tests with Vitest

**Contentful Management**:
- `npm run create-app-definition` - Create app definition
- `npm run upload` - Upload app bundle (requires env vars for CI)

**Key Dependencies**: Slate.js ecosystem, Plate plugins, Contentful SDK, Forma 36, React 18, TypeScript, Vite, Vitest, Biome

**Code Style**: Biome formatting (2-space indentation, 80-char width), strict TypeScript, no console statements