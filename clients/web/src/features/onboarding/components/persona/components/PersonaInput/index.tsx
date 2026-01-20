import React, { useState } from "react";
import { AutoComplete, Col } from "antd";
import "./index.scss";

interface Props {
  value: string;
  onValueChange: (data: string) => void;
}

const personaOptions = [
  { value: "Front-End Developer" },
  { value: "Back-End Developer" },
  { value: "QA Engineer" },
  { value: "Product Manager" },
  { value: "Engineering Lead/Manager" },
  { value: "Solutions Engineer" },
  { value: "Founder/CEO" },
  { value: "Sales" },
  { value: "IT Procurement/Administrator" },
];

export const PersonaInput: React.FC<Props> = ({ onValueChange, value }) => {
  const [personas, setPersonas] = useState(personaOptions);
  return (
    <Col>
      <label htmlFor="persona-input" className="persona-input-label">
        What is your current role?
      </label>
      <AutoComplete
        id="persona-input"
        className="persona-input"
        popupClassName="persona-input-menu"
        options={personas}
        value={value}
        style={{ width: 200 }}
        onSelect={(data: string) => {
          onValueChange(data);
        }}
        onChange={(data: string) => {
          onValueChange(data);
        }}
        onSearch={(data: string) => {
          if (data) {
            const filtered = personaOptions.filter((option) =>
              option.value.toLocaleLowerCase().startsWith(data.toLocaleLowerCase())
            );
            setPersonas(filtered);
          } else {
            setPersonas(personaOptions);
          }
        }}
        placeholder="Start typing or select from the list"
      />
    </Col>
  );
};
