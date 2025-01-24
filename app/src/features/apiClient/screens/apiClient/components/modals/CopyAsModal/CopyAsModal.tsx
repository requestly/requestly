import { RQAPI } from "features/apiClient/types";
import { HarRequest, HTTPSnippet } from "httpsnippet";
import { RQModal } from "lib/design-system/components";
import { useCallback, useEffect, useState } from "react";
import { apiRequestToHarRequestAdapter } from "../../../utils";
import { Select } from "antd";

interface CopyAsModalProps {
  open: boolean;
  onClose: () => void;
  apiRequest: RQAPI.Request;
}

const CopyAsModal = (props: CopyAsModalProps) => {
  const [harRequest, setHarRequest] = useState<HarRequest>();
  const [clientId, setClientId] = useState<string>();

  useEffect(() => {
    if (!props.apiRequest) {
      return;
    }
    const harRequest = apiRequestToHarRequestAdapter(props.apiRequest);
    setHarRequest(harRequest);
  }, [props.apiRequest]);

  const getConvertedString = useCallback(() => {
    if (!harRequest) {
      return;
    }

    console.log({ harRequest });
    const httpsnippet = new HTTPSnippet(harRequest);
    let convertedString = "";
    if (clientId === "axios") {
      convertedString = httpsnippet.convert("javascript", "axios") as string;
    } else if (clientId === "curl") {
      convertedString = httpsnippet.convert("shell", "curl") as string;
    } else if (clientId === "python-requests") {
      convertedString = httpsnippet.convert("python", "requests") as string;
    }

    console.log({ convertedString });
    return convertedString;
  }, [clientId, harRequest]);

  return (
    <RQModal open={props.open} onCancel={props.onClose} destroyOnClose>
      <Select onChange={(value) => setClientId(value)}>
        <Select.Option value="curl">cURL</Select.Option>
        <Select.Option value="axios">Axios</Select.Option>
        <Select.Option value="python-requests">Python Requests</Select.Option>
      </Select>
      <div className="rq-modal-content">{getConvertedString()}</div>
    </RQModal>
  );
};

export default CopyAsModal;
