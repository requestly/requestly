import { IoMdCode } from "@react-icons/all-files/io/IoMdCode";
import { RQButton } from "lib/design-system-v2/components";
import React, { useState } from "react";
import { ApiClientSnippetModal } from "../../../modals/ApiClientSnippetModal/ApiClientSnippetModal";
import { RQAPI } from "features/apiClient/types";
import { toast } from "utils/Toast";

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
          try {
            const request = requestPreparer();
            if (request) {
              setPreparedRequest(request);
              setIsSnippetModalVisible(true);
            }
          } catch (error) {
            toast.error("Error preparing code snippet");
          }
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
