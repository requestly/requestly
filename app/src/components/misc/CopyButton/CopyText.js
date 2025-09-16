import { Button } from "antd";
import { copyToClipBoard } from "utils/Misc";

const CopyText = ({ text, size }) => {
  return (
    <Button
      type="text"
      size={size}
      onClick={() => {
        copyToClipBoard(text, "Copied to clipboard");
      }}
    >
      {text ? text : ""}
    </Button>
  );
};

export default CopyText;
