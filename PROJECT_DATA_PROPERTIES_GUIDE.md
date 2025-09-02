# Rich Text Editor Data Properties Guide - Project Implementation

This document provides a comprehensive overview of the data properties used by components in the Contentful Rich Text Editor and their implementation within this project.

## Table of Contents

1. [Configuration Structure](#configuration-structure)
2. [Data Flow Architecture](#data-flow-architecture)
3. [Component Data Properties](#component-data-properties)
4. [Configuration Examples](#configuration-examples)
5. [Implementation Patterns](#implementation-patterns)

## Configuration Structure

### AppConfiguration Interface

The main configuration interface that drives all component behavior:

```typescript
interface AppConfiguration {
  colors: ColorConfig[];
  enableHexPicker: boolean;
  typography: TypographyConfig;
  lists: ListConfig[];
}
```

### Color Configuration

```typescript
interface ColorConfig {
  key: string;           // Unique identifier (e.g., "red", "blue")
  name: string;          // Display name (e.g., "Red", "Blue")
  value: string;         // Hex color value (e.g., "#ef4444")
  oppositeColor?: string; // For text readability on colored backgrounds
}
```

### Typography Configuration

```typescript
interface TypographyConfig {
  font: string;                    // Base font family
  baseLineHeight: number;           // Base line height
  headings: HeadingConfig[];       // Available heading styles
  paragraphs: ParagraphConfig[];   // Available paragraph styles
}

interface HeadingConfig {
  level: string;         // Heading level (h1, h2, h3, etc.)
  name: string;          // Display name
  tag: string;           // HTML tag
  style: TypographyStyle;
}

interface ParagraphConfig {
  key: string;           // Unique identifier (e.g., "p-lg", "p-base")
  name: string;          // Display name
  tag: string;           // HTML tag
  style: TypographyStyle;
}

interface TypographyStyle {
  fontSize: string;
  fontWeight: number;
  lineHeight: number;
  letterSpacing?: number;
}
```

### List Configuration

```typescript
interface ListConfig {
  key: string;           // Unique identifier (e.g., "bullet", "numbered")
  name: string;          // Display name
  tag: string;           // HTML tag
  type: 'ul' | 'ol';     // List type
  listStyle?: string;    // Custom list style (bullets, ticks, crosses)
}
```

## Data Flow Architecture

### Configuration Source Hierarchy

1. **Primary Source**: `sdk.parameters.installation.richTextConfig`
2. **Fallback**: `DEFAULT_CONFIG` (built-in defaults)
3. **Context Provider**: `ConfigProvider` wraps the editor
4. **Consumption**: Components use React hooks to access config

### Context Provider Pattern

```typescript
// ConfigContext.tsx
const ConfigProvider: React.FC<ConfigProviderProps> = ({ sdk, children }) => {
  const config = useMemo(() => {
    const installationParameters = sdk.parameters.installation as {
      richTextConfig?: AppConfiguration
    };
    return installationParameters?.richTextConfig || DEFAULT_CONFIG;
  }, [sdk.parameters.installation]);

  return (
    <ConfigContext.Provider value={{ config }}>
      {children}
    </ConfigContext.Provider>
  );
};
```

### Hook-Based Consumption

```typescript
// Specialized hooks for different config sections
export const useColors = () => {
  const { config } = useConfig();
  return {
    colors: config.colors,
    enableHexPicker: config.enableHexPicker
  };
};

export const useTypography = () => {
  const { config } = useConfig();
  return config.typography;
};

export const useLists = () => {
  const { config } = useConfig();
  return config.lists;
};
```

## Component Data Properties

### SERichTextEditor Component

**Props Interface:**
```typescript
type RichTextProps = {
  sdk: FieldAppSDK;
  isInitiallyDisabled: boolean;
  onAction?: RichTextTrackingActionHandler;
  restrictedMarks?: string[];
  minHeight?: string | number;
  maxHeight?: string | number;
  value?: Document;
  isDisabled?: boolean;
  isToolbarHidden?: boolean;
  actionsDisabled?: boolean;
};
```

**Configuration Usage:**
- Passes config via `ConfigProvider`
- Uses `renderLeaf` to apply color data from config
- Provides `customToolbar` and `customGetPlugins`

### Toolbar Components

#### Color Buttons (ToolbarColorButton, ToolbarBackgroundColorButton)

**Data Properties Applied:**
- `textColor`: Applied to selected text nodes
- `backgroundColor`: Applied to selected text nodes

**Configuration Source:**
- `useColors()` hook provides color palette
- `enableHexPicker` controls hex input availability

**Application Logic:**
```typescript
const handleColorSelect = React.useCallback(
  (colorValue: string) => {
    applyDataToSelection(editor, "textColor", colorValue);
  },
  [editor],
);
```

#### Heading/Paragraph Dropdown (HeadingParagraphDropdown)

**Data Properties Applied:**
- `paragraphStyle`: Applied to paragraph elements (references config key)

**Configuration Source:**
- `useTypography()` hook provides headings and paragraphs arrays

**Application Logic:**
```typescript
setNodes(
  editor,
  {
    type: BLOCKS.PARAGRAPH,
    data: { ...el.data, ["paragraphStyle"]: option.paragraphKey },
  },
  { at: editor.selection },
);
```

#### List Dropdown (ListDropdown)

**Data Properties Applied:**
- `listType`: Applied to list elements (for custom list styles)

**Configuration Source:**
- `useLists()` hook provides available list configurations

**Application Logic:**
```typescript
const updatedData = { ...existingData, listType: option.listType };
editor.setNodes({ data: updatedData } as any, {
  at: listPath,
});
```

### Plugin Components

#### StyledParagraph

**Data Properties Read:**
- `element.data.paragraphStyle`: References paragraph config key
- `element.data.textColor`: Text color (key or hex)
- `element.data.backgroundColor`: Background color (key or hex)

**Configuration Source:**
- `useTypography()` for paragraph styles
- `useColors()` for color resolution

#### StyledTable, StyledTableRow

**Data Properties Read:**
- `element.data.textColor`: Text color for table elements
- `element.data.backgroundColor`: Background color for table elements

**Configuration Source:**
- `useColors()` for color resolution

#### StyledListUL, StyledListOL

**Data Properties Read:**
- `element.data.listType`: Custom list style
- `element.data.textColor`: Text color
- `element.data.backgroundColor`: Background color

**Configuration Source:**
- `useColors()` for color resolution

### Text Node Data Properties

**Applied by Color System:**
- `textColor`: Color value (hex or config key)
- `backgroundColor`: Background color value (hex or config key)

**Resolution Logic:**
```typescript
const textColorData = leafData?.textColor;
if (textColorData && textColorData !== "") {
  let textColorValue = textColorData;
  // If it's not a hex color, try to find it in the config
  if (!textColorData.startsWith("#")) {
    const configColor = colors.find(
      (c) => c.key === textColorData,
    );
    textColorValue = configColor?.value || textColorData;
  }
  style.color = textColorValue;
}
```

## Configuration Examples

### Complete Configuration Example

```json
{
  "enableHexPicker": true,
  "colors": [
    {
      "key": "red",
      "name": "Red",
      "value": "#ef4444"
    },
    {
      "key": "blue",
      "name": "Blue",
      "value": "#3b82f6"
    },
    {
      "key": "black",
      "name": "Black",
      "value": "#000000",
      "oppositeColor": "#ffffff"
    }
  ],
  "typography": {
    "font": "Inter",
    "baseLineHeight": 1.5,
    "headings": [
      {
        "level": "h1",
        "name": "Heading 1",
        "tag": "h1",
        "style": {
          "fontSize": "2rem",
          "fontWeight": 700,
          "lineHeight": 1.2
        }
      }
    ],
    "paragraphs": [
      {
        "key": "p-lg",
        "name": "Large Paragraph",
        "tag": "p-lg",
        "style": {
          "fontSize": "1.125rem",
          "fontWeight": 400,
          "lineHeight": 1.75
        }
      }
    ]
  },
  "lists": [
    {
      "key": "bullet",
      "name": "Bullet List",
      "tag": "ul",
      "type": "ul",
      "listStyle": "bullets"
    },
    {
      "key": "tick",
      "name": "Tick List",
      "tag": "tick-list",
      "type": "ul",
      "listStyle": "ticks"
    }
  ]
}
```

### Element Data Examples

**Paragraph with Style:**
```json
{
  "type": "paragraph",
  "data": {
    "paragraphStyle": "p-lg"
  },
  "children": [...]
}
```

**Text with Colors:**
```json
{
  "type": "text",
  "data": {
    "textColor": "red",
    "backgroundColor": "#ffff00"
  },
  "text": "Colored text"
}
```

**List with Custom Style:**
```json
{
  "type": "ul",
  "data": {
    "listType": "ticks"
  },
  "children": [...]
}
```

## Implementation Patterns

### 1. Configuration Provider Pattern

```typescript
// In your main component
<ConfigProvider sdk={sdk}>
  <YourRichTextEditor />
</ConfigProvider>
```

### 2. Hook-Based Config Consumption

```typescript
const MyComponent = () => {
  const colors = useColors();
  const typography = useTypography();
  const lists = useLists();

  // Use config data...
};
```

### 3. Data Property Application

```typescript
const applyDataToSelection = (
  editor: PlateEditor,
  dataKey: string,
  dataValue: string,
) => {
  // Apply to selected text nodes
  const textEntries = Array.from(
    editor.nodes({
      at: editor.selection,
      match: (n) => Text.isText(n),
    }),
  ) as [Text, Path][];

  for (const [node, path] of textEntries) {
    const textNode = node as any;
    const existingData = textNode.data || {};
    const updatedData = { ...existingData, [dataKey]: dataValue };

    editor.setNodes({ data: updatedData } as any, { at: path });
  }
};
```

### 4. Color Resolution Pattern

```typescript
const resolveColor = (colorValue: string, colors: ColorConfig[]) => {
  if (colorValue.startsWith("#")) {
    return colorValue; // Already a hex value
  }

  const configColor = colors.find(c => c.key === colorValue);
  return configColor?.value || colorValue;
};