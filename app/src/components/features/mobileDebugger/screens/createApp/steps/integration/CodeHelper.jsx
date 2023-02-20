import { Typography } from "antd";
import CopyButton from "components/misc/CopyButton";

const { Paragraph } = Typography;

const CodeHelper = ({ code }) => {
  return (
    <Paragraph>
      <pre style={{ position: "relative" }}>
        {code}
        <div style={{ position: "absolute", right: 0, top: 0 }}>
          <CopyButton title="Copy" copyText={code}></CopyButton>
        </div>
      </pre>
    </Paragraph>
  );
};

export default CodeHelper;
