import React, { useState } from "react";
import { AutoComplete, Col } from "antd";
import "./index.scss";

interface Props {
  value: string;
  onValueChange: (data: string) => void;
}

const industryOptions = [
  { value: "SaaS" },
  { value: "E-commerce" },
  { value: "Financial Services" },
  { value: "Education" },
  { value: "Travel" },
  { value: "Advertising Tech" },
  { value: "Marketing Tech" },
  { value: "Gaming" },
  { value: "Media & Entertainment" },
  { value: "Publishing" },
  { value: "Healthcare" },
  { value: "IT Services" },
];

// TODO: Refactor it into a reusable component
export const IndustryInput: React.FC<Props> = ({ onValueChange, value }) => {
  const [industries, setIndustries] = useState([...industryOptions]);
  return (
    <Col>
      <label htmlFor="industry-input" className="industry-input-label">
        Which industry do you work in?
      </label>
      <AutoComplete
        id="industry-input"
        className="industry-input"
        popupClassName="industry-input-menu"
        options={industries}
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
            const filtered = industries.filter((option) =>
              option.value.toLocaleLowerCase().startsWith(data.toLocaleLowerCase())
            );
            setIndustries(filtered);
          } else {
            setIndustries(industryOptions);
          }
        }}
        placeholder="Start typing or select from the list"
      />
    </Col>
  );
};
