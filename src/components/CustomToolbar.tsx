import * as React from "react";
import { FieldAppSDK } from "@contentful/app-sdk";
import { Flex, Menu } from "@contentful/f36-components";
import {
  ListBulletedIcon,
  ListNumberedIcon,
  DoneIcon,
  ChevronDownIcon,
  CloseIcon,
  MenuIcon,
} from "@contentful/f36-icons";
import tokens from "@contentful/f36-tokens";
import { BLOCKS, INLINES, MARKS } from "@contentful/rich-text-types";
import { css } from "emotion";

import { useContentfulEditor } from "../CoreRichText/ContentfulEditorProvider";
import {
  isMarkEnabled,
  isNodeTypeEnabled,
} from "../CoreRichText/helpers/validations";
import { toggleList } from "../CoreRichText/plugins/List/transforms/toggleList";
import { unwrapList } from "../CoreRichText/plugins/List/transforms/unwrapList";
import { isListTypeActive } from "../CoreRichText/plugins/List/utils";
import { focus } from "../CoreRichText/helpers/editor";
import { useLists, useTypography } from "../contexts/ConfigContext";
import { 
  getElementFromCurrentSelection,
  isBlockSelected,
  toggleElement,
} from "../CoreRichText/helpers/editor";
import { setNodes } from "../CoreRichText/internal/transforms";
import type { Element } from "../CoreRichText/internal/types";

// Import toolbar components we want to include
import { ToolbarHrButton } from "../CoreRichText/plugins/Hr";
import { ToolbarHyperlinkButton } from "../CoreRichText/plugins/Hyperlink";
import { ToolbarBoldButton } from "../CoreRichText/plugins/Marks/Bold";
import { ToolbarItalicButton } from "../CoreRichText/plugins/Marks/Italic";
import { ToolbarUnderlineButton } from "../CoreRichText/plugins/Marks/Underline";
import { ToolbarQuoteButton } from "../CoreRichText/plugins/Quote";
import { ToolbarTableButton } from "../CoreRichText/plugins/Table";
import { ButtonRedo } from "../CoreRichText/Toolbar/components/ButtonRedo";
import { ButtonUndo } from "../CoreRichText/Toolbar/components/ButtonUndo";
import { EmbedEntityWidget } from "../CoreRichText/Toolbar/components/EmbedEntityWidget";

// Import our custom components
import { ToolbarColorButton, ToolbarBackgroundColorButton } from "./plugins";

const styles = {
  toolbar: css({
    border: `1px solid ${tokens.gray400}`,
    backgroundColor: tokens.gray100,
    padding: tokens.spacingXs,
    borderRadius: `${tokens.borderRadiusMedium} ${tokens.borderRadiusMedium} 0 0`,
  }),
  divider: css({
    display: "inline-block",
    height: "21px",
    width: "1px",
    background: tokens.gray300,
    margin: `0 ${tokens.spacing2Xs}`,
  }),
  embedActionsWrapper: css({
    display: ["-webkit-box", "-ms-flexbox", "flex"],
    webkitAlignSelf: "flex-start",
    alignSelf: "flex-start",
    msFlexItemAlign: "start",
  }),
  formattingOptionsWrapper: css({
    display: ["-webkit-box", "-ms-flexbox", "flex"],
    msFlexAlign: "center",
    webkitBoxAlign: "center",
    alignItems: "center",
    msFlexWrap: "wrap",
    flexWrap: "wrap",
    marginRight: "20px",
  }),
};

interface ListOption {
  key: string;
  label: string;
  icon: React.ReactNode;
  blockType: BLOCKS | ""; // Allow empty string for "none" option
  listType?: string;
}

interface HeadingParagraphOption {
  key: string;
  label: string;
  type: 'paragraph' | 'heading';
  blockType: BLOCKS;
  style?: {
    fontSize: string;
    fontWeight: number;
    lineHeight: number;
    letterSpacing?: number;
  };
  paragraphKey?: string; // For paragraph styles
}

interface HeadingParagraphDropdownProps {
  isDisabled?: boolean;
  sdk: FieldAppSDK;
}

