import type { RichTextTrackingActionHandler } from "@CoreRichTextEditor/plugins/Tracking";
import type { FieldAppSDK } from "@contentful/app-sdk";
import type { Document } from "@contentful/rich-text-types";
import { RichTextEditor } from "../CoreRichText";

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
	return <RichTextEditor {...props} minHeight={400} />;
};

export default SERichTextEditor;
