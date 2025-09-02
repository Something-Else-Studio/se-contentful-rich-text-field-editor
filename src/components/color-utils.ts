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

// Helper function to apply formatting to partial selections while preserving existing formatting
const applyPartialSelectionWithFormatting = (
  editor: PlateEditor,
  dataKey: string,
  dataValue: string,
) => {
  const { anchor, focus } = editor.selection!;

  editor.withoutNormalizing(() => {
    // Get all text nodes that intersect with the selection
    const intersectingNodes = Array.from(
      editor.nodes({
        at: editor.selection!,
        match: (n) => Text.isText(n),
      }),
    ) as [Text, Path][];

    console.log("Intersecting nodes:", intersectingNodes.length);

    // Process each intersecting node
    for (let i = 0; i < intersectingNodes.length; i++) {
      const nodeEntry = intersectingNodes[i];
      if (!nodeEntry) continue;
      const [node, path] = nodeEntry;
      const nodeStart = editor.start(path);
      const nodeEnd = editor.end(path);

      console.log(`Processing node ${i}:`, {
        // biome-ignore lint/suspicious/noExplicitAny: Slate text nodes need any for text property
        text: (node as any).text,
        path,
        nodeStart,
        nodeEnd,
        anchor,
        focus,
      });

      // Determine the parts of this node that are selected
      const selectionStart =
        Point.compare(anchor, nodeStart) >= 0 ? anchor : nodeStart;
      const selectionEnd = Point.compare(focus, nodeEnd) <= 0 ? focus : nodeEnd;

      const beforeSelection = Point.compare(selectionStart, nodeStart) > 0;
      const afterSelection = Point.compare(selectionEnd, nodeEnd) < 0;

      console.log("Selection analysis:", {
        selectionStart,
        selectionEnd,
        beforeSelection,
        afterSelection,
      });

      // biome-ignore lint/suspicious/noExplicitAny: Slate text nodes need any for data properties
      const textNode = node as any;
      const existingData = textNode.data || {};

      if (beforeSelection || afterSelection) {
        // Need to split this node
        const fullText = textNode.text;
        const beforeText = beforeSelection
          ? fullText.slice(0, selectionStart.offset - nodeStart.offset)
          : "";
        const selectedText = fullText.slice(
          selectionStart.offset - nodeStart.offset,
          selectionEnd.offset - nodeStart.offset,
        );
        const afterText = afterSelection
          ? fullText.slice(selectionEnd.offset - nodeStart.offset)
          : "";

        console.log("Splitting node:", {
          fullText,
          beforeText,
          selectedText,
          afterText,
        });

        // Remove the original node
        editor.removeNodes({ at: path });

        // Insert the parts back
        const parentPath = path.slice(0, -1);
        let insertIndex = path[path.length - 1] || 0;

        // Insert before part if it exists
        if (beforeText) {
          const beforeNode = {
            text: beforeText,
            data: existingData,
          };
          // biome-ignore lint/suspicious/noExplicitAny: Slate insertNodes requires any for custom node properties
          editor.insertNodes(beforeNode as any, {
            at: [...parentPath, insertIndex],
          });
          insertIndex++;
        }

        // Insert selected part with new formatting
        if (selectedText) {
          const selectedNode = {
            text: selectedText,
            data: { ...existingData, [dataKey]: dataValue },
          };
          // biome-ignore lint/suspicious/noExplicitAny: Slate insertNodes requires any for custom node properties
          editor.insertNodes(selectedNode as any, {
            at: [...parentPath, insertIndex],
          });
          insertIndex++;
        }

        // Insert after part if it exists
        if (afterText) {
          const afterNode = {
            text: afterText,
            data: existingData,
          };
          // biome-ignore lint/suspicious/noExplicitAny: Slate insertNodes requires any for custom node properties
          editor.insertNodes(afterNode as any, {
            at: [...parentPath, insertIndex],
          });
        }
      } else {
        // The entire node is selected - just update its data
        const updatedData = { ...existingData, [dataKey]: dataValue };
        // biome-ignore lint/suspicious/noExplicitAny: Slate editor types require any for generic node operations
        editor.setNodes({ data: updatedData } as any, { at: path });
      }
    }

    // After processing all nodes, merge adjacent nodes with identical formatting
    mergeAdjacentNodesWithSameFormatting(editor);
  });
};