const HeadingParagraphDropdown: React.FC<HeadingParagraphDropdownProps> = ({ isDisabled, sdk }) => {
  const editor = useContentfulEditor();
  const [isOpen, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string>("paragraph-normal");
  const typography = useTypography();

  // Generate options from configuration
  const options: HeadingParagraphOption[] = React.useMemo(() => {
    const opts: HeadingParagraphOption[] = [];

    // Add normal paragraph first
    opts.push({
      key: "paragraph-normal",
      label: "Normal text",
      type: 'paragraph',
      blockType: BLOCKS.PARAGRAPH,
    });

    // Add configured paragraph styles
    for (const paragraph of typography.paragraphs) {
      opts.push({
        key: `paragraph-${paragraph.key}`,
        label: paragraph.name,
        type: 'paragraph',
        blockType: BLOCKS.PARAGRAPH,
        style: paragraph.style,
        paragraphKey: paragraph.key,
      });
    }

    // Add configured headings
    for (const heading of typography.headings) {
      const blockType = `heading-${heading.level.replace('h', '')}` as BLOCKS;
      opts.push({
        key: heading.level,
        label: heading.name,
        type: 'heading',
        blockType,
        style: heading.style,
      });
    }

    return opts;
  }, [typography]);

  // Filter options based on field permissions
  const enabledOptions = options.filter((option) =>
    isNodeTypeEnabled(sdk.field, option.blockType),
  );

  // Detect current style
  React.useEffect(() => {
    if (!editor?.selection) return;

    const elements = getElementFromCurrentSelection(editor);

    for (const element of elements) {
      if (typeof element === "object" && "type" in element) {
        const el = element as Element;
        
        // Check for paragraph with style
        if (el.type === BLOCKS.PARAGRAPH) {
          if (el.data?.['paragraphStyle']) {
            const paragraphKey = el.data['paragraphStyle'] as string;
            setSelected(`paragraph-${paragraphKey}`);
            return;
          } else {
            setSelected("paragraph-normal");
            return;
          }
        }
        
        // Check for headings
        if (el.type.startsWith('heading-')) {
          setSelected(el.type.replace('heading-', 'h'));
          return;
        }
      }
    }

    setSelected("paragraph-normal");
  }, [editor?.operations, editor?.selection]);

  const handleStyleSelect = React.useCallback(
    (option: HeadingParagraphOption) => {
      if (!editor?.selection) return;

      setSelected(option.key);
      setOpen(false);

      if (option.type === 'paragraph') {
        // Handle paragraph styles
        const elements = getElementFromCurrentSelection(editor);
        for (const element of elements) {
          if (typeof element === "object" && "type" in element) {
            const el = element as Element;
            
            if (option.paragraphKey) {
              // Set paragraph with style
              setNodes(
                editor,
                { 
                  type: BLOCKS.PARAGRAPH,
                  data: { ...el.data, ['paragraphStyle']: option.paragraphKey }
                },
                { at: editor.selection },
              );
            } else {
              // Set normal paragraph (remove style)
              const newData = { ...el.data };
              delete newData['paragraphStyle'];
              setNodes(
                editor,
                { 
                  type: BLOCKS.PARAGRAPH,
                  data: newData
                },
                { at: editor.selection },
              );
            }
            break;
          }
        }
      } else {
        // Handle headings
        toggleElement(editor, {
          activeType: option.blockType,
          inactiveType: option.blockType,
        });
      }

      focus(editor);
    },
    [editor],
  );

  if (!editor || enabledOptions.length === 0) return null;

  const selectedOption = enabledOptions.find((opt) => opt.key === selected);
  const selectedLabel = selectedOption?.label || "Normal text";

  return (
    <Menu isOpen={isOpen} onClose={() => setOpen(false)}>
      <Menu.Trigger>
        <button
          type="button"
          title="Text Style"
          data-test-id="toolbar-heading-paragraph-dropdown"
          onClick={() => setOpen(!isOpen)}
          disabled={!!isDisabled}
          className={css({
            display: "flex",
            alignItems: "center",
            padding: `${tokens.spacingXs} ${tokens.spacingS}`,
            border: `1px solid ${tokens.gray300}`,
            borderRadius: tokens.borderRadiusSmall,
            backgroundColor: tokens.colorWhite,
            color: tokens.gray700,
            cursor: isDisabled ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: tokens.fontWeightMedium,
            lineHeight: "1.2",
            minWidth: "130px",
            justifyContent: "space-between",
            boxShadow: `0 1px 2px ${tokens.gray200}`,
            "&:hover:not(:disabled)": {
              backgroundColor: tokens.gray100,
              borderColor: tokens.gray400,
            },
            "&:focus:not(:disabled)": {
              borderColor: tokens.blue400,
              boxShadow: `0 0 0 2px ${tokens.blue100}`,
              outline: "none",
            },
            "&:disabled": {
              opacity: 0.5,
              cursor: "not-allowed",
            },
          })}
        >
          <span>{selectedLabel}</span>
          <ChevronDownIcon style={{ marginLeft: "4px", fontSize: "10px" }} />
        </button>
      </Menu.Trigger>
      <Menu.List 
        testId="dropdown-heading-paragraph-list"
        className={css({
          minWidth: "200px",
          maxHeight: "300px",
          overflowY: "auto",
          padding: `${tokens.spacing2Xs} 0`,
          borderRadius: tokens.borderRadiusMedium,
          boxShadow: `0 4px 12px ${tokens.gray200}`,
          border: `1px solid ${tokens.gray300}`,
        })}
      >
        {enabledOptions.map((option, index) => {
          const isFirstHeading = option.type === 'heading' && 
            index > 0 && 
            enabledOptions[index - 1].type === 'paragraph';
          
          return (
            <React.Fragment key={option.key}>
              {isFirstHeading && (
                <div className={css({
                  borderTop: `1px solid ${tokens.gray300}`,
                  margin: `${tokens.spacingXs} ${tokens.spacingS}`,
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '-1px',
                    left: '0',
                    right: '0',
                    height: '1px',
                    background: `linear-gradient(90deg, ${tokens.gray300} 0%, transparent 100%)`,
                  },
                })} />
              )}
              <Menu.Item
                isInitiallyFocused={selected === option.key}
                onClick={() => handleStyleSelect(option)}
                testId={`dropdown-option-${option.key}`}
                disabled={isDisabled}
                className={css({
                  padding: `${tokens.spacingXs} ${tokens.spacingS}`,
                  '&:hover': {
                    backgroundColor: tokens.gray100,
                  },
                  '&[aria-selected="true"]': {
                    backgroundColor: tokens.blue100,
                    color: tokens.blue600,
                  },
                })}
              >
                <span
                  style={{
                    fontSize: option.style?.fontSize || (option.type === 'heading' ? '1.1em' : 'inherit'),
                    fontWeight: option.style?.fontWeight || (option.type === 'heading' ? 600 : 400),
                    lineHeight: option.style?.lineHeight || 'inherit',
                    display: 'block',
                    padding: `${tokens.spacing2Xs} 0`,
                  }}
                >
                  {option.label}
                </span>
              </Menu.Item>
            </React.Fragment>
          );
        })}
      </Menu.List>
    </Menu>
  );
};

