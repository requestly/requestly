import React from "react";
import "./snippet.scss";
import CopyButton from "components/misc/CopyButton";

interface Props {
  code: string;
  allowCopy?: boolean;
}

export const Snippet: React.FC<Props> = ({ code, allowCopy = false }) => {
  return (
    <div className="rq-snippet">
      <code>{code}</code>
      <div className="rq-snippet__copy-button">{allowCopy && <CopyButton copyText={code} />}</div>
    </div>
  );
};
