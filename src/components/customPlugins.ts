import { FieldAppSDK } from "@contentful/app-sdk";
import { type PlatePlugin } from "@udecode/plate-common";
import {
  createSoftBreakPlugin,
  createExitBreakPlugin,
  createResetNodePlugin,
} from "../CoreRichText/plugins/Break";
import { createCommandPalettePlugin } from "../CoreRichText/plugins/CommandPalette";
import { isCommandPromptPluginEnabled } from "../CoreRichText/plugins/CommandPalette/useCommands";
import { createDeserializeDocxPlugin } from "../CoreRichText/plugins/DeserializeDocx";
import { createDragAndDropPlugin } from "../CoreRichText/plugins/DragAndDrop";
import {
  createEmbeddedAssetBlockPlugin,
  createEmbeddedEntryBlockPlugin,
} from "../CoreRichText/plugins/EmbeddedEntityBlock";
import { createEmbeddedEntityInlinePlugin } from "../CoreRichText/plugins/EmbeddedEntityInline";
import { createEmbeddedResourceBlockPlugin } from "../CoreRichText/plugins/EmbeddedResourceBlock";
import { createEmbeddedResourceInlinePlugin } from "../CoreRichText/plugins/EmbeddedResourceInline";
import { createHeadingPlugin } from "../CoreRichText/plugins/Heading";
import { createHrPlugin } from "../CoreRichText/plugins/Hr";
import { createHyperlinkPlugin } from "../CoreRichText/plugins/Hyperlink";
import { createListPlugin } from "../CoreRichText/plugins/List";
import { createMarksPlugin } from "../CoreRichText/plugins/Marks";
import { createNormalizerPlugin } from "../CoreRichText/plugins/Normalizer";
import { createParagraphPlugin } from "../CoreRichText/plugins/Paragraph";
import { createPasteHTMLPlugin } from "../CoreRichText/plugins/PasteHTML";
import { createQuotePlugin } from "../CoreRichText/plugins/Quote";
import { createSelectOnBackspacePlugin } from "../CoreRichText/plugins/SelectOnBackspace";
import { createTablePlugin } from "../CoreRichText/plugins/Table";
import { createTextPlugin } from "../CoreRichText/plugins/Text";
import {
  createTrackingPlugin,
  RichTextTrackingActionHandler,
} from "../CoreRichText/plugins/Tracking";
import { createTrailingParagraphPlugin } from "../CoreRichText/plugins/TrailingParagraph";
import { createVoidsPlugin } from "../CoreRichText/plugins/Voids";

// Import our color plugin and styled paragraph
import { ColorPlugin, StyledParagraph } from "./plugins";

export const getCustomPlugins = (
  sdk: FieldAppSDK,
  onAction: RichTextTrackingActionHandler,
  restrictedMarks?: string[],
): PlatePlugin[] =>
  [
    createDeserializeDocxPlugin(),

    // Tracking - This should come first so all plugins below will have access to `editor.tracking`
    createTrackingPlugin(onAction),

    // Global / Global shortcuts
    createDragAndDropPlugin(),
    // Enable command palette plugin only, if at least action type is allowed
    ...(Object.values(isCommandPromptPluginEnabled(sdk)).some(Boolean)
      ? [createCommandPalettePlugin()]
      : []),

    // Block Elements
    {
      ...createParagraphPlugin(),
      component: StyledParagraph, // Use our custom styled paragraph
    },
    createListPlugin(),
    createHrPlugin(),
    createHeadingPlugin(),
    createQuotePlugin(),
    createTablePlugin(),
    createEmbeddedEntryBlockPlugin(sdk),
    createEmbeddedAssetBlockPlugin(sdk),
    createEmbeddedResourceBlockPlugin(sdk),

    // Inline elements
    createHyperlinkPlugin(sdk),
    createEmbeddedEntityInlinePlugin(sdk),
    createEmbeddedResourceInlinePlugin(sdk),

    // Marks
    createMarksPlugin(),

    // Custom plugins - add any custom plugins here
    ColorPlugin() as PlatePlugin,

    // Other
    createTrailingParagraphPlugin(),
    createTextPlugin(restrictedMarks),
    createVoidsPlugin(),
    createSelectOnBackspacePlugin(),

    // Pasting content from other sources
    createPasteHTMLPlugin(),

    // These plugins drive their configurations from the list of plugins
    // above. They MUST come last.
    createSoftBreakPlugin(),
    createExitBreakPlugin(),
    createResetNodePlugin(),
    createNormalizerPlugin(),
  ] as PlatePlugin[];
