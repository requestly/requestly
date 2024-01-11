import React, { ReactNode } from "react";

interface Props {
  label?: string;
  children: ReactNode;
  isCodeBlock?: boolean;
}

export const NetworkLogProperty: React.FC<Props> = ({ label, children, isCodeBlock }) => {
  const updatedChildren = children === "" ? <span>&Prime;&Prime;</span> : children;

  return updatedChildren ? (
    <div
      style={{
        marginBottom: 4,
        fontSize: 13,
        wordBreak: "break-all",
      }}
    >
      {label ? <span style={{ fontWeight: "bold", marginRight: 8 }}>{label}:</span> : null}
      {isCodeBlock ? <pre style={{ fontSize: 11 }}>{updatedChildren}</pre> : updatedChildren}
    </div>
  ) : null;
};
