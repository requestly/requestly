import { useState } from "react";
import { AutoComplete, Col } from "antd";
import "./index.scss";

const options = [
  { value: "Front-End Developer" },
  { value: "Back-End Developer" },
  { value: "QA Engineer" },
  { value: "Product Manager" },
  { value: "Engineering Lead/Manager" },
  { value: "Fouder/CEO" },
  { value: "Sales" },
  { value: "IT Procurement/Administrator" },
];

export const PersonaInput = () => {
  const [value, setValue] = useState("");

  const onSelect = (data: string) => {
    setValue(data);
  };

  const onChange = (data: string) => {
    setValue(data);
  };

  console.log({ value });

  return (
    <Col>
      <label htmlFor="persona-input" className="persona-input-label">
        What is your current role?
      </label>
      <AutoComplete
        id="persona-input"
        className="persona-input"
        popupClassName="persona-input-menu"
        options={options}
        style={{ width: 200 }}
        onSelect={onSelect}
        onChange={onChange}
        placeholder="Start typing or select from the list"
      />
    </Col>
  );
};
