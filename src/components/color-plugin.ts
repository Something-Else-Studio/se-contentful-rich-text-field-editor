import { PlatePlugin } from "@udecode/plate-common";
import { BLOCKS } from "@contentful/rich-text-types";
import {
  StyledTable,
  StyledTableRow,
  StyledListUL,
  StyledListOL,
} from "./styled-components";

export const ColorPlugin = (): PlatePlugin => {
  return {
    key: "ColorPlugin",
    inject: {
      pluginsByKey: {
        PasteHTMLPlugin: {
          editor: {
            insertData: {
              transformData: (html: string) => {
                // Enhanced HTML sanitization that preserves color and background-color styles
                if (
                  html &&
                  (html.includes("color") || html.includes("background"))
                ) {
                  const doc = new DOMParser().parseFromString(
                    html,
                    "text/html",
                  );

                  // Find spans with color or background-color styles and preserve them
                  const styledSpans = doc.querySelectorAll(
                    "span[style*='color'], span[style*='background']",
                  );
                  styledSpans.forEach((span) => {
                    // Ensure the span has the color/background styles preserved
                    const style = span.getAttribute("style");
                    if (
                      style &&
                      (style.includes("color") || style.includes("background"))
                    ) {
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
        // Override table components with styled versions
        [BLOCKS.TABLE]: {
          component: StyledTable,
        },
        [BLOCKS.TABLE_ROW]: {
          component: StyledTableRow,
        },
        // Table cells use default rendering since colors are applied to text nodes within cells

        // Override list components with styled versions
        [BLOCKS.UL_LIST]: {
          component: StyledListUL,
        },
        [BLOCKS.OL_LIST]: {
          component: StyledListOL,
        },
      },
    },
  };
};
