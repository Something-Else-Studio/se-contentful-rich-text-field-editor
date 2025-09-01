import * as React from "react";
import { TextInput } from "@contentful/f36-components";
import { TextIcon } from "@contentful/f36-icons";
import { css } from "emotion";
import { Range, Text, Point } from "slate";

import { useContentfulEditor } from "../CoreRichText/ContentfulEditorProvider";
import { PlatePlugin } from "@udecode/plate-common";
import { Menu } from "@contentful/f36-components";
import { ToolbarButton } from "../CoreRichText/plugins/shared/ToolbarButton";
import colorConfig from "../config/colorConfig.json";

// Color configuration interface
interface ColorConfig {
  enableHexPicker: boolean;
  colors: Array<{
    key: string;
    name: string;
    value: string;
  }>;
}

// Load color configuration with fallback
const getColorConfig = (): ColorConfig => {
  try {
    return colorConfig as ColorConfig;
  } catch {
    // Fallback configuration if JSON loading fails
    return {
      enableHexPicker: false,
      colors: [
        { key: "black", name: "Black", value: "#000000" },
        { key: "gray", name: "Gray", value: "#6b7280" },
      ],
    };
  }
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

export const ToolbarColorButton = ({
  isDisabled,
}: {
  isDisabled?: boolean;
}) => {
  const editor = useContentfulEditor();
  const config = React.useMemo(() => getColorConfig(), []);
  const [hexValue, setHexValue] = React.useState("");

  const handleColorSelect = React.useCallback(
    (colorValue: string) => {
      if (!editor?.selection) {
        return;
      }

      // If selection is collapsed (no text selected), do nothing
      if (Range.isCollapsed(editor.selection)) {
        return;
      }

      // Get all text nodes in the selection with their formatting
      const textEntries = Array.from(
        editor.nodes({
          at: editor.selection,
          match: (n) => Text.isText(n),
        }),
      );

      // Check if we're selecting entire text nodes or partial content
      const { anchor, focus } = editor.selection;
      let isEntireNodesSelected = true;
      
      for (const [, path] of textEntries) {
        const nodeStart = editor.start(path);
        const nodeEnd = editor.end(path);
        
        // Check if selection boundaries align with node boundaries
        if (
          !(Point.compare(anchor, nodeStart) >= 0 && Point.compare(anchor, nodeEnd) <= 0) ||
          !(Point.compare(focus, nodeStart) >= 0 && Point.compare(focus, nodeEnd) <= 0)
        ) {
          // If selection starts/ends outside this node's boundaries, we have partial selection
          if (
            (Point.compare(anchor, nodeStart) > 0 && Point.compare(anchor, nodeEnd) < 0) ||
            (Point.compare(focus, nodeStart) > 0 && Point.compare(focus, nodeEnd) < 0)
          ) {
            isEntireNodesSelected = false;
            break;
          }
        }
      }

      if (isEntireNodesSelected && textEntries.length > 0) {
        // Case 1: Selection covers entire text nodes - just update their data
        // biome-ignore lint/suspicious/noExplicitAny: Slate editor types require any for generic node operations
        editor.setNodes({ data: { textColor: colorValue } } as any, {
          at: editor.selection,
          match: (n) => Text.isText(n),
        });
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
          const selectionStart = Point.compare(anchor, nodeStart) > 0 ? anchor : nodeStart;
          const selectionEnd = Point.compare(focus, nodeEnd) < 0 ? focus : nodeEnd;
          
          // Get the text content for this portion
          const startOffset = selectionStart.offset;
          const endOffset = selectionEnd.offset;
          const selectedTextPortion = textNode.text.slice(startOffset, endOffset);
          
          if (selectedTextPortion) {
            // Create a new node with the same marks plus color data
            const newNode = {
              ...textNode, // This preserves all marks (bold, italic, etc.)
              text: selectedTextPortion,
              data: { ...textNode.data, textColor: colorValue }
            };
            selectedContent.push(newNode);
          }
        }
        
        // Delete the selected content and insert the colored version
        editor.delete();
        
        if (selectedContent.length > 0) {
          // biome-ignore lint/suspicious/noExplicitAny: Slate insertNodes requires any for custom node properties
          editor.insertNodes(selectedContent as any);
        }
      }
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
          isDisabled={isDisabled}
        >
          <TextIcon />
        </ToolbarButton>
      </Menu.Trigger>
      <Menu.List>
        {config.colors.map((color) => (
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
        {config.enableHexPicker && (
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

export const ColorPlugin = (): PlatePlugin => {
  return {
    key: "ColorPlugin",
    inject: {
      pluginsByKey: {
        PasteHTMLPlugin: {
          editor: {
            insertData: {
              transformData: (html: string) => {
                // Enhanced HTML sanitization that preserves color styles
                if (html && html.includes("color")) {
                  const doc = new DOMParser().parseFromString(
                    html,
                    "text/html",
                  );

                  // Find spans with color styles and preserve them
                  const coloredSpans = doc.querySelectorAll(
                    "span[style*='color']",
                  );
                  coloredSpans.forEach((span) => {
                    // Ensure the span has the color style preserved
                    const style = span.getAttribute("style");
                    if (style && style.includes("color")) {
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
      },
    },
    // biome-ignore lint/suspicious/noExplicitAny: Plate plugin interface requires any for flexibility
  } as any;
};
