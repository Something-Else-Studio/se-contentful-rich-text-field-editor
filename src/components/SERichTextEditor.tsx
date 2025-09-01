import * as React from "react";
import type { RichTextTrackingActionHandler } from "../CoreRichText/plugins/Tracking";
import type { FieldAppSDK } from "@contentful/app-sdk";
import type { Document } from "@contentful/rich-text-types";
import { RichTextEditor } from "../CoreRichText";
import { ColorPlugin, ToolbarColorButton } from "./plugins";
import colorConfig from "../config/colorConfig.json";

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

const SERichTextEditor = (props: RichTextProps) => {
  // biome-ignore lint/suspicious/noExplicitAny: Slate editor types require any for generic operations
  const additionalPlugins = [ColorPlugin() as any];
  const additionalToolbarButtons = [<ToolbarColorButton key="color" />];

  // Custom renderLeaf function to handle color data on text nodes
  const renderLeaf = React.useCallback(
    // biome-ignore lint/suspicious/noExplicitAny: Slate leaf props require any for extensibility
    ({ attributes, children, leaf }: any) => {
      // Check if the leaf has color data in its data property
      // biome-ignore lint/suspicious/noExplicitAny: Slate leaf data property is untyped
      const colorData = (leaf as any).data?.textColor;
      if (colorData) {
        // colorData can be either a hex value or a color key
        let colorValue = colorData;

        // If it's not a hex color, try to find it in the config
        if (!colorData.startsWith("#")) {
          const configColor = colorConfig.colors.find(
            (c) => c.key === colorData,
          );
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
    [],
  );

  return (
    <RichTextEditor
      {...props}
      minHeight={400}
      additionalPlugins={additionalPlugins}
      additionalToolbarButtons={additionalToolbarButtons}
      renderLeaf={renderLeaf}
    />
  );
};

export default SERichTextEditor;
