import tokens from "@contentful/f36-tokens";
import { BLOCKS } from "@contentful/rich-text-types";
import { css } from "emotion";

import { RenderElementProps } from "../../internal/types";

const styles = {
  [BLOCKS.PARAGRAPH]: css`
    line-height: ${tokens.lineHeightDefault};
    margin-bottom: 1.5em;
    direction: inherit;
  `,
  "Paragraph 1": css`
    line-height: ${tokens.lineHeightDefault};
    margin-bottom: 1.5em;
    direction: inherit;
    font-weight: ${tokens.fontWeightMedium};
  `,
  "Paragraph 2": css`
    line-height: ${tokens.lineHeightDefault};
    margin-bottom: 1.5em;
    direction: inherit;
    font-style: italic;
  `,
};

export function Paragraph(props: RenderElementProps) {
  const element = props.element as unknown as Element;
  const paragraphType = element.data?.type || "default";
  const styleKey = styles[paragraphType] ? paragraphType : BLOCKS.PARAGRAPH;

  return (
    <div {...props.attributes} className={styles[styleKey]}>
      {props.children}
    </div>
  );
}
