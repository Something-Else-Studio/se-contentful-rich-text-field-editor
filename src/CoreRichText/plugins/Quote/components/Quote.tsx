import tokens from "@contentful/f36-tokens";
import { css } from "emotion";
import * as React from "react";

import { RenderElementProps } from "../../../internal/types";
import { useColors } from "../../../../contexts/ConfigContext";

const baseStyle = css({
  margin: "0 0 1.3125rem",
  borderLeft: `6px solid ${tokens.gray200}`,
  paddingLeft: "0.875rem",
  fontStyle: "normal",
});

export function Quote(props: RenderElementProps) {
  const { colors } = useColors();
  // biome-ignore lint/suspicious/noExplicitAny: Element data property typing issue similar to other components
  const elementData = (props.element as any).data;

  // Build dynamic style object for colors
  const dynamicStyle: React.CSSProperties = {};

  // Handle text color
  if (elementData?.textColor && elementData.textColor !== "") {
    let textColorValue = elementData.textColor;
    // If it's not a hex color, try to find it in the config
    if (!elementData.textColor.startsWith("#")) {
      const configColor = colors.find((c) => c.key === elementData.textColor);
      textColorValue = configColor?.value || elementData.textColor;
    }
    dynamicStyle.color = textColorValue;
  }

  // Handle background color
  if (elementData?.backgroundColor && elementData.backgroundColor !== "") {
    let backgroundColorValue = elementData.backgroundColor;
    // If it's not a hex color, try to find it in the config
    if (!elementData.backgroundColor.startsWith("#")) {
      const configColor = colors.find(
        (c) => c.key === elementData.backgroundColor,
      );
      backgroundColorValue = configColor?.value || elementData.backgroundColor;
    }
    dynamicStyle.backgroundColor = backgroundColorValue;
  }

  return (
    <blockquote {...props.attributes} className={baseStyle} style={dynamicStyle}>
      {props.children}
    </blockquote>
  );
}
