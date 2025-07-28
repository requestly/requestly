import { IoMdCode } from "@react-icons/all-files/io/IoMdCode";
import { RQButton } from "lib/design-system-v2/components";
import React, { useState } from "react";
import { ApiClientSnippetModal } from "../../../modals/ApiClientSnippetModal/ApiClientSnippetModal";
import { ApiClientExecutor } from "features/apiClient/helpers/apiClientExecutor/apiClientExecutor";

interface Props {
  apiClientExecutor: ApiClientExecutor;
}

export const ClientCodeButton: React.FC<Props> = ({ apiClientExecutor }) => {
  const [isSnippetModalVisible, setIsSnippetModalVisible] = useState(false);
  return (
    <>
      <RQButton
        type="transparent"
        icon={<IoMdCode />}
        size="small"
        className="api-client-view_get-code-btn"
        onClick={() => {
          // TODO: handle sanitization after implementation of adapter
          //   apiClientExecutor.updateEntryDetails({
          //     entry: sanitizeEntry(entry),
          //     recordId: apiEntryDetails?.id,
          //     collectionId: apiEntryDetails?.collectionId,
          //   });
          setIsSnippetModalVisible(true);
        }}
      >
        Get client code
      </RQButton>
      {isSnippetModalVisible ? (
        <ApiClientSnippetModal
          apiRequest={apiClientExecutor.prepareRequest()}
          open={isSnippetModalVisible}
          onClose={() => setIsSnippetModalVisible(false)}
        />
      ) : null}
    </>
  );
};
