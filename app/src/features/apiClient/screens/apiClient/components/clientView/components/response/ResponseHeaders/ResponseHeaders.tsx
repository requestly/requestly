import React from "react";
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
  return (
    <>
      {headers?.length ? (
        <div className="api-client-response-headers">
          <PropertiesGrid data={headers as { key: string; value: string }[]} />
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
