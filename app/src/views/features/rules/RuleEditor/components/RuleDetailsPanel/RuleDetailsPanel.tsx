import React, { ReactNode, useEffect } from "react";
import { RuleType } from "types";
import { Button } from "antd";
import { MdMenuBook } from "@react-icons/all-files/md/MdMenuBook";
import { MdOutlineFactCheck } from "@react-icons/all-files/md/MdOutlineFactCheck";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import { MdOutlineAssignmentTurnedIn } from "@react-icons/all-files/md/MdOutlineAssignmentTurnedIn";
import { MdOutlineFileDownload } from "@react-icons/all-files/md/MdOutlineFileDownload";
import { MdOutlineOpenInNew } from "@react-icons/all-files/md/MdOutlineOpenInNew";
import { MdOutlineDashboard } from "@react-icons/all-files/md/MdOutlineDashboard";
import { useDispatch } from "react-redux";
import { actions } from "store";
import {
  trackRuleDetailsPanelClosed,
  trackRuleDetailsPanelDocsClicked,
  trackRuleDetailsPanelUseCaseClicked,
  trackRuleDetailsPanelViewed,
} from "modules/analytics/events/common/rules";
import { trackViewAllTemplatesClick } from "modules/analytics/events/features/templates";
import { useNavigate } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import { ExampleType, UseCaseExample } from "./types";
import "./RuleDetailsPanel.scss";

export type RuleDetails = {
  type: RuleType | string;
  name: string;
  icon?: () => ReactNode;
  description: string;
  useCases?: { useCase: string; suggestedTemplateId?: string }[];
  documentationLink: string;
};

interface RuleDetailsPanelProps {
  isSample?: boolean;
  ruleDetails: RuleDetails;
  source: "docs_sidebar" | "new_rule_editor";
}

export const RuleDetailsPanel: React.FC<RuleDetailsPanelProps> = ({ source, isSample = false, ruleDetails }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { type: ruleType, name, description, useCases, documentationLink } = ruleDetails;

  const handleCloseClick = () => {
    trackRuleDetailsPanelClosed(ruleType, source);
    dispatch(actions.closeCurrentlySelectedRuleDetailsPanel());
  };

  const handleAllTemplatesClick = () => {
    trackViewAllTemplatesClick(source, ruleType);
    navigate(PATHS.RULES.TEMPLATES.ABSOLUTE);
  };

  const handleUseTemplateClick = (templateId: string, useCase: string) => {
    trackRuleDetailsPanelUseCaseClicked(ruleType, source, useCase, "use_template");
    navigate(`${PATHS.RULES.TEMPLATES.ABSOLUTE}?id=${templateId}`);
  };

  useEffect(() => {
    if (ruleType && source) {
      trackRuleDetailsPanelViewed(ruleType, source);
    }
  }, [ruleType, source]);

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

  return !ruleType ? null : (
    <div key={ruleType} className="rule-details-panel-container">
      {!isSample ? (
        <span className="close-btn" onClick={handleCloseClick}>
          <MdClose className="anticon" />
        </span>
      ) : null}

      <div className="details-panel">
        <div className="rule-details-container">
          <div className="title">{RULE_DETAILS[ruleType].name}</div>
          <div className="description">{RULE_DETAILS[ruleType].description}</div>
          <div className="links">
            <Button
              type="link"
              target="_blank"
              rel="noreferrer"
              className="link documentation-link"
              href={RULE_DETAILS[ruleType].documentationLink}
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
            {RULE_DETAILS[ruleType].useCases?.length > 0 &&
              RULE_DETAILS[ruleType].useCases?.map(({ useCase, example }, index) => {
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
