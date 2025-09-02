import type { Path } from "slate";
import type { Element } from "../CoreRichText/internal/types/editor";

// Type definition for getSpecialContext return value
export type SpecialContext =
  | {
      type: "table";
      level: "table";
      tablePath: Path;
      table: Element;
      rowPath: Path;
      row: Element;
      cellPath: Path;
      cell: Element;
    }
  | {
      type: "table";
      level: "row";
      rowPath: Path;
      row: Element;
      cellPath: Path;
      cell: Element;
    }
  | {
      type: "table";
      level: "cell";
      cellPath: Path;
      cell: Element;
    }
  | {
      type: "list";
      level: "list";
      listPath: Path;
      list: Element;
      listItemPath: Path;
      listItem: Element;
    }
  | null;
