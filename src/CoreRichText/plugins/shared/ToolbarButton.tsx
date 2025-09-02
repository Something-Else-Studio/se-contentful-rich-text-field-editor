import * as React from "react";
import { Button, Tooltip } from "@contentful/f36-components";
import tokens from "@contentful/f36-tokens";
import { css, cx } from "emotion";

const styles = {
  button: css({
    height: "30px",
    width: "30px",
    marginLeft: tokens.spacing2Xs,
    marginRight: tokens.spacing2Xs,
  }),

  tooltip: css({
    zIndex: Number(tokens.zIndexTooltip),
  }),
};

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  isDisabled?: boolean;
  children: React.ReactNode;
  title: string;
  className?: string;
  testId?: string;
}

export const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>((props, ref) => {
  const {
    title,
    testId,
    isActive,
    children,
    className,
    isDisabled = false,
  } = props;
  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    props.onClick();
  };

  const button = (
    <Button
      ref={ref}
      className={cx(styles.button, className)}
      isDisabled={isDisabled}
      startIcon={children}
      onClick={handleClick}
      testId={testId}
      variant={isActive ? "secondary" : "transparent"}
      size="small"
    />
  );

  if (title) {
    return (
      <Tooltip className={styles.tooltip} placement="bottom" content={title}>
        {button}
      </Tooltip>
    );
  }

  return button;
});

ToolbarButton.displayName = "ToolbarButton";
