import React from "react";
import { RQAPI } from "../../types";
import PropertyRow from "./PropertyRow/PropertyRow";

interface Props {
  headers: RQAPI.Header[];
}

const ResponseHeaders: React.FC<Props> = ({ headers }) => {
  return (
    <>
      {headers.map((header, index) => (
        <PropertyRow key={index} name={header.name} value={header.value} />
      ))}
    </>
  );
};

export default ResponseHeaders;
