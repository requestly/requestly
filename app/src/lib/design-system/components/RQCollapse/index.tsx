import { Collapse, CollapseProps } from "antd";
import { ReactComponent as DownArrow } from "assets/icons/down-arrow.svg";
import "./RQCollapse.css";

export const RQCollapse = (props: CollapseProps) => {
  return (
    <Collapse
      bordered={false}
      expandIconPosition="end"
      expandIcon={({ isActive }) => (
        <DownArrow
          style={{
            top: "58%",
            transition: "transform 0.3s",
            transform: isActive ? "rotate(-180deg)" : "rotate(0deg)",
          }}
        />
      )}
      {...props}
      className={`custom-collapse ${props?.className ?? ""}`}
    />
  );
};
