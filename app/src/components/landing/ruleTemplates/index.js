import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Table, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { redirectToSharedListViewer } from "../../../utils/RedirectionUtils";
import { getAppMode } from "store/selectors";
import RulePreviewModal from "./RulePreviewModal";
import ProCard from "@ant-design/pro-card";
import { trackTemplateImportStarted } from "modules/analytics/events/features/templates";
import { snakeCase } from "lodash";
import RuleTypeTag from "components/common/RuleTypeTag";
const { templates } = require("./templates.json");

const TemplatesIndexPage = () => {
  const navigate = useNavigate();

  //Global State
  const appMode = useSelector(getAppMode);

  const filteredRuleTemplates = templates.filter((template) => {
    return template.data.targetAppMode.includes(appMode);
  });

  const [isSharedListRuleViewerModalActive, setIsSharedListRuleViewModalActive] = useState(false);
  const [ruleToViewInModal, setRuleToViewInModal] = useState(false);

  const toggleSharedListRuleViewerModal = () => {
    setIsSharedListRuleViewModalActive(!isSharedListRuleViewerModalActive);
  };

  const openRuleViewerInModal = (rule) => {
    setRuleToViewInModal(rule);
    setIsSharedListRuleViewModalActive(true);
  };
  const viewSharedList = (data) => {
    redirectToSharedListViewer(navigate, data.shareId, data.sharedListName, true);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      width: "25%",
      key: "name",
      render: (text, record) => (
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            record.isSharedList ? viewSharedList(record.data) : openRuleViewerInModal(record.data);
            trackTemplateImportStarted(snakeCase(record.name));
            return false;
          }}
        >
          {text}
        </a>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      width: "40%",
      key: "description",
    },
    {
      title: "Rule",
      key: "tags",
      dataIndex: "tags",
      width: "20%",
      render: (tags, record) => {
        let ruleTypes = [];

        if (tags?.length) {
          ruleTypes = tags;
        } else if (!record.isSharedList) {
          ruleTypes = [record.data.ruleDefinition.ruleType];
        }

        return (
          <>
            {ruleTypes.map((ruleType, index) => (
              <RuleTypeTag key={index} ruleType={ruleType} title={ruleType.toUpperCase()} />
            ))}
          </>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        return (
          <Space size="middle">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                trackTemplateImportStarted(snakeCase(record.name));
                record.isSharedList ? viewSharedList(record.data) : openRuleViewerInModal(record.data);
                return false;
              }}
            >
              Use this
            </a>
          </Space>
        );
      },
    },
  ];

  return (
    <React.Fragment>
      <ProCard className="primary-card github-like-border" title={null}>
        <h2>Templates</h2>
        {isSharedListRuleViewerModalActive ? (
          <RulePreviewModal
            isOpen={isSharedListRuleViewerModalActive}
            toggle={toggleSharedListRuleViewerModal}
            rule={ruleToViewInModal}
          />
        ) : null}
        <Table columns={columns} dataSource={filteredRuleTemplates} pagination={false} className="records-table" />
      </ProCard>
    </React.Fragment>
  );
};

export default TemplatesIndexPage;
