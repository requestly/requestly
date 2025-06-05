import React, { ReactNode } from "react";
import { Button } from "antd";
import { MdMenuBook } from "@react-icons/all-files/md/MdMenuBook";
import { MdOutlineFactCheck } from "@react-icons/all-files/md/MdOutlineFactCheck";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import { MdOutlineAssignmentTurnedIn } from "@react-icons/all-files/md/MdOutlineAssignmentTurnedIn";
import { MdOutlineFileDownload } from "@react-icons/all-files/md/MdOutlineFileDownload";
import { MdOutlineOpenInNew } from "@react-icons/all-files/md/MdOutlineOpenInNew";
import { MdOutlineDashboard } from "@react-icons/all-files/md/MdOutlineDashboard";
import { useDispatch } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import {
  trackRuleDetailsPanelClosed,
  trackRuleDetailsPanelDocsClicked,
  trackRuleDetailsPanelUseCaseClicked,
} from "modules/analytics/events/common/rules";
import { trackViewAllTemplatesClick } from "modules/analytics/events/features/templates";
import { useNavigate } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import { ExampleType, UseCaseExample } from "./types";
import "./RuleDetailsPanel.scss";
import { RuleType } from "@requestly/shared/types/entities/rules";

export type RuleDetails = {
  type: RuleType | string;
  name: string;
  icon?: () => ReactNode;
  description: string;
  useCases?: {
    useCase: string;
    example?: UseCaseExample;
  }[];
  documentationLink: string;
};

interface RuleDetailsPanelProps {
  isSample?: boolean;
  ruleDetails: RuleDetails;
  source: "docs_sidebar" | "new_rule_editor";
  handleSeeLiveRuleDemoClick?: () => void;
}

export const RuleDetailsPanel: React.FC<RuleDetailsPanelProps> = ({
  source,
  isSample = false,
  ruleDetails,
  handleSeeLiveRuleDemoClick = () => {},
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { type: ruleType, name, description, useCases, documentationLink } = ruleDetails;

  const handleCloseClick = () => {
    trackRuleDetailsPanelClosed(ruleType, source);
    dispatch(globalActions.closeCurrentlySelectedRuleDetailsPanel());
  };

  const handleAllTemplatesClick = () => {
    trackViewAllTemplatesClick(source, ruleType);
    navigate(PATHS.RULES.TEMPLATES.ABSOLUTE);
  };

  const handleUseTemplateClick = (templateId: string, useCase: string) => {
    trackRuleDetailsPanelUseCaseClicked(ruleType, source, useCase, "use_template");
    navigate(`${PATHS.RULES.TEMPLATES.ABSOLUTE}?id=${templateId}`);
  };

  const getActionButton = (useCase: string, example: UseCaseExample) => {
    switch (example?.type) {
      case ExampleType.USE_TEMPLATE: {
        return (
          <>
            <Button
              type="link"
              className="link use-template-btn"
              icon={<MdOutlineFactCheck className="anticon" />}
              onClick={() => handleUseTemplateClick(example.suggestedTemplateId, useCase)}
            >
              Use template
            </Button>
          </>
        );
      }

      case ExampleType.DOWNLOAD_DESKTOP_APP: {
        return (
          <>
            <Button
              type="link"
              target="_blank"
              href={example.link}
              className="link use-template-btn"
              icon={<MdOutlineFileDownload className="anticon" />}
              onClick={() => {
                trackRuleDetailsPanelUseCaseClicked(ruleType, source, useCase, "dowload_desktop_app");
              }}
            >
              Download Desktop App
            </Button>
          </>
        );
      }

      case ExampleType.PLAYGROUND_LINK: {
        return (
          <>
            <Button
              type="link"
              target="_blank"
              href={example.link}
              className="link use-template-btn"
              icon={<MdOutlineOpenInNew className="anticon" />}
              onClick={() => {
                trackRuleDetailsPanelUseCaseClicked(ruleType, source, useCase, "try_this_rule");
              }}
            >
              Try this rule
            </Button>
          </>
        );
      }

      default: {
        return null;
      }
    }
  };

  return !ruleType ? null : isSample ? (
    <div key={ruleType} className={`rule-details-panel-container sample-rule`}>
      <div className="details-panel">
        <div className="rule-details-container">
          <div className="title">{name}</div>
          <div className="description">{description}</div>
          <div className="actions">
            <Button
              className="documentation-link"
              onClick={() => {
                trackRuleDetailsPanelDocsClicked(ruleType, source);
                window.open(documentationLink, "_blank");
              }}
            >
              <MdMenuBook /> Read complete documentation
            </Button>

            <Button type="primary" className="documentation-link" onClick={handleSeeLiveRuleDemoClick}>
              See live rule demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div key={ruleType} className={`rule-details-panel-container`}>
      <span className="close-btn" onClick={handleCloseClick}>
        <MdClose className="anticon" />
      </span>

      <div className="details-panel">
        <div className="rule-details-container">
          <div className="title">{name}</div>
          <div className="description">{description}</div>
          <div className="links">
            <Button
              type="link"
              target="_blank"
              rel="noreferrer"
              className="link documentation-link"
              href={documentationLink}
              onClick={() => trackRuleDetailsPanelDocsClicked(ruleType, source)}
            >
              <MdMenuBook /> Read complete documentation <MdOutlineOpenInNew />
            </Button>

            <Button type="link" className="templates-btn link" onClick={handleAllTemplatesClick}>
              <MdOutlineDashboard /> Explore all templates <MdOutlineOpenInNew />
            </Button>
          </div>
        </div>

        <div className="use-cases-container">
          <div className="title">Popular use cases</div>

          <ul className="use-cases-list">
            {useCases?.length > 0 &&
              useCases?.map(({ useCase, example }, index) => {
                const action = getActionButton(useCase, example);

                return (
                  <>
                    <li key={index} className="use-case-list-item">
                      <MdOutlineAssignmentTurnedIn className="list-item-icon" />
                      <div className="use-case">
                        {useCase} {"  "}
                        <br />
                        {action}
                      </div>
                    </li>
                  </>
                );
              })}
          </ul>
        </div>
      </div>
    </div>
  );
};
