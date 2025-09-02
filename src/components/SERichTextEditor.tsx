import * as React from "react";
import type { RichTextTrackingActionHandler } from "../CoreRichText/plugins/Tracking";
import type { FieldAppSDK } from "@contentful/app-sdk";
import type { Document } from "@contentful/rich-text-types";
import { RichTextEditor } from "../CoreRichText";
import { CustomToolbar } from "./CustomToolbar";
import { getCustomPlugins } from "./customPlugins";
import { ConfigProvider, useColors } from "../contexts/ConfigContext";

type RichTextProps = {
  sdk: FieldAppSDK;
  isInitiallyDisabled: boolean;
  onAction?: RichTextTrackingActionHandler;
  restrictedMarks?: string[];
  minHeight?: string | number;
  maxHeight?: string | number;
  value?: Document;
  isDisabled?: boolean;
  isToolbarHidden?: boolean;
  actionsDisabled?: boolean;
};

// Inner component that uses the config context
const RichTextEditorWithConfig = (props: RichTextProps) => {
  const { colors } = useColors();

  // Custom renderLeaf function to handle color data on text nodes
  const renderLeaf = React.useCallback(
    // biome-ignore lint/suspicious/noExplicitAny: Slate leaf props require any for extensibility
    ({ attributes, children, leaf }: any) => {
      // biome-ignore lint/suspicious/noExplicitAny: Slate leaf data property is untyped
      const leafData = (leaf as any).data;
      const textColorData = leafData?.textColor;
      const backgroundColorData = leafData?.backgroundColor;

      // Build style object
      const style: React.CSSProperties = {};

      // Handle text color
      if (textColorData) {
        let textColorValue = textColorData;
        // If it's not a hex color, try to find it in the config
        if (!textColorData.startsWith("#")) {
          const configColor = colors.find(
            (c) => c.key === textColorData,
          );
          textColorValue = configColor?.value || textColorData;
        }
        style.color = textColorValue;
      }

      // Handle background color
      if (backgroundColorData) {
        let backgroundColorValue = backgroundColorData;
        // If it's not a hex color, try to find it in the config
        if (!backgroundColorData.startsWith("#")) {
          const configColor = colors.find(
            (c) => c.key === backgroundColorData,
          );
          backgroundColorValue = configColor?.value || backgroundColorData;
        }
        style.backgroundColor = backgroundColorValue;
      }

      // Apply styles if any colors are present
      if (Object.keys(style).length > 0) {
        return (
          <span {...attributes} style={style}>
            {children}
          </span>
        );
      }

      return <span {...attributes}>{children}</span>;
    },
    [colors],
  );

  return (
    <RichTextEditor
      {...props}
      minHeight={400}
      customToolbar={CustomToolbar}
      customGetPlugins={getCustomPlugins}
      renderLeaf={renderLeaf}
    />
  );
};

const SERichTextEditor = (props: RichTextProps) => {
  props.sdk.window.startAutoResizer();

  return (
    <ConfigProvider sdk={props.sdk}>
      <RichTextEditorWithConfig {...props} />
    </ConfigProvider>
  );
};

export default SERichTextEditor;
