import * as React from "react";
import type { RichTextTrackingActionHandler } from "../CoreRichText/plugins/Tracking";
import type { FieldAppSDK } from "@contentful/app-sdk";
import type { Document } from "@contentful/rich-text-types";
import { RichTextEditor } from "../CoreRichText";
import { ColorPlugin, ToolbarColorButton } from "./plugins";

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
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const additionalPlugins = [ColorPlugin() as any];
  const additionalToolbarButtons = [<ToolbarColorButton key="color" />];

  // Custom renderLeaf function to handle color data on text nodes
  const renderLeaf = React.useCallback(
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    ({ attributes, children, leaf }: any) => {
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
