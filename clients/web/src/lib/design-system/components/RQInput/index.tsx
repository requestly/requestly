import { Input, InputProps } from "antd";
import "./RQInput.css";

export const RQInput = (props: InputProps) => {
  return <Input {...props} type={props.type ? props.type : "large"} className={`rq-input ${props?.className ?? ""}`} />;
};
