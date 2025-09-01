import * as React from "react";
import { Button } from "@contentful/f36-components";
import { css } from "emotion";

import { useContentfulEditor } from "../CoreRichText/ContentfulEditorProvider";
import { PlatePlugin } from "@udecode/plate-common";
import { Menu } from "@contentful/f36-components";

// Predefined color palette - using CSS classes instead of custom node types
const COLOR_CLASSES = {
  red: "text-red-500",
  blue: "text-blue-500",
  green: "text-green-500",
  yellow: "text-yellow-500",
  purple: "text-purple-500",
  pink: "text-pink-500",
  black: "text-black",
  gray: "text-gray-500",
} as const;

type ColorKey = keyof typeof COLOR_CLASSES;

const styles = {
  colorButton: css({
    height: "30px",
    width: "30px",
    marginLeft: "2px",
    marginRight: "2px",
  }),
  colorMenuItem: css({
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    border: "2px solid #e5e7eb",
    cursor: "pointer",
    display: "inline-block",
    margin: "4px",
  }),
};

export const ToolbarColorButton = ({
  isDisabled,
}: {
  isDisabled?: boolean;
}) => {
  const editor = useContentfulEditor();

  const handleColorSelect = React.useCallback(
    (colorKey: ColorKey) => {
      if (!editor?.selection) {
        // biome-ignore lint/suspicious/noConsole: <explanation>
        console.log("No selection found");
        return;
      }

      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.log("Selection", editor.selection);
      // Get the selected text content
      const selectedText = editor.string(editor.selection);
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.log("Selected text:", selectedText);
      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.log("Selected color:", colorKey);

      // Add color data to the selected text nodes using setNodes
      // This adds custom data to existing text nodes in the data property
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      editor.setNodes({ data: { textColor: colorKey } } as any, {
        at: editor.selection,
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        match: (n) => (n as any).text !== undefined,
      });

      // biome-ignore lint/suspicious/noConsole: <explanation>
      console.log("Added color data to selected text nodes");
    },
    [editor],
  );

  if (!editor) return null;

  return (
    <Menu>
      <Menu.Trigger>
        <Button
          size="small"
          className={styles.colorButton}
          isDisabled={isDisabled}
          testId="color-toolbar-button"
        >
          Color
        </Button>
      </Menu.Trigger>
      <Menu.List>
        {Object.keys(COLOR_CLASSES).map((colorKey) => (
          <Menu.Item
            key={colorKey}
            onClick={() => handleColorSelect(colorKey as ColorKey)}
          >
            <div
              className={styles.colorMenuItem}
              style={{
                backgroundColor:
                  colorKey === "red"
                    ? "#ef4444"
                    : colorKey === "blue"
                      ? "#3b82f6"
                      : colorKey === "green"
                        ? "#10b981"
                        : colorKey === "yellow"
                          ? "#f59e0b"
                          : colorKey === "purple"
                            ? "#8b5cf6"
                            : colorKey === "pink"
                              ? "#ec4899"
                              : colorKey === "black"
                                ? "#000000"
                                : "#6b7280",
              }}
              title={colorKey}
            />
            {colorKey}
          </Menu.Item>
        ))}
      </Menu.List>
    </Menu>
  );
};

export const ColorPlugin = (): PlatePlugin => {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  return {
    key: "ColorPlugin",
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    renderLeaf: ({ attributes, children, leaf }: any) => {
      // Check if the leaf has color data in its data property
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const colorData = (leaf as any).data?.textColor;
      if (colorData) {
        // Map color key to actual color value
        const colorValue =
          colorData === "red"
            ? "#ef4444"
            : colorData === "blue"
              ? "#3b82f6"
              : colorData === "green"
                ? "#10b981"
                : colorData === "yellow"
                  ? "#f59e0b"
                  : colorData === "purple"
                    ? "#8b5cf6"
                    : colorData === "pink"
                      ? "#ec4899"
                      : colorData === "black"
                        ? "#000000"
                        : "#6b7280";

        return (
          <span {...attributes} style={{ color: colorValue }}>
            {children}
          </span>
        );
      }

      return <span {...attributes}>{children}</span>;
    },
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
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  } as any;
};
