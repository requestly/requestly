import { Col, Divider, Input, Row, Space } from "antd";
import { forwardRef } from "react";
import { ValidationErrors } from "../../types";
import { MockType } from "components/features/mocksV2/types";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { generateFinalUrlParts } from "components/features/mocksV2/utils";
import CopyButton from "components/misc/CopyButton";

import "./index.css";

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

  const { prefix, suffix, url } = generateFinalUrlParts(endpoint, uid, username, teamId);

  const renderAddonAfter = () => {
    return (
      <>
        {suffix ? (
          <Space size="small" split={<Divider type="vertical" />}>
            <div className="mock-url-addon-after">{suffix}</div>
            <CopyButton title="" copyText={url} disabled={isNew} />
          </Space>
        ) : (
          <CopyButton title="" copyText={url} disabled={isNew} />
        )}
      </>
    );
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
            addonBefore={<div className="mock-url-addon-before">{prefix}</div>}
            required
            id="endpoint"
            addonAfter={renderAddonAfter()}
            type="text"
            value={endpoint}
            name="path"
            onChange={(e) => setEndpoint(e.target.value)}
            status={errors.endpoint ? "error" : ""}
            placeholder={errors.endpoint ? errors.endpoint : "Enter Endpoint"}
          />
        </Col>
        {/* <Col flex="0 0 auto">
          <CopyButton size="large" title="" copyText={url} disabled={isNew}/>
        </Col> */}
      </Row>
      <span className="field-error-prompt">{errors.endpoint ? errors.endpoint : null}</span>
    </Col>
  );
});

export default MockEditorEndpoint;
