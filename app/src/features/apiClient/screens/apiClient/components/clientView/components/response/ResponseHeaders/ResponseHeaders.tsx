import React, { useMemo } from "react";
import { KeyValuePair } from "../../../../../../../types";
import { PropertiesGrid } from "componentsV2/PropertiesGrid/PropertiesGrid";
import { EmptyResponsePlaceholder } from "../EmptyResponsePlaceholder/EmptyResponsePlaceholder";
import { Spin } from "antd";
import { RQButton } from "lib/design-system/components";
import "./responseHeaders.scss";

interface Props {
  headers: KeyValuePair[];
  isLoading: boolean;
  isFailed: boolean;
  onCancelRequest: () => void;
  errorMessage?: string;
}

const ResponseHeaders: React.FC<Props> = ({ headers, isLoading, isFailed, onCancelRequest, errorMessage }) => {
  const transformedHeaders = useMemo(() => {
    return headers?.map((header) => ({
      key: header.key,
      value: header.value,
    }));
  }, [headers]);

  return (
    <>
      {isLoading ? (
        <div className="api-client-response__loading-overlay">
          <Spin size="large" tip="Request in progress..." />
          <RQButton onClick={onCancelRequest} className="mt-16">
            Cancel request
          </RQButton>
        </div>
      ) : null}
      {headers?.length ? (
        <div className="api-client-response-headers">
          <PropertiesGrid data={transformedHeaders} />
        </div>
      ) : (
        <EmptyResponsePlaceholder
          isFailed={isFailed}
          errorMessage={errorMessage}
          emptyDescription="Please run a request to see the response headers"
        />
      )}
    </>
  );
};

export default ResponseHeaders;
