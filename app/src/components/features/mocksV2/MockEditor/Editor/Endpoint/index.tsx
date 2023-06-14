import { Col, Input, Row } from "antd";
import { forwardRef } from "react";
import { ValidationErrors } from "../../types";
import { MockType } from "components/features/mocksV2/types";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { generateFinalUrlParts } from "components/features/mocksV2/utils";
import CopyButton from "components/misc/CopyButton";

interface EndpointProps {
  isNew: boolean;
  errors: ValidationErrors;
  mockType: MockType;
  endpoint: string;
  setEndpoint: (endpoint: string) => void;
}

const MockEditorEndpoint = forwardRef(({ isNew, errors, mockType, endpoint, setEndpoint }: EndpointProps, ref) => {
  const user = useSelector(getUserAuthDetails);
  const username = user?.details?.username;
  const uid = user?.details?.profile?.uid;
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const teamId = workspace?.id;

  const { url } = generateFinalUrlParts(endpoint, uid, username, teamId);

  const renderAddonAfter = () => {
    return <CopyButton type="ghost" title="Copy URL" copyText={url} disabled={isNew} />;
  };

  return (
    <Col span={24} className={`meta-data-option ${mockType === MockType.API && "addon-option"}`}>
      <label htmlFor="endpoint" className="meta-data-option-label">
        Endpoint
      </label>
      <Row>
        <Col flex="1 0 auto">
          <Input
            // @ts-ignore
            ref={ref}
            addonBefore="/"
            required
            id="endpoint"
            addonAfter={renderAddonAfter()}
            type="text"
            value={endpoint}
            name="path"
            onChange={(e) => setEndpoint(e.target.value)}
            status={errors.endpoint ? "error" : ""}
            placeholder={errors.endpoint ? errors.endpoint : "path"}
          />
        </Col>
      </Row>
      <span className="field-error-prompt">{errors.endpoint ? errors.endpoint : null}</span>
    </Col>
  );
});

export default MockEditorEndpoint;
