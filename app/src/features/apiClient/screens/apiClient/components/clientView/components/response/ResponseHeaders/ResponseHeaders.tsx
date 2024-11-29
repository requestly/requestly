import React, { useMemo } from "react";
import { KeyValuePair } from "../../../../../../../types";
import { PropertiesGrid } from "componentsV2/PropertiesGrid/PropertiesGrid";
import { EmptyResponsePlaceholder } from "../EmptyResponsePlaceholder/EmptyResponsePlaceholder";
import "./responseHeaders.scss";

interface Props {
  headers: KeyValuePair[];
  isLoading: boolean;
  isFailed: boolean;
  onCancelRequest: () => void;
}

const ResponseHeaders: React.FC<Props> = ({ headers, isLoading, isFailed, onCancelRequest }) => {
  const transformedHeaders = useMemo(() => {
    return headers?.map((header) => ({
      key: header.key,
      value: header.value,
    }));
  }, [headers]);

  return (
    <>
      {headers?.length ? (
        <div className="api-client-response-headers">
          <PropertiesGrid data={transformedHeaders} />
        </div>
      ) : (
        <EmptyResponsePlaceholder
          isLoading={isLoading}
          isFailed={isFailed}
          onCancelRequest={onCancelRequest}
          emptyDescription="Please run a request to see the response headers"
        />
      )}
    </>
  );
};

export default ResponseHeaders;
