import React, { forwardRef } from "react";
import { Col, Input, InputRef, Row } from "antd";
import { ValidationErrors } from "../../types";
import { MockType } from "components/features/mocksV2/types";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { generateFinalUrlParts } from "components/features/mocksV2/utils";
import CopyButton from "components/misc/CopyButton";
import { LoadingOutlined } from "@ant-design/icons";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";

interface EndpointProps {
  isNew: boolean;
  disabled?: boolean;
  errors: ValidationErrors;
  mockType: MockType;
  endpoint: string;
  collectionPath?: string;
  setEndpoint: (endpoint: string) => void;
  password: string;
  isMockCollectionLoading?: boolean;
}

const MockEditorEndpoint = forwardRef(
  (
    {
      isNew,
      disabled,
      errors,
      mockType,
      endpoint,
      setEndpoint,
      password,
      collectionPath,
      isMockCollectionLoading = false,
    }: EndpointProps,
    ref: React.ForwardedRef<InputRef>
  ) => {
    const user = useSelector(getUserAuthDetails);
    const username = user?.details?.username;
    const uid = user?.details?.profile?.uid;
    const activeWorkspaceId = useSelector(getActiveWorkspaceId);

    const { url } = generateFinalUrlParts({
      endpoint,
      uid,
      username,
      teamId: activeWorkspaceId,
      password,
      collectionPath,
    });

    const renderAddonAfter = () => {
      return <CopyButton type="ghost" title="Copy URL" copyText={url} disabled={isNew || isMockCollectionLoading} />;
    };

    return (
      <Col span={24} className={`meta-data-option ${mockType === MockType.API && "addon-option"}`}>
        <label htmlFor="endpoint" className="meta-data-option-label">
          Endpoint
        </label>
        <Row>
          <Col flex="1 0 auto">
            <Input
              ref={ref}
              disabled={disabled}
              addonBefore={isMockCollectionLoading ? <LoadingOutlined /> : "/" + collectionPath}
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
  }
);

export default MockEditorEndpoint;
