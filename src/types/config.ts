// Configuration types for the Rich Text Editor App

export interface ColorConfig {
  key: string;
  name: string;
  value: string; // hex color value
  oppositeColor?: string; // for text readability
}

export interface TypographyStyle {
  fontSize: string;
  fontWeight: number;
  lineHeight: number;
  letterSpacing?: number;
}

export interface HeadingConfig {
  level: string; // h1, h2, h3, etc.
  name: string;
  tag: string;
  style: TypographyStyle;
}

export interface ParagraphConfig {
  key: string; // p-lg, p-base, etc.
  name: string;
  tag: string;
  style: TypographyStyle;
}

export interface TypographyConfig {
  font: string;
  baseLineHeight: number;
  headings: HeadingConfig[];
  paragraphs: ParagraphConfig[];
}

export interface ListConfig {
  key: string; // bullet, tick, cross, numbered
  name: string;
  tag: string; // ul, ol, tick-list, cross-list
  type: 'ul' | 'ol';
  listStyle?: string; // bullets, ticks, crosses
}

export interface AppConfiguration {
  colors: ColorConfig[];
  enableHexPicker: boolean;
  typography: TypographyConfig;
  lists: ListConfig[];
}

// Default configuration fallback
export const DEFAULT_CONFIG: AppConfiguration = {
  colors: [
    { key: 'black', name: 'Black', value: '#000000', oppositeColor: '#ffffff' },
    { key: 'white', name: 'White', value: '#ffffff', oppositeColor: '#000000' },
    { key: 'gray', name: 'Gray', value: '#6b7280' },
    { key: 'red', name: 'Red', value: '#ef4444' },
    { key: 'blue', name: 'Blue', value: '#3b82f6' },
    { key: 'green', name: 'Green', value: '#10b981' },
  ],
  enableHexPicker: true,
  typography: {
    font: 'Inter',
    baseLineHeight: 1.5,
    headings: [
      {
        level: 'h1',
        name: 'Heading 1',
        tag: 'h1',
        style: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.2 }
      },
      {
        level: 'h2',
        name: 'Heading 2',
        tag: 'h2',
        style: { fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.3 }
      },
      {
        level: 'h3',
        name: 'Heading 3',
        tag: 'h3',
        style: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 }
      }
    ],
    paragraphs: [
      {
        key: 'p-base',
        name: 'Paragraph',
        tag: 'p-base',
        style: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.5 }
      }
    ]
  },
  lists: [
    { key: 'bullet', name: 'Bullet List', tag: 'ul', type: 'ul', listStyle: 'bullets' },
    { key: 'numbered', name: 'Numbered List', tag: 'ol', type: 'ol' },
    { key: 'tick', name: 'Tick List', tag: 'tick-list', type: 'ul', listStyle: 'ticks' }
  ]
};