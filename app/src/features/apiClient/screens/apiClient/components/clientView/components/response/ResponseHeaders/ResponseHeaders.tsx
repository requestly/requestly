import React, { useMemo } from "react";
import { KeyValuePair } from "../../../../../../../types";
import { PropertiesGrid } from "componentsV2/PropertiesGrid/PropertiesGrid";
import "./responseHeaders.scss";

interface Props {
  headers: KeyValuePair[];
}

const ResponseHeaders: React.FC<Props> = ({ headers }) => {
  const transformedHeaders = useMemo(() => {
    return headers?.map((header) => ({
      key: header.key,
      value: header.value,
    }));
  }, [headers]);

  return (
    <div className="api-client-response-headers">
      <PropertiesGrid data={transformedHeaders} />
    </div>
  );
};

export default ResponseHeaders;
