import { Button } from "antd";
import { toast } from "utils/Toast";

const CopyText = ({ text, size }) => {
  return (
    <Button
      type="text"
      size={size}
      onClick={() => {
        navigator.clipboard.writeText(text);
        toast.info("Copied to clipboard");
      }}
    >
      {text ? text : ""}
    </Button>
  );
};

export default CopyText;
