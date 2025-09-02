import * as React from "react";
import { BLOCKS } from "@contentful/rich-text-types";
import { PlatePluginComponent } from "@udecode/plate-common";
import { useTypography } from "../contexts/ConfigContext";

// Styled Paragraph component that handles configured paragraph styles
export const StyledParagraph: PlatePluginComponent = ({
  attributes,
  children,
  element,
}) => {
  const typography = useTypography();
  const elementData = element.data;

  // Get paragraph style from data
  const paragraphTag = elementData?.["paragraphStyle"] as string | undefined;

  // Find the style configuration by tag
  let paragraphConfig = undefined;
  if (paragraphTag) {
    paragraphConfig = typography.paragraphs.find((p) => p.tag === paragraphTag);
  }

  // Apply styles
  const style: React.CSSProperties = {
    marginBottom: "1.5em",
    direction: "inherit",
  };

  if (paragraphConfig) {
    style.fontSize = paragraphConfig.style.fontSize;
    style.fontWeight = paragraphConfig.style.fontWeight;
    style.lineHeight = paragraphConfig.style.lineHeight;
    if (paragraphConfig.style.letterSpacing) {
      style.letterSpacing = `${paragraphConfig.style.letterSpacing}px`;
    }
  }

  // Handle color data if present
  if (elementData?.textColor || elementData?.backgroundColor) {
    if (elementData.textColor) {
      const colorValue = elementData.textColor.startsWith("#")
        ? elementData.textColor
        : elementData.textColor; // Color resolution handled in renderLeaf
      style.color = colorValue;
    }
    if (elementData.backgroundColor) {
      const bgValue = elementData.backgroundColor.startsWith("#")
        ? elementData.backgroundColor
        : elementData.backgroundColor; // Color resolution handled in renderLeaf
      style.backgroundColor = bgValue;
    }
  }

  return (
    <div {...attributes} style={style}>
      {children}
    </div>
  );
};

// Custom table components with color support
export const StyledTable: PlatePluginComponent = ({
  element,
  attributes,
  children,
}) => {
  const elementData = element.data;
  const style: React.CSSProperties = {};

  if (elementData?.textColor || elementData?.backgroundColor) {
    if (elementData.textColor) {
      const colorValue = elementData.textColor.startsWith("#")
        ? elementData.textColor
        : elementData.textColor; // Color resolution handled in renderLeaf
      style.color = colorValue;
    }
    if (elementData.backgroundColor) {
      const bgValue = elementData.backgroundColor.startsWith("#")
        ? elementData.backgroundColor
        : elementData.backgroundColor; // Color resolution handled in renderLeaf
      style.backgroundColor = bgValue;
    }
  }

  return (
    <div data-block-type={BLOCKS.TABLE}>
      <table
        {...attributes}
        style={{ borderCollapse: "collapse", width: "100%", ...style }}
      >
        <tbody>{children}</tbody>
      </table>
    </div>
  );
};

export const StyledTableRow: PlatePluginComponent = ({
  element,
  attributes,
  children,
}) => {
  const elementData = element.data;
  const style: React.CSSProperties = {};

  if (elementData?.textColor || elementData?.backgroundColor) {
    if (elementData.textColor) {
      const colorValue = elementData.textColor.startsWith("#")
        ? elementData.textColor
        : elementData.textColor; // Color resolution handled in renderLeaf
      style.color = colorValue;
    }
    if (elementData.backgroundColor) {
      const bgValue = elementData.backgroundColor.startsWith("#")
        ? elementData.backgroundColor
        : elementData.backgroundColor; // Color resolution handled in renderLeaf
      style.backgroundColor = bgValue;
    }
  }

  return (
    <tr {...attributes} style={style}>
      {children}
    </tr>
  );
};

// Table cells don't support data attributes, so we use default rendering
// Colors are applied to text nodes within cells via renderLeaf function

// Custom list components with color support
export const StyledListUL: PlatePluginComponent = ({
  element,
  attributes,
  children,
}) => {
  const elementData = element.data;
  const style: React.CSSProperties = {};

  if (elementData?.textColor || elementData?.backgroundColor) {
    if (elementData.textColor) {
      const colorValue = elementData.textColor.startsWith("#")
        ? elementData.textColor
        : elementData.textColor; // Color resolution handled in renderLeaf
      style.color = colorValue;
    }
    if (elementData.backgroundColor) {
      const bgValue = elementData.backgroundColor.startsWith("#")
        ? elementData.backgroundColor
        : elementData.backgroundColor; // Color resolution handled in renderLeaf
      style.backgroundColor = bgValue;
    }
  }

  // Get the list type from data attribute (for future rendering)
  const listType = elementData?.listType || "bullets";

  return (
    <ul
      {...attributes}
      data-list-type={listType}
      style={{
        padding: 0,
        margin: "0 0 1.25rem 1.25rem",
        listStyleType: "disc",
        ...style,
      }}
    >
      {children}
    </ul>
  );
};

export const StyledListOL: PlatePluginComponent = ({
  element,
  attributes,
  children,
}) => {
  const elementData = element.data;
  const style: React.CSSProperties = {};

  if (elementData?.textColor || elementData?.backgroundColor) {
    if (elementData.textColor) {
      const colorValue = elementData.textColor.startsWith("#")
        ? elementData.textColor
        : elementData.textColor; // Color resolution handled in renderLeaf
      style.color = colorValue;
    }
    if (elementData.backgroundColor) {
      const bgValue = elementData.backgroundColor.startsWith("#")
        ? elementData.backgroundColor
        : elementData.backgroundColor; // Color resolution handled in renderLeaf
      style.backgroundColor = bgValue;
    }
  }

  return (
    <ol
      {...attributes}
      style={{
        padding: 0,
        margin: "0 0 1.25rem 1.25rem",
        listStyleType: "decimal",
        ...style,
      }}
    >
      {children}
    </ol>
  );
};
