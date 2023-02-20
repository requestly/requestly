import React, { ReactElement, useCallback, useEffect } from "react";
import Split from "react-split";
import "./splitPane.scss";

interface Props {
  children: ReactElement[];
  className?: string;
  leftPaneSize?: number; // percentage
  sizes?: [number, number];
}
const SplitPane: React.FC<Props> = ({
  children = [],
  className = "",
  leftPaneSize = 50,
  ...props
}) => {
  const left = children[0];
  const right = children[1];

  if (left && !right) {
    return <div className={className}>{left}</div>;
  }

  const positionDragger = useCallback(([leftSize]: [number]) => {
    const dragger = document.querySelector(
      ".split-pane .gutter"
    ) as HTMLDivElement;
    if (dragger) {
      dragger.style.position = "absolute";
      dragger.style.left = `${leftSize}%`;
    }
  }, []);

  useEffect(() => {
    positionDragger([leftPaneSize]);
  }, [positionDragger, leftPaneSize]);

  return (
    <Split
      direction="horizontal"
      cursor="ew-resize"
      sizes={[leftPaneSize, 100 - leftPaneSize]}
      minSize={[200, 200]}
      gutterSize={6}
      gutterAlign="center"
      className={`split-pane ${className}`}
      snapOffset={30}
      onDragEnd={positionDragger}
      {...props}
    >
      {left}
      {right}
    </Split>
  );
};

export default SplitPane;
