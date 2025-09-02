/** biome-ignore-all lint/suspicious/noConsole: Using console for debugging */
import * as React from "react";
import { TextInput } from "@contentful/f36-components";
import { TextIcon } from "@contentful/f36-icons";
import { css } from "emotion";
import { Range, Text, Point, Path } from "slate";
import { BLOCKS } from "@contentful/rich-text-types";

import { useContentfulEditor } from "../CoreRichText/ContentfulEditorProvider";
import {
  PlateEditor,
  PlatePlugin,
  PlatePluginComponent,
} from "@udecode/plate-common";
import type { Element } from "../CoreRichText/internal/types/editor";
import { Menu } from "@contentful/f36-components";
import { ToolbarButton } from "../CoreRichText/plugins/shared/ToolbarButton";
import { useColors, useTypography } from "../contexts/ConfigContext";

// Color configuration is now handled through the configuration context

// Type definition for getSpecialContext return value
type SpecialContext =
  | {
      type: "table";
      level: "table";
      tablePath: Path;
      table: Element;
      rowPath: Path;
      row: Element;
      cellPath: Path;
      cell: Element;
    }
  | {
      type: "table";
      level: "row";
      rowPath: Path;
      row: Element;
      cellPath: Path;
      cell: Element;
    }
  | {
      type: "table";
      level: "cell";
      cellPath: Path;
      cell: Element;
    }
  | {
      type: "list";
      level: "list";
      listPath: Path;
      list: Element;
      listItemPath: Path;
      listItem: Element;
    }
  | null;

