import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Avatar } from "antd";
import { RQButton } from "lib/design-system/components";
import { PlusOutlined } from "@ant-design/icons";
import { actions } from "store";

export const JoinWorkspace: React.FC = () => {
  const dispatch = useDispatch();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  return (
    <>
      <div className="header text-center ">We found you team in Requestly</div>
      <div className="display-row-center mt-20">
        <div className="text-gray text-center" style={{ width: "380px" }}>
          Join your teams workspace and get access to shared rules, mock APIs & session replays.
        </div>
      </div>
      <div className="mt-20">
        <div className="space-between onboarding-workspace-card">
          <div className="display-flex">
            <Avatar size={28} shape="square" className="workspace-avatar" icon={<>R</>} />
            <span className="text-bold onboarding-workspace-card-name">Requestly</span>
          </div>
          <div className="text-gray">12 members</div>
          <RQButton className="text-bold" type="primary">
            Join
          </RQButton>
        </div>
      </div>

      <div className="workspace-onboarding-footer">
        <RQButton type="text" onClick={() => dispatch(actions.updateIsWorkspaceOnboardingCompleted())}>
          Skip for now
        </RQButton>
        <RQButton
          type="default"
          className="text-bold"
          onClick={() => {
            setIsProcessing(true);
          }}
          loading={isProcessing}
          icon={<PlusOutlined />}
        >
          Create new workspace
        </RQButton>
      </div>
    </>
  );
};
