import * as React from "react";
import { ListBulletedIcon, DoneIcon } from "@contentful/f36-icons";
import { BLOCKS } from "@contentful/rich-text-types";
import { Menu } from "@contentful/f36-components";
import { ToolbarButton } from "../CoreRichText/plugins/shared/ToolbarButton";
import { useContentfulEditor } from "../CoreRichText/ContentfulEditorProvider";
import { toggleList } from "../CoreRichText/plugins/List/transforms/toggleList";
import { isListTypeActive } from "../CoreRichText/plugins/List/utils";
import { focus } from "../CoreRichText/helpers/editor";

interface ToolbarListTypeButtonProps {
  isDisabled?: boolean;
}

export const ToolbarListTypeButton = ({
  isDisabled,
}: ToolbarListTypeButtonProps) => {
  const editor = useContentfulEditor();

  const handleListTypeSelect = React.useCallback(
    (listType: string) => {
      if (!editor?.selection) return;

      // Check if we're already in a UL list
      const isAlreadyInULList = isListTypeActive(editor, BLOCKS.UL_LIST);

      // Only toggle list if we're not already in a UL list
      if (!isAlreadyInULList) {
        toggleList(editor, { type: BLOCKS.UL_LIST });
      }

      // Apply the listType data attribute
      // Find the current list element
      const listEntry = editor.above({
        // biome-ignore lint/suspicious/noExplicitAny: Slate node matching requires any for list detection
        match: (n: any) => n.type === BLOCKS.UL_LIST,
      });

      if (listEntry) {
        const [listElement, listPath] = listEntry;
        // biome-ignore lint/suspicious/noExplicitAny: List element needs any for data properties
        const existingData = (listElement as any).data || {};
        const updatedData = { ...existingData, listType };

        // biome-ignore lint/suspicious/noExplicitAny: Slate editor types require any for generic node operations
        editor.setNodes({ data: updatedData } as any, {
          at: listPath,
        });
      }

      focus(editor);
    },
    [editor],
  );

  if (!editor) return null;

  return (
    <Menu>
      <Menu.Trigger>
        <ToolbarButton
          title="List Type"
          testId="list-type-toolbar-button"
          onClick={() => {}}
          isActive={isListTypeActive(editor, BLOCKS.UL_LIST)}
          isDisabled={!!isDisabled}
        >
          <ListBulletedIcon />
        </ToolbarButton>
      </Menu.Trigger>
      <Menu.List>
        <Menu.Item onClick={() => handleListTypeSelect("bullets")}>
          <ListBulletedIcon style={{ marginRight: "8px" }} />
          Bullet List
        </Menu.Item>
        <Menu.Item onClick={() => handleListTypeSelect("ticks")}>
          <DoneIcon style={{ marginRight: "8px" }} />
          Tick List
        </Menu.Item>
      </Menu.List>
    </Menu>
  );
};