// Styled Paragraph component that handles configured paragraph styles
export const StyledParagraph: PlatePluginComponent = ({
  attributes,
  children,
  element,
}) => {
  const typography = useTypography();
  const elementData = element.data;

  // Get paragraph style from data
  const paragraphKey = elementData?.['paragraphStyle'] as string | undefined;
  
  // Find the style configuration
  let paragraphConfig = undefined;
  if (paragraphKey) {
    paragraphConfig = typography.paragraphs.find(p => p.key === paragraphKey);
  }

  // Apply styles
  const style: React.CSSProperties = {
    marginBottom: '1.5em',
    direction: 'inherit',
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

const styles = {
  colorMenuItem: css({
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    border: "2px solid #e5e7eb",
    cursor: "pointer",
    display: "inline-block",
    margin: "4px",
  }),
  hexInputContainer: css({
    padding: "8px",
    borderTop: "1px solid #e5e7eb",
  }),
  hexInput: css({
    width: "100%",
  }),
};

// Helper function to detect special contexts (table or list) and determine target level
const getSpecialContext = (
  editor: PlateEditor,
  anchor: Point,
): SpecialContext => {
  // First check if we're in a table cell
  const cellEntry = editor.above({
    at: anchor,
    // biome-ignore lint/suspicious/noExplicitAny: Slate node matching requires any for table cell detection
    match: (n: any) =>
      n.type === BLOCKS.TABLE_CELL || n.type === BLOCKS.TABLE_HEADER_CELL,
  });

  if (cellEntry) {
    const [cell, cellPath] = cellEntry;
    const typedCell = cell as Element;
    console.log("Found table cell:", { cell, cellPath });

    // Get the row entry
    const rowEntry = editor.above({
      at: cellPath,
      // biome-ignore lint/suspicious/noExplicitAny: Slate node matching requires any for row detection
      match: (n: any) => n.type === BLOCKS.TABLE_ROW,
    });

    if (!rowEntry) {
      console.log("No row found for cell");
      return { type: "table", level: "cell", cellPath, cell: typedCell };
    }

    const [row, rowPath] = rowEntry;
    const typedRow = row as Element;
    console.log("Found table row:", { row, rowPath });

    // Get the table entry
    const tableEntry = editor.above({
      at: rowPath,
      // biome-ignore lint/suspicious/noExplicitAny: Slate node matching requires any for table detection
      match: (n: any) => n.type === BLOCKS.TABLE,
    });

    if (!tableEntry) {
      console.log("No table found for row");
      return { type: "table", level: "cell", cellPath, cell: typedCell };
    }

    const [table, tablePath] = tableEntry;
    const typedTable = table as Element;
    console.log("Found table:", { table, tablePath });

    // Check if this is the first cell in the row
    const isFirstCellInRow = cellPath[cellPath.length - 1] === 0;

    // Check if this is the first row in the table
    const isFirstRowInTable = rowPath[rowPath.length - 1] === 0;

    console.log("Table position analysis:", {
      isFirstCellInRow,
      isFirstRowInTable,
    });

    // Determine target level based on position
    if (isFirstCellInRow && isFirstRowInTable) {
      return {
        type: "table",
        level: "table",
        tablePath,
        table: typedTable,
        rowPath,
        row: typedRow,
        cellPath,
        cell: typedCell,
      };
    } else if (isFirstCellInRow) {
      return {
        type: "table",
        level: "row",
        rowPath,
        row: typedRow,
        cellPath,
        cell: typedCell,
      };
    } else {
      return { type: "table", level: "cell", cellPath, cell: typedCell };
    }
  }

  // Check if we're in a list item
  const listItemEntry = editor.above({
    at: anchor,
    // biome-ignore lint/suspicious/noExplicitAny: Slate node matching requires any for list item detection
    match: (n: any) => n.type === BLOCKS.LIST_ITEM,
  });

  if (listItemEntry) {
    const [listItem, listItemPath] = listItemEntry;
    const typedListItem = listItem as Element;
    console.log("Found list item:", { listItem, listItemPath });

    // Get the list entry (ul or ol)
    const listEntry = editor.above({
      at: listItemPath,
      // biome-ignore lint/suspicious/noExplicitAny: Slate node matching requires any for list detection
      match: (n: any) => n.type === BLOCKS.UL_LIST || n.type === BLOCKS.OL_LIST,
    });

    if (!listEntry) {
      console.log("No list found for list item");
      return null;
    }

    const [list, listPath] = listEntry;
    const typedList = list as Element;
    console.log("Found list:", { list, listPath });

    // Check if this is the first item in the list
    const isFirstItemInList = listItemPath[listItemPath.length - 1] === 0;

    console.log("List position analysis:", { isFirstItemInList });

    // Check if we're at the start of the first paragraph in the first list item
    if (isFirstItemInList) {
      // Get the current block (should be a paragraph within the list item)
      const blockEntry = editor.above({
        at: anchor,
        // biome-ignore lint/suspicious/noExplicitAny: Slate node matching requires any for block detection
        match: (n: any) => editor.isBlock(n) && n.type === BLOCKS.PARAGRAPH,
      });

      if (blockEntry) {
        const [block, blockPath] = blockEntry;
        const blockStart = editor.start(blockPath);
        const isAtBlockStart = Point.equals(anchor, blockStart);

        console.log("List item block analysis:", {
          block,
          blockPath,
          isAtBlockStart,
        });

        if (isAtBlockStart) {
          return {
            type: "list",
            level: "list",
            listPath,
            list: typedList,
            listItemPath,
            listItem: typedListItem,
          };
        }
      }
    }

    // Not at the start of first item, so don't apply list-wide coloring
    return null;
  }

  return null;
};

// Helper function to apply color to the appropriate special element (table or list)
const applyColorToSpecialElement = (
  editor: PlateEditor,
  dataKey: string,
  dataValue: string,
  context: NonNullable<SpecialContext>,
) => {
  const { type, level } = context;

  console.log(`Applying ${dataKey} to ${type} ${level} level`);

  if (type === "table") {
    switch (level) {
      case "table": {
        const { tablePath, table } = context;
        // biome-ignore lint/suspicious/noExplicitAny: Table element needs any for data properties
        const tableElement = table as any;
        const existingData = tableElement.data || {};
        const updatedData = { ...existingData, [dataKey]: dataValue };

        console.log(
          "Updating table element:",
          tablePath,
          "with data:",
          updatedData,
        );

        // biome-ignore lint/suspicious/noExplicitAny: Slate editor types require any for generic node operations
        editor.setNodes({ data: updatedData } as any, {
          at: tablePath,
        });
        break;
      }

      case "row": {
        const { rowPath, row } = context;
        // biome-ignore lint/suspicious/noExplicitAny: Row element needs any for data properties
        const rowElement = row as any;
        const existingData = rowElement.data || {};
        const updatedData = { ...existingData, [dataKey]: dataValue };

        console.log(
          "Updating row element:",
          rowPath,
          "with data:",
          updatedData,
        );

        // biome-ignore lint/suspicious/noExplicitAny: Slate editor types require any for generic node operations
        editor.setNodes({ data: updatedData } as any, {
          at: rowPath,
        });
        break;
      }

      case "cell": {
        const { cellPath } = context;

        console.log(
          "Applying color to paragraph content within cell:",
          cellPath,
        );

        // Get all text nodes within the cell and apply color to them
        const cellTextEntries = Array.from(
          editor.nodes({
            at: cellPath,
            match: (n) => Text.isText(n),
          }),
        ) as [Text, Path][];

        console.log("Text nodes in cell:", cellTextEntries.length);

        // Apply color to each text node in the cell
        for (const [node, nodePath] of cellTextEntries) {
          // biome-ignore lint/suspicious/noExplicitAny: Slate text nodes need any for data properties
          const textNode = node as any;
          const existingData = textNode.data || {};
          const updatedData = { ...existingData, [dataKey]: dataValue };

          console.log(
            "Updating text node in cell:",
            nodePath,
            "with data:",
            updatedData,
          );

          // biome-ignore lint/suspicious/noExplicitAny: Slate editor types require any for generic node operations
          editor.setNodes({ data: updatedData } as any, {
            at: nodePath,
          });
        }
        break;
      }
    }
  } else if (type === "list") {
    switch (level) {
      case "list": {
        const { listPath, list } = context;
        // biome-ignore lint/suspicious/noExplicitAny: List element needs any for data properties
        const listElement = list as any;
        const existingData = listElement.data || {};
        const updatedData = { ...existingData, [dataKey]: dataValue };

        console.log(
          "Updating list element:",
          listPath,
          "with data:",
          updatedData,
        );

        // biome-ignore lint/suspicious/noExplicitAny: Slate editor types require any for generic node operations
        editor.setNodes({ data: updatedData } as any, {
          at: listPath,
        });
        break;
      }
    }
  }

  console.log("Special element color application complete");
};

// Shared function to apply data attributes to selected text while preserving formatting
const applyDataToSelection = (
  editor: PlateEditor,
  dataKey: string,
  dataValue: string,
) => {
  console.log("=== applyDataToSelection Debug ===");
  console.log("DataKey:", dataKey, "DataValue:", dataValue);
  console.log("Editor selection:", editor?.selection);
  console.log(
    "Selection collapsed:",
    editor?.selection ? Range.isCollapsed(editor.selection) : "no selection",
  );

  if (!editor?.selection) {
    console.log("No editor or selection, returning");
    return;
  }

  if (Range.isCollapsed(editor.selection)) {
    console.log("Selection is collapsed (cursor only)");

    // Get information about the current cursor position
    const { anchor } = editor.selection;
    console.log("Cursor position:", anchor);

    // First check if we're in a special context (table or list)
    const specialContext = getSpecialContext(editor, anchor);
    if (specialContext) {
      console.log("Special context detected:", specialContext);
      applyColorToSpecialElement(editor, dataKey, dataValue, specialContext);
      return;
    }

    // Try to get the parent block
    const blockEntry = editor.above({
      // biome-ignore lint/suspicious/noExplicitAny: Slate node matching requires any for block detection
      match: (n: any) => editor.isBlock(n),
    });

    if (blockEntry) {
      const [block, blockPath] = blockEntry;
      const typedBlock = block as Element;
      console.log("Parent block:", { block, blockPath });
      console.log("Block type:", typedBlock.type);

      // Check if it's a supported block type for background coloring
      const supportedBlockTypes: string[] = [
        BLOCKS.PARAGRAPH,
        BLOCKS.QUOTE,
        BLOCKS.HEADING_1,
        BLOCKS.HEADING_2,
        BLOCKS.HEADING_3,
        BLOCKS.HEADING_4,
        BLOCKS.HEADING_5,
        BLOCKS.HEADING_6,
        // List items would need special handling
      ];

      const isSupportedBlock = supportedBlockTypes.includes(typedBlock.type);
      console.log("Is supported block type:", isSupportedBlock);

      if (isSupportedBlock) {
        // Get the start position of the block
        const blockStart = editor.start(blockPath);
        console.log("Block start position:", blockStart);

        // Check if cursor is at block start
        const isAtBlockStart = Point.equals(anchor, blockStart);
        console.log("Is at block start:", isAtBlockStart);

        // Check if this is a paragraph inside a container (blockquote, list item)
        let targetPath = blockPath;
        let targetDescription = `${typedBlock.type} block`;

        if (typedBlock.type === BLOCKS.PARAGRAPH) {
          console.log(
            "Current block is paragraph, checking for container parent",
          );

          // Look for container ancestors (blockquote, list item)
          const containerEntry = editor.above({
            at: blockPath,
            // biome-ignore lint/suspicious/noExplicitAny: Slate node matching requires any for container detection
            match: (n: any) =>
              [BLOCKS.QUOTE, BLOCKS.LIST_ITEM].includes(n.type),
          });

          if (containerEntry) {
            const [container, containerPath] = containerEntry;
            const typedContainer = container as Element;
            console.log("Found container parent:", {
              container,
              containerPath,
            });
            console.log("Container type:", typedContainer.type);

            // Check if this paragraph is the first child of the container
            const firstChildPath = [...containerPath, 0];
            const isFirstChild = Path.equals(blockPath, firstChildPath);
            console.log(
              "Is first child of container:",
              isFirstChild,
              "Expected path:",
              firstChildPath,
            );

            if (isFirstChild) {
              console.log("Using container as target instead of paragraph");
              targetPath = containerPath;
              targetDescription = `${typedContainer.type} container`;
            }
          }
        }

        console.log("Final target:", { targetPath, targetDescription });

        // Apply color to entire target when at block start
        if (isAtBlockStart) {
          console.log(`Applying ${dataKey} to entire ${targetDescription}`);

          // Check if we're targeting a container (blockquote, list item) vs a regular block
          if (targetPath !== blockPath) {
            // We're targeting a container - apply color data to the container element itself
            console.log(
              "Targeting container - applying data to container element",
            );

            // Get existing data from the container
            const [containerNode] = editor.node(targetPath);
            // biome-ignore lint/suspicious/noExplicitAny: Slate container nodes need any for data properties
            const containerElement = containerNode as any;
            const existingData = containerElement.data || {};
            const updatedData = { ...existingData, [dataKey]: dataValue };

            console.log(
              "Updating container element:",
              targetPath,
              "with data:",
              updatedData,
            );

            // Apply data directly to the container element
            // biome-ignore lint/suspicious/noExplicitAny: Slate editor types require any for generic node operations
            editor.setNodes({ data: updatedData } as any, {
              at: targetPath,
            });
          } else {
            // We're targeting a regular block - apply to text nodes within the block
            console.log(
              "Targeting regular block - applying data to text nodes",
            );

            // Get all text nodes within the target block
            const blockTextEntries = Array.from(
              editor.nodes({
                at: targetPath,
                match: (n) => Text.isText(n),
              }),
            ) as [Text, Path][];

            console.log("Text nodes in block:", blockTextEntries.length);

            // Apply background color to each text node in the block
            for (const [node, nodePath] of blockTextEntries) {
              // biome-ignore lint/suspicious/noExplicitAny: Slate text nodes need any for data properties
              const textNode = node as any;
              const existingData = textNode.data || {};
              const updatedData = { ...existingData, [dataKey]: dataValue };

              console.log(
                "Updating text node:",
                nodePath,
                "with data:",
                updatedData,
              );

              // biome-ignore lint/suspicious/noExplicitAny: Slate editor types require any for generic node operations
              editor.setNodes({ data: updatedData } as any, {
                at: nodePath,
              });
            }
          }

          console.log("Color application complete");
          return;
        }
      }
    }

    console.log("Collapsed selection but not applying to block, returning");
    return;
  }

  // Get all text nodes in the selection with their formatting
  const textEntries = Array.from(
    editor.nodes({
      at: editor.selection,
      match: (n) => Text.isText(n),
    }),
  ) as [Text, Path][];

  // Check if we're selecting entire text nodes or partial content
  const { anchor, focus } = editor.selection;
  let isEntireNodesSelected = true;

  for (const [, path] of textEntries) {
    const nodeStart = editor.start(path);
    const nodeEnd = editor.end(path);

    // Check if selection boundaries align with node boundaries
    if (
      !(
        Point.compare(anchor, nodeStart) >= 0 &&
        Point.compare(anchor, nodeEnd) <= 0
      ) ||
      !(
        Point.compare(focus, nodeStart) >= 0 &&
        Point.compare(focus, nodeEnd) <= 0
      )
    ) {
      // If selection starts/ends outside this node's boundaries, we have partial selection
      if (
        (Point.compare(anchor, nodeStart) > 0 &&
          Point.compare(anchor, nodeEnd) < 0) ||
        (Point.compare(focus, nodeStart) > 0 &&
          Point.compare(focus, nodeEnd) < 0)
      ) {
        isEntireNodesSelected = false;
        break;
      }
    }
  }

  if (isEntireNodesSelected && textEntries.length > 0) {
    // Case 1: Selection covers entire text nodes - update each node to preserve existing data
    for (const [node, path] of textEntries) {
      // biome-ignore lint/suspicious/noExplicitAny: Slate text nodes need any for data properties
      const textNode = node as any;
      const existingData = textNode.data || {};
      const updatedData = { ...existingData, [dataKey]: dataValue };

      // biome-ignore lint/suspicious/noExplicitAny: Slate editor types require any for generic node operations
      editor.setNodes({ data: updatedData } as any, {
        at: path,
      });
    }
  } else {
    // Case 2: Partial selection - extract nodes with marks and recreate them
    // biome-ignore lint/suspicious/noExplicitAny: Slate node structure requires any for flexibility
    const selectedContent: any[] = [];

    for (const [node, path] of textEntries) {
      const nodeStart = editor.start(path);
      const nodeEnd = editor.end(path);
      // biome-ignore lint/suspicious/noExplicitAny: Slate text nodes need any for mark properties
      const textNode = node as any;

      // Determine what portion of this node is selected
      const selectionStart =
        Point.compare(anchor, nodeStart) > 0 ? anchor : nodeStart;
      const selectionEnd = Point.compare(focus, nodeEnd) < 0 ? focus : nodeEnd;

      // Get the text content for this portion
      const startOffset = selectionStart.offset;
      const endOffset = selectionEnd.offset;
      const selectedTextPortion = textNode.text.slice(startOffset, endOffset);

      if (selectedTextPortion) {
        // Create a new node with the same marks plus the new data
        const newNode = {
          ...textNode, // This preserves all marks (bold, italic, etc.)
          text: selectedTextPortion,
          data: { ...textNode.data, [dataKey]: dataValue },
        };
        selectedContent.push(newNode);
      }
    }

    // Delete the selected content and insert the updated version
    editor.delete();

    if (selectedContent.length > 0) {
      // biome-ignore lint/suspicious/noExplicitAny: Slate insertNodes requires any for custom node properties
      editor.insertNodes(selectedContent as any);
    }
  }
};

export const ToolbarColorButton = ({
  isDisabled,
}: {
  isDisabled?: boolean;
}) => {
  const editor = useContentfulEditor();
  const { colors, enableHexPicker } = useColors();
  const [hexValue, setHexValue] = React.useState("");

  const handleColorSelect = React.useCallback(
    (colorValue: string) => {
      applyDataToSelection(editor, "textColor", colorValue);
    },
    [editor],
  );

  const handleHexSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (hexValue && /^#[0-9A-Fa-f]{6}$/.test(hexValue)) {
        handleColorSelect(hexValue);
        setHexValue("");
      }
    },
    [hexValue, handleColorSelect],
  );

  if (!editor) return null;

  return (
    <Menu>
      <Menu.Trigger>
        <ToolbarButton
          title="Text Color"
          testId="color-toolbar-button"
          onClick={() => {}}
          isDisabled={!!isDisabled}
        >
          <TextIcon />
        </ToolbarButton>
      </Menu.Trigger>
      <Menu.List>
        {colors.map((color) => (
          <Menu.Item
            key={color.key}
            onClick={() => handleColorSelect(color.value)}
          >
            <div
              className={styles.colorMenuItem}
              style={{
                backgroundColor: color.value,
              }}
              title={color.name}
            />
            {color.name}
          </Menu.Item>
        ))}
        {enableHexPicker && (
          <div className={styles.hexInputContainer}>
            <form onSubmit={handleHexSubmit}>
              <TextInput
                className={styles.hexInput}
                placeholder="#000000"
                value={hexValue}
                onChange={(e) => setHexValue(e.target.value)}
                size="small"
                pattern="#[0-9A-Fa-f]{6}"
                title="Enter hex color (e.g., #ff0000)"
              />
            </form>
          </div>
        )}
      </Menu.List>
    </Menu>
  );
};

