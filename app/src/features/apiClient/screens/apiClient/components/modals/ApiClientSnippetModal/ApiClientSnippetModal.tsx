import { RequestContentType, RQAPI } from "features/apiClient/types";
import { Modal, Select } from "antd";
import { Request as HarRequest } from "har-format";
import { HTTPSnippet, availableTargets } from "@readme/httpsnippet";
import { useEffect, useMemo, useState } from "react";
import { apiRequestToHarRequestAdapter } from "../../../utils";
import CopyButton from "components/misc/CopyButton";
import { trackRequestCurlCopied } from "modules/analytics/events/features/apiClient";
import Editor from "componentsV2/CodeEditor";
import "./apiClientSnippetModal.scss";

interface ApiClientSnippetModalProps {
  open: boolean;
  onClose: () => void;
  apiRequest: RQAPI.HttpRequest;
}

type TargetId = ReturnType<typeof availableTargets>[number]["key"];
type ClientId = ReturnType<typeof availableTargets>[number]["clients"][number]["key"];

export const ApiClientSnippetModal = ({ apiRequest, onClose, open }: ApiClientSnippetModalProps) => {
  const [harRequest, setHarRequest] = useState<HarRequest>();
  const [snippetTypeId, setSnippetTypeId] = useState<string>("shell-curl");

  useEffect(() => {
    if (!apiRequest) {
      return;
    }

    const harRequest = apiRequestToHarRequestAdapter(apiRequest);
    setHarRequest(harRequest);
  }, [apiRequest]);

  const snippet = useMemo(() => {
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
      snippet = ["Some error occured while generating snippet."];
    }

    return snippet[0];
  }, [snippetTypeId, harRequest]);

  return (
    <Modal
      title="Get client code snippet"
      width={520}
      open={open}
      maskClosable={false}
      destroyOnClose={true}
      className="api-client-snippet-modal"
      onCancel={onClose}
      footer={null}
    >
      <div className="api-client-snippet-container">
        <div className="api-client-snippet-actions">
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
          <CopyButton
            type="secondary"
            title="Copy"
            copyText={snippet}
            trackCopiedEvent={() => trackRequestCurlCopied(snippetTypeId)}
          />
        </div>
        <div className="api-client-snippet-content">
          <Editor hideCharacterCount isResizable config={{ hideToolbar: true }} value={snippet ?? ""} language={null} />
        </div>
      </div>
    </Modal>
  );
};
