import { IoMdCode } from "@react-icons/all-files/io/IoMdCode";
import { RQButton } from "lib/design-system-v2/components";
import React, { useState } from "react";
import { ApiClientSnippetModal } from "../../../modals/ApiClientSnippetModal/ApiClientSnippetModal";
import { GraphQLRequestExecutor } from "features/apiClient/helpers/graphQLRequestExecutor/GraphQLRequestExecutor";
import { RQAPI } from "features/apiClient/types";
import { RequestExecutorService } from "features/apiClient/helpers/requestExecutorService";

interface Props {
  entry: RQAPI.HttpApiEntry;
  recordId: string;
  apiClientExecutor: RequestExecutorService | GraphQLRequestExecutor;
}

export const ClientCodeButton: React.FC<Props> = ({ entry, recordId, apiClientExecutor }) => {
  const [isSnippetModalVisible, setIsSnippetModalVisible] = useState(false);
  return (
    <>
      <RQButton
        type="transparent"
        icon={<IoMdCode />}
        size="small"
        className="api-client-view_get-code-btn"
        onClick={() => {
          setIsSnippetModalVisible(true);
        }}
      >
        Get client code
      </RQButton>
      {isSnippetModalVisible ? (
        <ApiClientSnippetModal
          apiRequest={apiClientExecutor.prepareRequest(recordId, entry).preparedEntry}
          open={isSnippetModalVisible}
          onClose={() => setIsSnippetModalVisible(false)}
        />
      ) : null}
    </>
  );
};