export const ToolbarBackgroundColorButton = ({
  isDisabled,
}: {
  isDisabled?: boolean;
}) => {
  const editor = useContentfulEditor();
  const { colors, enableHexPicker } = useColors();
  const [hexValue, setHexValue] = React.useState("");

  const handleBackgroundColorSelect = React.useCallback(
    (colorValue: string) => {
      applyDataToSelection(editor, "backgroundColor", colorValue);
    },
    [editor],
  );

  const handleHexSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (hexValue && /^#[0-9A-Fa-f]{6}$/.test(hexValue)) {
        handleBackgroundColorSelect(hexValue);
        setHexValue("");
      }
    },
    [hexValue, handleBackgroundColorSelect],
  );

  if (!editor) return null;

  return (
    <Menu>
      <Menu.Trigger>
        <ToolbarButton
          title="Background Color"
          testId="background-color-toolbar-button"
          onClick={() => {}}
          isDisabled={!!isDisabled}
        >
          {/* Using a simple colored square icon for background color */}
          <div
            style={{
              width: "16px",
              height: "16px",
              backgroundColor: "currentColor",
              border: "1px solid currentColor",
              borderRadius: "2px",
            }}
          />
        </ToolbarButton>
      </Menu.Trigger>
      <Menu.List>
        {colors.map((color) => (
          <Menu.Item
            key={color.key}
            onClick={() => handleBackgroundColorSelect(color.value)}
          >
            <div
              className={styles.colorMenuItem}
              style={{
                backgroundColor: color.value,
              }}
              title={color.name}
            />
            {color.name}
          </Menu.Item>
        ))}
        {enableHexPicker && (
          <div className={styles.hexInputContainer}>
            <form onSubmit={handleHexSubmit}>
              <TextInput
                className={styles.hexInput}
                placeholder="#000000"
                value={hexValue}
                onChange={(e) => setHexValue(e.target.value)}
                size="small"
                pattern="#[0-9A-Fa-f]{6}"
                title="Enter hex color (e.g., #ff0000)"
              />
            </form>
          </div>
        )}
      </Menu.List>
    </Menu>
  );
};

