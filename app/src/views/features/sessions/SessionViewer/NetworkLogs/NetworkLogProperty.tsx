import { ReactNode } from "react";

interface Props {
  label: string;
  children: ReactNode;
  isCodeBlock?: boolean;
}

const NetworkLogProperty: React.FC<Props> = ({
  label,
  children,
  isCodeBlock,
}) => {
  return children ? (
    <div
      style={{
        marginBottom: 4,
        fontSize: 13,
        wordBreak: "break-all",
      }}
    >
      <span style={{ fontWeight: "bold", marginRight: 8 }}>{label}:</span>
      {isCodeBlock ? <pre style={{ fontSize: 11 }}>{children}</pre> : children}
    </div>
  ) : null;
};

export default NetworkLogProperty;
