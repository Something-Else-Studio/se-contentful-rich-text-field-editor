/** biome-ignore-all lint/suspicious/noConsole: Using console for debugging */

// Re-export types for backward compatibility
export type { SpecialContext } from "./types";

// Re-export styled components for backward compatibility
export {
  StyledParagraph,
  StyledTable,
  StyledTableRow,
  StyledListUL,
  StyledListOL,
} from "./styled-components";

// Re-export toolbar components for backward compatibility
export {
  ToolbarColorButton,
  ToolbarBackgroundColorButton,
} from "./toolbar-components";

// Re-export color utilities for backward compatibility
export {
  getSpecialContext,
  applyColorToSpecialElement,
  applyDataToSelection,
} from "./color-utils";

// Re-export plugin for backward compatibility
export { ColorPlugin } from "./color-plugin";
