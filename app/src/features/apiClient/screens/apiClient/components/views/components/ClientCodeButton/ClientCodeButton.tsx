import { IoMdCode } from "@react-icons/all-files/io/IoMdCode";
import { RQButton } from "lib/design-system-v2/components";
import React, { useState } from "react";
import { ApiClientSnippetModal } from "../../../modals/ApiClientSnippetModal/ApiClientSnippetModal";
import { RQAPI } from "features/apiClient/types";

interface Props {
  requestPreparer: () => RQAPI.HttpRequest;
}

export const ClientCodeButton: React.FC<Props> = ({ requestPreparer }) => {
  const [isSnippetModalVisible, setIsSnippetModalVisible] = useState(false);
  const [preparedRequest, setPreparedRequest] = useState<RQAPI.HttpRequest | null>(null);

  return (
    <>
      <RQButton
        type="transparent"
        icon={<IoMdCode />}
        size="small"
        className="api-client-view_get-code-btn"
        onClick={() => {
          const request = requestPreparer();
          setPreparedRequest(request);
          setIsSnippetModalVisible(true);
        }}
      >
        Get client code
      </RQButton>
      {isSnippetModalVisible && preparedRequest ? (
        <ApiClientSnippetModal
          apiRequest={preparedRequest}
          open={isSnippetModalVisible}
          onClose={() => setIsSnippetModalVisible(false)}
        />
      ) : null}
    </>
  );
};
