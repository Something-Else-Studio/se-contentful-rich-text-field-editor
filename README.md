# Contentful Rich Text Editor with Enhanced Color Support

A Contentful App that implements a custom Rich Text Editor with enhanced color functionality, built on top of Contentful's official rich text editor components.

## License

This project is licensed under the MIT License - see the [LICENSE](#license) section below for details.

## Overview

This application extends Contentful's rich text editing capabilities with intelligent color support that works across different content structures including text, tables, blockquotes, and lists.

## Base Components

The core rich text editing functionality is based on Contentful's official field editors from:
https://github.com/contentful/field-editors

The `src/CoreRichText/` directory contains components that are essentially a clone of Contentful's official rich text editor, built on Slate.js editor framework with Plate plugins. These components provide the foundation for rich text editing within Contentful.

## Enhanced Features

### Intelligent Color Application

The enhanced color system provides context-aware coloring that applies colors at the appropriate structural level:

#### Text Color & Background Color Support
- **Text Color**: Changes the color of text content
- **Background Color**: Changes the background color of elements
- Both support predefined color palette and custom hex color input

#### Smart Context Detection

**Tables:**
- **First cell of first row** → Colors the entire table
- **First cell of any row** → Colors the entire row
- **Any other cell** → Colors the text content within that cell

**Lists (Ordered & Unordered):**
- **Start of first list item** → Colors the entire list
- **Other positions** → Normal text selection coloring

**Blockquotes:**
- **Start of first paragraph** → Colors the entire blockquote
- **Other positions** → Normal text selection coloring

**Regular Text:**
- **Selected text** → Colors only the selected portion
- **Cursor at paragraph start** → Colors the entire paragraph

### Technical Implementation

The color functionality is implemented through:

1. **Custom Plugin System**: `ColorPlugin` that extends the base rich text editor
2. **Smart Context Detection**: Analyzes cursor position and document structure
3. **Intelligent Color Application**: Applies colors at the appropriate element level
4. **Custom Rendering Components**: Styled components for tables, lists, and other elements
5. **Schema Compliance**: Uses Contentful's `data` attributes to store color information

## Architecture

### Core Rich Text (`src/CoreRichText/`)
⚠️ **DO NOT EDIT**: This directory contains the base rich text editor components cloned from Contentful's official implementation. Modifications should be made through extension points only.

- Built on Slate.js editor framework with Plate plugins
- Provides serialization/deserialization for Contentful's rich text format
- Supports all standard Contentful rich text features

### Custom Extensions (`src/components/`)
- **`SERichTextEditor.tsx`**: Main wrapper component that extends the base editor
- **`plugins.tsx`**: Color plugin implementation with context detection and styled components
- **`colorConfig.json`**: Color palette configuration

### Extension Strategy
The project follows a non-invasive extension approach:
- Uses `additionalPlugins` prop to add color functionality
- Uses `additionalToolbarButtons` prop to add color picker buttons
- Uses `renderLeaf` function for text-level color rendering
- Uses plugin component overrides for element-level color rendering

## Development

### Available Scripts

#### `npm start`
Creates or updates your app definition in Contentful, and runs the app in development mode.
Open your app to view it in the browser.

#### `npm run build`
Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

#### `npm run lint`
Runs Biome linter to check code style and catch errors.

#### `npm run lint:fix`
Auto-fixes linting issues with Biome.

#### `npm test`
Runs tests with Vitest.

#### `npm run upload`
Uploads the build folder to Contentful and creates a bundle that is automatically activated.
The command guides you through the deployment process and asks for all required arguments.

#### `npm run upload-ci`
Similar to `npm run upload` but reads all required arguments from environment variables.
Suitable for CI pipelines.

### Color Configuration
Edit `src/config/colorConfig.json` to customize the color palette:

```json
{
  "enableHexPicker": true,
  "colors": [
    { "key": "black", "name": "Black", "value": "#000000" },
    { "key": "red", "name": "Red", "value": "#ef4444" },
    ...
  ]
}
```

## Schema Compliance

The color implementation respects Contentful's rich text schema constraints:

- **Uses data attributes**: Colors are stored in element `data` fields
- **No new node types**: Extends existing elements rather than creating new ones
- **Preserves formatting**: Maintains bold, italic, and other text formatting when applying colors
- **Graceful degradation**: Content remains valid even without color support

## Deployment

The app can be deployed to Contentful using the upload commands. For CI deployment, set these environment variables:

- `CONTENTFUL_ORG_ID` - The ID of your organization
- `CONTENTFUL_APP_DEF_ID` - The ID of the app to which to add the bundle
- `CONTENTFUL_ACCESS_TOKEN` - A personal access token

## Libraries Used

- [Forma 36](https://f36.contentful.com/) – Contentful's design system
- [Contentful Field Editors](https://www.contentful.com/developers/docs/extensibility/field-editors/) – Contentful's field editor React components
- [Slate.js](https://docs.slatejs.org/) – Rich text editor framework
- [Plate](https://platejs.org/) – Plugin system for Slate.js

## License

MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Attribution

Base rich text editor components are derived from Contentful's field editors:
https://github.com/contentful/field-editors

The core rich text functionality (`src/CoreRichText/`) is based on Contentful's official implementation and is used in accordance with their license terms.

---

This project was bootstrapped with [Create Contentful App](https://github.com/contentful/create-contentful-app).