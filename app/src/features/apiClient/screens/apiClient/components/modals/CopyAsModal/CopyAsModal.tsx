import { RequestContentType, RQAPI } from "features/apiClient/types";
import { Request as HarRequest } from "har-format";
import { HTTPSnippet, availableTargets } from "httpsnippet";
import { RQModal } from "lib/design-system/components";
import { useCallback, useEffect, useState } from "react";
import { apiRequestToHarRequestAdapter } from "../../../utils";
import { Select, Typography } from "antd";

interface CopyAsModalProps {
  open: boolean;
  onClose: () => void;
  apiRequest: RQAPI.Request;
}

type TargetId = ReturnType<typeof availableTargets>[number]["key"];
type ClientId = ReturnType<typeof availableTargets>[number]["clients"][number]["key"];

const { Paragraph } = Typography;

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
      return;
    }

    console.log({ harRequest });
    const httpsnippet = new HTTPSnippet({ postData: { mimeType: RequestContentType.RAW }, ...harRequest });
    let convertedString = httpsnippet.convert(
      snippetTypeId.split("-")[0] as TargetId,
      snippetTypeId.split("-")[1] as ClientId,
      {}
    );

    console.log({ convertedString });
    return convertedString;
  }, [snippetTypeId, harRequest]);

  return (
    <RQModal open={open} onCancel={onClose} destroyOnClose>
      <Select onChange={(value) => setSnippetTypeId(value)} value={snippetTypeId}>
        {availableTargets().map((target) => {
          return target.clients.map((client) => {
            return (
              <Select.Option value={`${target.key}-${client.key}`}>{`${target.title} - ${client.title}`}</Select.Option>
            );
          });
        })}
      </Select>
      <div className="rq-modal-content">
        <Paragraph style={{ whiteSpace: "pre" }} copyable code>
          {getSnippet()}
        </Paragraph>
      </div>
    </RQModal>
  );
};

export default CopyAsModal;
