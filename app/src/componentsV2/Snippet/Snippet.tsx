import React from "react";
import "./snippet.scss";

interface Props {
  children: React.ReactNode;
  allowCopy?: boolean;
}

export const Snippet: React.FC<Props> = ({ children, allowCopy = true }) => {
  return (
    <div className="rq-snippet">
      <code>{children}</code>
    </div>
  );
};