interface ListDropdownProps {
  isDisabled?: boolean;
  sdk: FieldAppSDK;
}

const ListDropdown: React.FC<ListDropdownProps> = ({ isDisabled, sdk }) => {
  const editor = useContentfulEditor();
  const [isOpen, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string>("none");
  const configLists = useLists();
  
  // Generate list options from configuration
  const listOptions: ListOption[] = React.useMemo(() => {
    const options: ListOption[] = [
      {
        key: "none",
        label: "Remove List",
        icon: <MenuIcon />,
        blockType: "", // Special case for removing list
      },
    ];

    // Add configured list types
    for (const listConfig of configLists) {
      const blockType = listConfig.type === 'ol' ? BLOCKS.OL_LIST : BLOCKS.UL_LIST;
      
      // Choose appropriate icon based on list type
      let icon: React.ReactNode;
      if (listConfig.key === 'bullet' || listConfig.listStyle === 'bullets') {
        icon = <ListBulletedIcon />;
      } else if (listConfig.key === 'tick' || listConfig.listStyle === 'ticks') {
        icon = <DoneIcon />;
      } else if (listConfig.key === 'cross' || listConfig.listStyle === 'crosses') {
        icon = <CloseIcon />;
      } else if (listConfig.type === 'ol') {
        icon = <ListNumberedIcon />;
      } else {
        icon = <ListBulletedIcon />; // Default to bullet icon
      }

      const option: ListOption = {
        key: listConfig.key,
        label: listConfig.name,
        icon,
        blockType,
      };

      // Only add listType if it exists
      if (listConfig.listStyle) {
        option.listType = listConfig.listStyle;
      }

      options.push(option);
    }

    return options;
  }, [configLists]);

  // Filter options based on field permissions
  const enabledOptions = listOptions.filter(
    (option) =>
      option.key === "none" || isNodeTypeEnabled(sdk.field, option.blockType),
  );

  // Detect current list state
  React.useEffect(() => {
    if (!editor?.selection) {
      setSelected("none");
      return;
    }

    const isInUL = isListTypeActive(editor, BLOCKS.UL_LIST);
    const isInOL = isListTypeActive(editor, BLOCKS.OL_LIST);

    if (isInUL) {
      // Check for list type data attribute
      const listEntry = editor.above({
        // biome-ignore lint/suspicious/noExplicitAny: Slate node matching requires any for list detection
        match: (n: any) => n.type === BLOCKS.UL_LIST,
      });

      if (listEntry) {
        const [listElement] = listEntry;
        // biome-ignore lint/suspicious/noExplicitAny: List element needs any for data properties
        const listType = (listElement as any).data?.listType;

        if (listType === "ticks") {
          setSelected("tick-list");
        } else {
          setSelected("bullet-list");
        }
      } else {
        setSelected("bullet-list");
      }
    } else if (isInOL) {
      setSelected("numbered-list");
    } else {
      setSelected("none");
    }
  }, [editor?.operations, editor?.selection]);

  const handleListSelect = React.useCallback(
    (option: ListOption) => {
      if (!editor?.selection) return;

      setSelected(option.key);
      setOpen(false);

      // Handle "none" option - remove list formatting
      if (option.key === "none") {
        unwrapList(editor);
        focus(editor);
        return;
      }

      const isInUL = isListTypeActive(editor, BLOCKS.UL_LIST);

      // Check if we're switching between UL variants (bullets <-> ticks)
      if (isInUL && option.blockType === BLOCKS.UL_LIST) {
        // We're in a UL and switching to another UL variant
        // Just update the data attribute without toggling
        const listEntry = editor.above({
          // biome-ignore lint/suspicious/noExplicitAny: Slate node matching requires any for list detection
          match: (n: any) => n.type === BLOCKS.UL_LIST,
        });

        if (listEntry) {
          const [listElement, listPath] = listEntry;
          // biome-ignore lint/suspicious/noExplicitAny: List element needs any for data properties
          const existingData = (listElement as any).data || {};
          const updatedData = { ...existingData, listType: option.listType };

          // biome-ignore lint/suspicious/noExplicitAny: Slate editor types require any for generic node operations
          editor.setNodes({ data: updatedData } as any, {
            at: listPath,
          });
        }
      } else {
        // For all other cases (none to list, OL to UL, UL to OL), use toggleList
        toggleList(editor, { type: option.blockType });

        // If this is a UL with a custom list type, apply the data attribute after toggle
        if (option.blockType === BLOCKS.UL_LIST && option.listType) {
          // Find the list element after toggle
          const listEntry = editor.above({
            // biome-ignore lint/suspicious/noExplicitAny: Slate node matching requires any for list detection
            match: (n: any) => n.type === BLOCKS.UL_LIST,
          });

          if (listEntry) {
            const [listElement, listPath] = listEntry;
            // biome-ignore lint/suspicious/noExplicitAny: List element needs any for data properties
            const existingData = (listElement as any).data || {};
            const updatedData = { ...existingData, listType: option.listType };

            // biome-ignore lint/suspicious/noExplicitAny: Slate editor types require any for generic node operations
            editor.setNodes({ data: updatedData } as any, {
              at: listPath,
            });
          }
        }
      }

      focus(editor);
    },
    [editor],
  );

  if (!editor || enabledOptions.length === 0) return null;

  const selectedOption = enabledOptions.find((opt) => opt.key === selected);
  const buttonIcon = selectedOption ? (
    selectedOption.icon
  ) : (
    <ListBulletedIcon />
  );

  return (
    <Menu isOpen={isOpen} onClose={() => setOpen(false)}>
      <Menu.Trigger>
        <button
          type="button"
          title="List Type"
          data-test-id="toolbar-list-dropdown"
          onClick={() => setOpen(!isOpen)}
          disabled={!!isDisabled}
          className={css({
            display: "flex",
            alignItems: "center",
            padding: "4px 6px",
            border: "1px solid transparent",
            borderRadius: tokens.borderRadiusSmall,
            backgroundColor:
              selected !== "none" ? tokens.blue100 : "transparent",
            color: selected !== "none" ? tokens.blue600 : tokens.gray600,
            cursor: isDisabled ? "not-allowed" : "pointer",
            fontSize: "14px",
            lineHeight: "1",
            "&:hover:not(:disabled)": {
              backgroundColor:
                selected !== "none" ? tokens.blue200 : tokens.gray100,
            },
            "&:disabled": {
              opacity: 0.5,
            },
          })}
        >
          {buttonIcon}
          <ChevronDownIcon style={{ marginLeft: "2px", fontSize: "10px" }} />
        </button>
      </Menu.Trigger>
      <Menu.List testId="dropdown-list-options">
        {enabledOptions.map((option) => (
          <Menu.Item
            key={option.key}
            isInitiallyFocused={selected === option.key}
            onClick={() => handleListSelect(option)}
            testId={`dropdown-option-${option.key}`}
            disabled={isDisabled}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {option.icon}
              {option.label}
            </span>
          </Menu.Item>
        ))}
      </Menu.List>
    </Menu>
  );
};

interface CustomToolbarProps {
  isDisabled?: boolean;
  sdk: FieldAppSDK;
}

export const CustomToolbar: React.FC<CustomToolbarProps> = ({
  isDisabled = false,
  sdk,
}) => {
  const editor = useContentfulEditor();

  if (!editor) {
    return null;
  }

  // Helper functions for checking permissions
  const isAnyMarkEnabled = [MARKS.BOLD, MARKS.ITALIC, MARKS.UNDERLINE].some(
    (mark) => isMarkEnabled(sdk.field, mark),
  );

  const isAnyHyperlinkEnabled = [
    INLINES.HYPERLINK,
    INLINES.ASSET_HYPERLINK,
    INLINES.ENTRY_HYPERLINK,
    INLINES.RESOURCE_HYPERLINK,
  ].some((link) => isNodeTypeEnabled(sdk.field, link));

  const isAnyBlockFormattingEnabled = [
    BLOCKS.UL_LIST,
    BLOCKS.OL_LIST,
    BLOCKS.QUOTE,
    BLOCKS.HR,
  ].some((block) => isNodeTypeEnabled(sdk.field, block));

  const canInsertBlocks = !isDisabled;

  return (
    <Flex
      className={styles.toolbar}
      alignItems="center"
      justifyContent="space-between"
    >
      <div className={styles.formattingOptionsWrapper}>
        {/* Undo/Redo */}
        <ButtonUndo />
        <ButtonRedo />

        {/* Heading/Paragraph dropdown */}
        <span className={styles.divider} />
        <HeadingParagraphDropdown isDisabled={isDisabled} sdk={sdk} />

        {/* Text formatting */}
        {isAnyMarkEnabled && <span className={styles.divider} />}
        {isMarkEnabled(sdk.field, MARKS.BOLD) && (
          <ToolbarBoldButton isDisabled={isDisabled} />
        )}
        {isMarkEnabled(sdk.field, MARKS.ITALIC) && (
          <ToolbarItalicButton isDisabled={isDisabled} />
        )}
        {isMarkEnabled(sdk.field, MARKS.UNDERLINE) && (
          <ToolbarUnderlineButton isDisabled={isDisabled} />
        )}

        {/* Custom colors */}
        <span className={styles.divider} />
        <ToolbarColorButton isDisabled={isDisabled} />
        <ToolbarBackgroundColorButton isDisabled={isDisabled} />

        {/* Hyperlinks */}
        {isAnyHyperlinkEnabled && (
          <>
            <span className={styles.divider} />
            <ToolbarHyperlinkButton isDisabled={isDisabled} />
          </>
        )}

        {/* Block formatting */}
        {isAnyBlockFormattingEnabled && <span className={styles.divider} />}

        {/* List dropdown */}
        <ListDropdown isDisabled={isDisabled || !canInsertBlocks} sdk={sdk} />

        {/* Other block elements */}
        {isNodeTypeEnabled(sdk.field, BLOCKS.QUOTE) && (
          <ToolbarQuoteButton isDisabled={isDisabled || !canInsertBlocks} />
        )}
        {isNodeTypeEnabled(sdk.field, BLOCKS.HR) && (
          <ToolbarHrButton isDisabled={isDisabled || !canInsertBlocks} />
        )}
        {isNodeTypeEnabled(sdk.field, BLOCKS.TABLE) && (
          <ToolbarTableButton isDisabled={isDisabled || !canInsertBlocks} />
        )}
      </div>

      {/* Embed widget */}
      <div className={styles.embedActionsWrapper}>
        <EmbedEntityWidget
          isDisabled={isDisabled}
          canInsertBlocks={canInsertBlocks}
        />
      </div>
    </Flex>
  );
};

export default CustomToolbar;