// Custom table components with color support
const StyledTable: PlatePluginComponent = ({
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

const StyledTableRow: PlatePluginComponent = ({
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
const StyledListUL: PlatePluginComponent = ({
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

const StyledListOL: PlatePluginComponent = ({
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

export const ColorPlugin = (): PlatePlugin => {
  return {
    key: "ColorPlugin",
    inject: {
      pluginsByKey: {
        PasteHTMLPlugin: {
          editor: {
            insertData: {
              transformData: (html: string) => {
                // Enhanced HTML sanitization that preserves color and background-color styles
                if (
                  html &&
                  (html.includes("color") || html.includes("background"))
                ) {
                  const doc = new DOMParser().parseFromString(
                    html,
                    "text/html",
                  );

                  // Find spans with color or background-color styles and preserve them
                  const styledSpans = doc.querySelectorAll(
                    "span[style*='color'], span[style*='background']",
                  );
                  styledSpans.forEach((span) => {
                    // Ensure the span has the color/background styles preserved
                    const style = span.getAttribute("style");
                    if (
                      style &&
                      (style.includes("color") || style.includes("background"))
                    ) {
                      span.setAttribute("style", style);
                    }
                  });

                  return doc.body.innerHTML;
                }

                return html;
              },
            },
          },
        },
        // Override table components with styled versions
        [BLOCKS.TABLE]: {
          component: StyledTable,
        },
        [BLOCKS.TABLE_ROW]: {
          component: StyledTableRow,
        },
        // Table cells use default rendering since colors are applied to text nodes within cells

        // Override list components with styled versions
        [BLOCKS.UL_LIST]: {
          component: StyledListUL,
        },
        [BLOCKS.OL_LIST]: {
          component: StyledListOL,
        },
      },
    },
  };
};
