import { Collapse, CollapseProps } from "antd";
import { UpOutlined } from "@ant-design/icons";
import "./RQCollapse.css";

export const RQCollapse = (props: CollapseProps) => {
  return (
    <Collapse
      bordered={false}
      expandIconPosition="right"
      expandIcon={({ isActive }) => <UpOutlined rotate={isActive ? 180 : 0} />}
      {...props}
      className={`custom-collapse ${props?.className ?? ""}`}
    />
  );
};
