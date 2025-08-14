import { IoMdCode } from "@react-icons/all-files/io/IoMdCode";
import { RQButton } from "lib/design-system-v2/components";
import React, { useState } from "react";
import { ApiClientSnippetModal } from "../../../modals/ApiClientSnippetModal/ApiClientSnippetModal";
import { GraphQLRequestExecutor } from "features/apiClient/helpers/graphQLRequestExecutor/GraphQLRequestExecutor";
import { HttpRequestExecutor } from "features/apiClient/helpers/httpRequestExecutor/httpRequestExecutor";

interface Props {
  apiClientExecutor: GraphQLRequestExecutor | HttpRequestExecutor;
  handleOnClick?: () => void;
}

export const ClientCodeButton: React.FC<Props> = ({ apiClientExecutor, handleOnClick }) => {
  const [isSnippetModalVisible, setIsSnippetModalVisible] = useState(false);
  return (
    <>
      <RQButton
        type="transparent"
        icon={<IoMdCode />}
        size="small"
        className="api-client-view_get-code-btn"
        onClick={() => {
          handleOnClick?.();
          setIsSnippetModalVisible(true);
        }}
      >
        Get client code
      </RQButton>
      {isSnippetModalVisible ? (
        <ApiClientSnippetModal
          apiRequest={apiClientExecutor?.prepareRequest()}
          open={isSnippetModalVisible}
          onClose={() => setIsSnippetModalVisible(false)}
        />
      ) : null}
    </>
  );
};
