import React from "react";
import { KeyValuePair } from "../../types";
import PropertyRow from "./PropertyRow/PropertyRow";

interface Props {
  headers: KeyValuePair[];
}

const ResponseHeaders: React.FC<Props> = ({ headers }) => {
  return (
    <>
      {headers.map((header, index) => (
        <PropertyRow key={index} name={header.key} value={header.value} />
      ))}
    </>
  );
};

export default ResponseHeaders;
