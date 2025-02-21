import { RequestContentType, RQAPI } from "features/apiClient/types";
import { Request as HarRequest } from "har-format";
import { HTTPSnippet, availableTargets } from "@readme/httpsnippet";
import { RQModal } from "lib/design-system/components";
import { useCallback, useEffect, useState } from "react";
import { apiRequestToHarRequestAdapter } from "../../../utils";
import { Select } from "antd";
import "./copyAsModal.scss";
import CopyButton from "components/misc/CopyButton";
import { trackRequestCurlCopied } from "modules/analytics/events/features/apiClient";

interface CopyAsModalProps {
  open: boolean;
  onClose: () => void;
  apiRequest: RQAPI.Request;
}

type TargetId = ReturnType<typeof availableTargets>[number]["key"];
type ClientId = ReturnType<typeof availableTargets>[number]["clients"][number]["key"];

const CopyAsModal = ({ apiRequest, onClose, open }: CopyAsModalProps) => {
  const [harRequest, setHarRequest] = useState<HarRequest>();
  const [snippetTypeId, setSnippetTypeId] = useState<string>("shell-curl");
  useEffect(() => {
    if (!apiRequest) {
      return;
    }

    const harRequest = apiRequestToHarRequestAdapter(apiRequest);
    setHarRequest(harRequest);
  }, [apiRequest]);

  const getSnippet = useCallback(() => {
    if (!harRequest) {
      return "Some error occured while generating snippet.";
    }

    let snippet: any = "";
    try {
      const httpsnippet = new HTTPSnippet({ postData: { mimeType: RequestContentType.RAW }, ...harRequest });
      snippet = httpsnippet.convert(
        snippetTypeId.split("-")[0] as TargetId,
        snippetTypeId.split("-")[1] as ClientId,
        {}
      );
    } catch (err) {
      snippet = "Some error occured while generating snippet.";
    }

    return snippet;
  }, [snippetTypeId, harRequest]);

  return (
    <RQModal
      width={500}
      open={open}
      maskClosable={false}
      destroyOnClose={true}
      className="copy-as-modal"
      onCancel={onClose}
    >
      <div className="snippet-container">
        <div className="snippet-actions">
          <Select showSearch onChange={(value) => setSnippetTypeId(value)} value={snippetTypeId}>
            {availableTargets().map((target) => {
              return target.clients.map((client) => {
                return (
                  <Select.Option
                    value={`${target.key}-${client.key}`}
                  >{`${target.title} - ${client.title}`}</Select.Option>
                );
              });
            })}
          </Select>
          <CopyButton copyText={getSnippet()} trackCopiedEvent={() => trackRequestCurlCopied(snippetTypeId)} />
        </div>
        <div className="snippet-content">{getSnippet()}</div>
      </div>
    </RQModal>
  );
};

export default CopyAsModal;