// Helper function to merge adjacent text nodes with identical formatting
const mergeAdjacentNodesWithSameFormatting = (editor: PlateEditor) => {
  // Get the current block that contains the selection
  const blockEntry = editor.above({
    // biome-ignore lint/suspicious/noExplicitAny: Slate node matching requires any for block detection
    match: (n: any) => editor.isBlock(n),
  });

  if (!blockEntry) return;

  const [_block, blockPath] = blockEntry;

  // Get all text nodes in the block
  const textEntries = Array.from(
    editor.nodes({
      at: blockPath,
      match: (n) => Text.isText(n),
    }),
  ) as [Text, Path][];

  // Merge adjacent nodes with identical data
  for (let i = textEntries.length - 1; i > 0; i--) {
    const currentEntry = textEntries[i];
    const prevEntry = textEntries[i - 1];
    if (!currentEntry || !prevEntry) continue;

    const [currentNode, currentPath] = currentEntry;
    const [prevNode, prevPath] = prevEntry;

    // biome-ignore lint/suspicious/noExplicitAny: Slate text nodes need any for data properties
    const currentData = (currentNode as any).data || {};
    // biome-ignore lint/suspicious/noExplicitAny: Slate text nodes need any for data properties
    const prevData = (prevNode as any).data || {};

    // Check if data is identical
    const currentDataStr = JSON.stringify(currentData);
    const prevDataStr = JSON.stringify(prevData);

    if (currentDataStr === prevDataStr) {
      // Merge the nodes
      // biome-ignore lint/suspicious/noExplicitAny: Slate text nodes need any for text property
      const mergedText = (prevNode as any).text + (currentNode as any).text;
      const mergedNode = {
        text: mergedText,
        data: currentData,
      };

      // Remove both nodes
      editor.removeNodes({ at: currentPath });
      editor.removeNodes({ at: prevPath });

      // Insert merged node at previous position
      // biome-ignore lint/suspicious/noExplicitAny: Slate insertNodes requires any for custom node properties
      editor.insertNodes(mergedNode as any, { at: prevPath });
    }
  }
};

// Shared function to apply data attributes to selected text while preserving formatting
export const applyDataToSelection = (
  editor: PlateEditor,
  dataKey: string,
  dataValue: string,
) => {
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

  for (const [_node, path] of textEntries) {
    const nodeStart = editor.start(path);
    const nodeEnd = editor.end(path);

    // Check if selection boundaries align with node boundaries
    const anchorInNode =
      Point.compare(anchor, nodeStart) >= 0 &&
      Point.compare(anchor, nodeEnd) <= 0;
    const focusInNode =
      Point.compare(focus, nodeStart) >= 0 &&
      Point.compare(focus, nodeEnd) <= 0;

    // If either anchor or focus is outside this node, we have partial selection
    if (!anchorInNode || !focusInNode) {
      isEntireNodesSelected = false;
      break;
    }

    // Even if both points are within the node, check if they align with node boundaries
    const anchorAtStart = Point.equals(anchor, nodeStart);
    const focusAtEnd = Point.equals(focus, nodeEnd);

    // If selection doesn't cover the entire node, it's partial
    if (!(anchorAtStart && focusAtEnd)) {
      isEntireNodesSelected = false;
      break;
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
    // Case 2: Partial selection - preserve existing formatting while applying new formatting
    applyPartialSelectionWithFormatting(editor, dataKey, dataValue);
  }
};
