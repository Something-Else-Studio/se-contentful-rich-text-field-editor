#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Process tailwind.config.json and richtext.json into unified app configuration
 * Usage: node scripts/processConfig.js <tailwind-config-path> <richtext-config-path> [output-path]
 */

function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node scripts/processConfig.js <tailwind-config-path> <richtext-config-path> [output-path]');
    console.error('Example: node scripts/processConfig.js examples/tailwind.config.json examples/richtext.json');
    process.exit(1);
  }

  const [tailwindConfigPath, richtextConfigPath, outputPath] = args;

  try {
    // Read input files
    const tailwindConfig = JSON.parse(fs.readFileSync(tailwindConfigPath, 'utf8'));
    const richtextConfig = JSON.parse(fs.readFileSync(richtextConfigPath, 'utf8'));

    // Process the configuration
    const appConfig = processConfiguration(tailwindConfig, richtextConfig);

    // Output result
    const configJson = JSON.stringify(appConfig, null, 2);
    
    if (outputPath) {
      fs.writeFileSync(outputPath, configJson);
      console.error(`Configuration written to ${outputPath}`);
    } else {
      console.log(configJson);
    }

  } catch (error) {
    console.error('Error processing configuration:', error.message);
    process.exit(1);
  }
}

function processConfiguration(tailwindConfig, richtextConfig) {
  const config = {
    colors: processColors(tailwindConfig, richtextConfig),
    enableHexPicker: richtextConfig.enableHexPicker || false,
    typography: processTypography(tailwindConfig, richtextConfig),
    lists: processLists(richtextConfig)
  };

  // Validate configuration size (Contentful limit is 32KB)
  const configSize = JSON.stringify(config).length;
  if (configSize > 32000) {
    console.warn(`Warning: Configuration size is ${configSize} bytes, approaching 32KB limit`);
  }

  return config;
}

function processColors(tailwindConfig, richtextConfig) {
  const colorOptions = tailwindConfig.colorOptions || {};
  const colorOpposites = tailwindConfig.colorOpposites || {};
  const enabledColors = richtextConfig.colors || [];

  const colors = [];

  // Process enabled colors from richtext config
  for (const colorName of enabledColors) {
    const colorValue = colorOptions[colorName];
    if (!colorValue) {
      console.warn(`Warning: Color "${colorName}" referenced in richtext.json but not found in tailwind.config.json`);
      continue;
    }

    const colorKey = colorName.toLowerCase().replace(/\s+/g, '-');
    const oppositeColor = colorOpposites[colorName];

    colors.push({
      key: colorKey,
      name: colorName,
      value: colorValue,
      ...(oppositeColor && { oppositeColor })
    });
  }

  return colors;
}

function processTypography(tailwindConfig, richtextConfig) {
  const fontTable = tailwindConfig.fontTable || {};
  const headings = richtextConfig.headings || [];
  const paragraphs = richtextConfig.paragraphs || [];

  const typography = {
    font: fontTable.font || 'Inter',
    baseLineHeight: fontTable.lineHeight || 1.5,
    headings: [],
    paragraphs: []
  };

  // Process headings
  for (const heading of headings) {
    const fontStyle = fontTable.styles?.[heading.tag];
    if (!fontStyle) {
      console.warn(`Warning: Font style "${heading.tag}" referenced but not found in fontTable`);
      continue;
    }

    typography.headings.push({
      level: heading.tag,
      name: heading.name,
      tag: heading.tag,
      style: convertFontStyle(fontStyle, fontTable.lineHeight)
    });
  }

  // Process paragraphs
  for (const paragraph of paragraphs) {
    const fontStyle = fontTable.styles?.[paragraph.tag];
    if (!fontStyle) {
      console.warn(`Warning: Font style "${paragraph.tag}" referenced but not found in fontTable`);
      continue;
    }

    typography.paragraphs.push({
      key: paragraph.tag,
      name: paragraph.name,
      tag: paragraph.tag,
      style: convertFontStyle(fontStyle, fontTable.lineHeight)
    });
  }

  return typography;
}

function convertFontStyle(fontStyle, baseLineHeight = 1.5) {
  // Convert font style from tailwind config to CSS properties
  const style = {
    fontSize: convertFontSize(fontStyle.default),
    fontWeight: fontStyle.weight || 400,
    lineHeight: fontStyle.lineHeight || baseLineHeight
  };

  if (fontStyle.letterSpacing) {
    style.letterSpacing = fontStyle.letterSpacing;
  }

  return style;
}

function convertFontSize(sizeValue) {
  // Convert size to pixels if it's a number
  if (typeof sizeValue === 'number') {
    return `${sizeValue}px`;
  }
  
  // If it already has units, return as-is
  if (typeof sizeValue === 'string' && /\d+(px|rem|em|%)$/.test(sizeValue)) {
    return sizeValue;
  }

  // Assume pixels if no units
  return `${sizeValue}px`;
}

function processLists(richtextConfig) {
  const lists = richtextConfig.lists || [];
  
  const processedLists = [];

  for (const listConfig of lists) {
    const key = listConfig.tag === 'ul' ? 'bullet' :
                listConfig.tag === 'ol' ? 'numbered' :
                listConfig.tag.replace('-list', '');

    const type = listConfig.tag === 'ol' ? 'ol' : 'ul';
    
    const listStyle = listConfig.tag === 'tick-list' ? 'ticks' :
                     listConfig.tag === 'cross-list' ? 'crosses' :
                     listConfig.tag === 'ul' ? 'bullets' :
                     undefined;

    processedLists.push({
      key,
      name: listConfig.name,
      tag: listConfig.tag,
      type,
      ...(listStyle && { listStyle })
    });
  }

  return processedLists;
}

if (require.main === module) {
  main();
}

module.exports = { processConfiguration };