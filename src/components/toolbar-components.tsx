import * as React from "react";
import { TextInput } from "@contentful/f36-components";
import { TextIcon } from "@contentful/f36-icons";
import { css } from "emotion";
import { Menu } from "@contentful/f36-components";
import { ToolbarButton } from "../CoreRichText/plugins/shared/ToolbarButton";
import { useContentfulEditor } from "../CoreRichText/ContentfulEditorProvider";
import { useColors } from "../contexts/ConfigContext";
import type { ColorConfig } from "../types/config";
import { applyDataToSelection } from "./color-utils";

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
  const { colors, enableHexPicker } = useColors();
  const [hexValue, setHexValue] = React.useState("");

  const handleColorSelect = React.useCallback(
    (color: ColorConfig | string) => {
      const dataValue = typeof color === "string" ? color : color.name;
      applyDataToSelection(editor, "textColor", dataValue);
    },
    [editor],
  );

  const handleClearColor = React.useCallback(() => {
    applyDataToSelection(editor, "textColor", "");
  }, [editor]);

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
        <Menu.Item
          key="clear"
          onClick={handleClearColor}
          className={css({
            borderBottom: `1px solid #e5e7eb`,
            marginBottom: "4px",
            paddingBottom: "8px",
          })}
        >
          <div
            className={css({
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              border: "2px solid #e5e7eb",
              backgroundColor: "transparent",
              cursor: "pointer",
              display: "inline-block",
              margin: "4px",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: "50%",
                left: "10%",
                right: "10%",
                height: "2px",
                backgroundColor: "#ef4444",
                transform: "rotate(-45deg)",
              },
            })}
            title="Clear text color"
          />
          Clear Color
        </Menu.Item>
        {colors.map((color) => (
          <Menu.Item key={color.key} onClick={() => handleColorSelect(color)}>
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
    (color: ColorConfig | string) => {
      const dataValue = typeof color === "string" ? color : color.name;
      applyDataToSelection(editor, "backgroundColor", dataValue);
    },
    [editor],
  );

  const handleClearBackgroundColor = React.useCallback(() => {
    applyDataToSelection(editor, "backgroundColor", "");
  }, [editor]);

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
        <Menu.Item
          key="clear-background"
          onClick={handleClearBackgroundColor}
          className={css({
            borderBottom: `1px solid #e5e7eb`,
            marginBottom: "4px",
            paddingBottom: "8px",
          })}
        >
          <div
            className={css({
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              border: "2px solid #e5e7eb",
              backgroundColor: "transparent",
              cursor: "pointer",
              display: "inline-block",
              margin: "4px",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: "50%",
                left: "10%",
                right: "10%",
                height: "2px",
                backgroundColor: "#ef4444",
                transform: "rotate(-45deg)",
              },
            })}
            title="Clear background color"
          />
          Clear Background Color
        </Menu.Item>
        {colors.map((color) => (
          <Menu.Item
            key={color.key}
            onClick={() => handleBackgroundColorSelect(color)}
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
