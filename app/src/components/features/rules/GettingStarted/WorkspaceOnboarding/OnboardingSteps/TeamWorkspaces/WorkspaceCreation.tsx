import { useState } from "react";
import { Typography, Switch, Divider } from "antd";
import { RQButton, RQInput } from "lib/design-system/components";
import { ReactMultiEmail, isEmail as validateEmail } from "react-multi-email";
import { CopyOutlined } from "@ant-design/icons";
import "./index.css";

export const CreateWorkspace = () => {
  const [userEmail, setUserEmail] = useState([]);
  return (
    <>
      <div className="header text-center ">Invite teammates</div>
      <div className="mt-20">
        <label htmlFor="workspace-name" className="text-bold text-white">
          Name of your workspace
        </label>
        <RQInput
          id="workspace-name"
          size="small"
          placeholder="Workspace name"
          className="mt-8 workspace-onboarding-field"
        />
      </div>
      <div className="mt-20">
        <label htmlFor="email-address" className="text-bold text-white">
          Email address
        </label>
        <ReactMultiEmail
          className="mt-8"
          placeholder="Email Address"
          //@ts-ignore
          type="email"
          value={userEmail}
          onChange={setUserEmail}
          validateEmail={validateEmail}
          getLabel={(email, index, removeEmail) => (
            <div data-tag key={index} className="multi-email-tag">
              {email}
              <span title="Remove" data-tag-handle onClick={() => removeEmail(index)}>
                <img alt="remove" src="/assets/img/workspaces/cross.svg" />
              </span>
            </div>
          )}
        />
      </div>
      <div className="mt-20">
        <div className="text-bold text-white">Invite link</div>
        <div className="workspace-invite-link">
          <RQInput
            size="small"
            className="mt-8 workspace-onboarding-field"
            disabled
            value="https://weadjkldjalskjdaksjdakljdakldasdasd ad ad asdasdas asd as adad aa"
          />
          <RQButton type="default">
            <CopyOutlined />
            Copy
          </RQButton>
        </div>
      </div>
      <Divider />
      <div className="mt-20 space-between">
        <Typography.Text className="text-gray">Anyone with requestly.io can join the workspace</Typography.Text>
        <Switch defaultChecked />
      </div>
      <div className="workspace-onboarding-footer">
        <RQButton type="text"> Skip for now</RQButton>
        <RQButton type="primary" className="text-bold">
          Send invitations
        </RQButton>
      </div>
    </>
  );
};
