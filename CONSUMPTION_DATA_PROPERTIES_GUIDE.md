# Rich Text Editor Data Properties Guide - Reusable Consumption

This document provides guidance on how to consume and adapt the data properties system from the Contentful Rich Text Editor for use in other projects implementing similar configurable component systems.

## Table of Contents

1. [Reusability Guide](#reusability-guide)
2. [Type Safety](#type-safety)
3. [Best Practices](#best-practices)
4. [Migration Path](#migration-path)

## Reusability Guide

### Extracting for Other Projects

1. **Copy Core Interfaces:**
   - `AppConfiguration`
   - `ColorConfig`
   - `TypographyConfig`
   - `ListConfig`

2. **Copy Context Implementation:**
   - `ConfigContext.tsx`
   - Provider and consumer hooks

3. **Adapt Component Patterns:**
   - Data property application logic
   - Color resolution system
   - Configuration-driven styling

### Type Safety

```typescript
// Define your configuration types
interface MyAppConfiguration {
  colors: ColorConfig[];
  typography: TypographyConfig;
  // Add project-specific config sections
}

// Create typed hooks
export const useMyConfig = (): MyAppConfiguration => {
  const { config } = useConfig();
  return config as MyAppConfiguration;
};
```

### Best Practices

1. **Configuration Validation:**
   - Validate config structure on load
   - Provide sensible defaults
   - Handle missing configuration gracefully

2. **Performance Optimization:**
   - Memoize configuration processing
   - Use React.memo for config-dependent components
   - Lazy load configuration sections

3. **Extensibility:**
   - Design config interfaces to be extensible
   - Use optional properties for new features
   - Version configuration format

4. **Error Handling:**
   - Graceful fallbacks for invalid config
   - User-friendly error messages
   - Logging for debugging

### Migration Path

When adapting this system to a new project:

1. Identify configurable aspects of your components
2. Define configuration interfaces
3. Implement context provider pattern
4. Create specialized hooks
5. Update components to consume configuration
6. Add data property application logic
7. Test with various configurations

This pattern provides a flexible, type-safe way to make components configurable while maintaining clean separation between configuration and implementation.

## Configuration Examples for Consumption

### Basic Color Configuration

```typescript
interface ColorConfig {
  key: string;
  name: string;
  value: string;
  oppositeColor?: string;
}

const colors: ColorConfig[] = [
  { key: "primary", name: "Primary", value: "#007bff" },
  { key: "secondary", name: "Secondary", value: "#6c757d" },
  { key: "success", name: "Success", value: "#28a745" }
];
```

### Typography Configuration

```typescript
interface TypographyConfig {
  font: string;
  baseLineHeight: number;
  headings: HeadingConfig[];
  paragraphs: ParagraphConfig[];
}

const typography: TypographyConfig = {
  font: "Roboto",
  baseLineHeight: 1.6,
  headings: [
    {
      level: "h1",
      name: "Heading 1",
      tag: "h1",
      style: { fontSize: "2rem", fontWeight: 700, lineHeight: 1.2 }
    }
  ],
  paragraphs: [
    {
      key: "body",
      name: "Body Text",
      tag: "p",
      style: { fontSize: "1rem", fontWeight: 400, lineHeight: 1.6 }
    }
  ]
};
```

### List Configuration

```typescript
interface ListConfig {
  key: string;
  name: string;
  tag: string;
  type: 'ul' | 'ol';
  listStyle?: string;
}

const lists: ListConfig[] = [
  { key: "bullet", name: "Bullet List", tag: "ul", type: "ul" },
  { key: "numbered", name: "Numbered List", tag: "ol", type: "ol" }
];
```

## Implementation Patterns for Other Projects

### 1. Configuration Provider Setup

```typescript
// ConfigContext.tsx
import React, { createContext, useContext, useMemo } from 'react';

interface ConfigContextValue {
  config: AppConfiguration;
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const config = useMemo(() => {
    // Load your configuration here
    return DEFAULT_CONFIG;
  }, []);

  return (
    <ConfigContext.Provider value={{ config }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = (): ConfigContextValue => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
```

### 2. Specialized Hooks

```typescript
export const useColors = () => {
  const { config } = useConfig();
  return config.colors;
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

### 3. Color Resolution Utility

```typescript
export const resolveColor = (
  colorValue: string,
  colors: ColorConfig[]
): string => {
  if (colorValue.startsWith("#")) {
    return colorValue; // Already a hex value
  }

  const configColor = colors.find(c => c.name === colorValue);
  return configColor?.value || colorValue;
};
```

### 4. Typography Resolution Utility

```typescript
export const resolveTypography = (
  tagValue: string,
  typography: TypographyConfig
) => {
  // Find paragraph by tag
  const paragraph = typography.paragraphs.find(p => p.tag === tagValue);
  if (paragraph) return paragraph;

  // Find heading by tag
  const heading = typography.headings.find(h => h.tag === tagValue);
  return heading;
};
```

### 5. Component Integration Example

```typescript
const StyledText: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color
}) => {
  const colors = useColors();
  const resolvedColor = color ? resolveColor(color, colors) : undefined;

  return (
    <span style={{ color: resolvedColor }}>
      {children}
    </span>
  );
};
```

## Advanced Usage Patterns

### Dynamic Configuration Loading

```typescript
const ConfigProvider: React.FC<{ configUrl?: string; children: React.ReactNode }> = ({
  configUrl,
  children
}) => {
  const [config, setConfig] = useState<AppConfiguration>(DEFAULT_CONFIG);

  useEffect(() => {
    if (configUrl) {
      fetch(configUrl)
        .then(res => res.json())
        .then(setConfig)
        .catch(() => setConfig(DEFAULT_CONFIG));
    }
  }, [configUrl]);

  return (
    <ConfigContext.Provider value={{ config }}>
      {children}
    </ConfigContext.Provider>
  );
};
```

### Configuration Validation

```typescript
const validateConfig = (config: any): AppConfiguration => {
  // Implement validation logic
  if (!config.colors || !Array.isArray(config.colors)) {
    throw new Error('Invalid colors configuration');
  }

  // Return validated config
  return config as AppConfiguration;
};
```

### Theme Switching

```typescript
const ThemeProvider: React.FC<{ theme: string; children: React.ReactNode }> = ({
  theme,
  children
}) => {
  const config = useMemo(() => {
    return THEMES[theme] || DEFAULT_CONFIG;
  }, [theme]);

  return (
    <ConfigContext.Provider value={{ config }}>
      {children}
    </ConfigContext.Provider>
  );
};
```

## Troubleshooting

### Common Issues

1. **Configuration not loading:**
   - Check that ConfigProvider wraps your components
   - Verify configuration format matches interfaces
   - Ensure hooks are called within provider context

2. **Colors not resolving:**
   - Confirm color names match configuration exactly
   - Check that hex values start with "#"
   - Verify color resolution is called with correct parameters

3. **Typography styles not applying:**
   - Ensure tag values match configuration tags
   - Check that components are using the correct resolution logic
   - Verify typography configuration structure

### Debugging Tips

```typescript
// Add logging to resolution functions
const resolveColor = (colorValue: string, colors: ColorConfig[]) => {
  console.log('Resolving color:', colorValue);
  console.log('Available colors:', colors);

  if (colorValue.startsWith("#")) {
    return colorValue;
  }

  const configColor = colors.find(c => c.name === colorValue);
  console.log('Found config color:', configColor);

  return configColor?.value || colorValue;
};
```

This consumption guide provides a foundation for implementing the data properties system in new projects while maintaining flexibility and extensibility.