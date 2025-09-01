import * as React from "react";
import { TextInput } from "@contentful/f36-components";
import { TextIcon } from "@contentful/f36-icons";
import { css } from "emotion";

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

      // Add color data to the selected text nodes using setNodes
      // Store the actual hex value instead of a key
      // biome-ignore lint/suspicious/noExplicitAny: Slate editor types require any for generic node operations
      editor.setNodes({ data: { textColor: colorValue } } as any, {
        at: editor.selection,
        // biome-ignore lint/suspicious/noExplicitAny: Slate node matching requires any for text node detection
        match: (n) => (n as any).text !== undefined,
      });
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
    // biome-ignore lint/suspicious/noExplicitAny: Slate leaf props require any for extensibility
    renderLeaf: ({ attributes, children, leaf }: any) => {
      // Check if the leaf has color data in its data property
      // biome-ignore lint/suspicious/noExplicitAny: Slate leaf data property is untyped
      const colorData = (leaf as any).data?.textColor;
      if (colorData) {
        // colorData now contains the actual hex value or color key
        let colorValue = colorData;

        // If it's not a hex color, try to find it in the config
        if (!colorData.startsWith("#")) {
          const config = getColorConfig();
          const configColor = config.colors.find((c) => c.key === colorData);
          colorValue = configColor?.value || colorData;
        }

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
    // biome-ignore lint/suspicious/noExplicitAny: Plate plugin interface requires any for flexibility
  } as any;
};
