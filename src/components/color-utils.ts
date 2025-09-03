/** biome-ignore-all lint/suspicious/noConsole: Using console for debugging */
import { Range, Text, Point, Path } from "slate";
import { BLOCKS } from "@contentful/rich-text-types";
import { PlateEditor } from "@udecode/plate-common";
import type { Element } from "../CoreRichText/internal/types/editor";
import type { SpecialContext } from "./types";

// Helper function to detect special contexts (table or list) and determine target level
export const getSpecialContext = (
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
export const applyColorToSpecialElement = (
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

// Helper function to handle block-level coloring for collapsed selections
const handleBlockLevelColoring = (
  editor: PlateEditor,
  dataKey: string,
  dataValue: string,
  anchor: Point,
) => {
  // Try to get the parent block
  const blockEntry = editor.above({
    // biome-ignore lint/suspicious/noExplicitAny: Slate node matching requires any for block detection
    match: (n: any) => editor.isBlock(n),
  });

  if (!blockEntry) {
    console.log("No parent block found, returning");
    return;
  }

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
  ];

  const isSupportedBlock = supportedBlockTypes.includes(typedBlock.type);
  console.log("Is supported block type:", isSupportedBlock);

  if (!isSupportedBlock) {
    console.log("Unsupported block type, returning");
    return;
  }

  // Get the start position of the block
  const blockStart = editor.start(blockPath);
  console.log("Block start position:", blockStart);

  // Check if cursor is at block start
  const isAtBlockStart = Point.equals(anchor, blockStart);
  console.log("Is at block start:", isAtBlockStart);

  if (!isAtBlockStart) {
    console.log("Not at block start, returning");
    return;
  }

  // Check if this is a paragraph inside a container (blockquote, list item)
  let targetPath = blockPath;
  let targetDescription = `${typedBlock.type} block`;

  if (typedBlock.type === BLOCKS.PARAGRAPH) {
    console.log("Current block is paragraph, checking for container parent");

    // Look for container ancestors (blockquote, list item)
    const containerEntry = editor.above({
      at: blockPath,
      // biome-ignore lint/suspicious/noExplicitAny: Slate node matching requires any for container detection
      match: (n: any) => [BLOCKS.QUOTE, BLOCKS.LIST_ITEM].includes(n.type),
    });

    if (containerEntry) {
      const [container, containerPath] = containerEntry;
      const typedContainer = container as Element;
      console.log("Found container parent:", { container, containerPath });

      // Check if this paragraph is the first child of the container
      const firstChildPath = [...containerPath, 0];
      const isFirstChild = Path.equals(blockPath, firstChildPath);
      console.log("Is first child of container:", isFirstChild);

      if (isFirstChild) {
        console.log("Using container as target instead of paragraph");
        targetPath = containerPath;
        targetDescription = `${typedContainer.type} container`;
      }
    }
  }

  console.log("Final target:", { targetPath, targetDescription });
  console.log(`Applying ${dataKey} to entire ${targetDescription}`);

  // Check if we're targeting a container vs a regular block
  if (targetPath !== blockPath) {
    // Targeting a container - apply data to the container element
    const [containerNode] = editor.node(targetPath);
    // biome-ignore lint/suspicious/noExplicitAny: Slate container nodes need any for data properties
    const containerElement = containerNode as any;
    const existingData = containerElement.data || {};
    const updatedData = { ...existingData, [dataKey]: dataValue };

    console.log("Updating container element with data:", updatedData);
    // biome-ignore lint/suspicious/noExplicitAny: Slate editor types require any for generic node operations
    editor.setNodes({ data: updatedData } as any, { at: targetPath });
  } else {
    // Targeting a regular block - apply to text nodes using setNodes with split
    console.log("Applying data to text nodes in block using setNodes");

    editor.setNodes(
      (node: any) => ({
        ...node,
        data: { ...(node.data || {}), [dataKey]: dataValue },
      }),
      {
        at: targetPath,
        match: (n) => Text.isText(n),
        split: true,
      },
    );
  }

  console.log("Block-level color application complete");
};

// Shared function to apply data attributes to selected text while preserving formatting
export const applyDataToSelection = (
  editor: PlateEditor,
  dataKey: string,
  dataValue: string,
) => {
  console.log("Applying data", editor.selection, dataKey, dataValue);
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

    // Handle block-level coloring for collapsed selections
    handleBlockLevelColoring(editor, dataKey, dataValue, anchor);
    return;
  }

  // For expanded selections, use Slate's setNodes with split for automatic node handling
  console.log("Applying data to expanded selection using setNodes with split");

  editor.setNodes({ data: { [dataKey]: dataValue } } as Partial<Node>, {
    at: editor.selection,
    match: (n) => Text.isText(n),
    split: true,
  });

  console.log("Color application complete");
};
