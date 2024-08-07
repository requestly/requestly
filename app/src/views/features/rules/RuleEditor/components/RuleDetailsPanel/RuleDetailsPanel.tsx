import React, { useEffect } from "react";
import { ExampleType, RULE_DETAILS } from "./constants";
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
  trackRuleDetailsPanelViewed,
} from "modules/analytics/events/common/rules";
import { trackUseTemplateClick, trackViewAllTemplatesClick } from "modules/analytics/events/features/templates";
import { useNavigate } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import "./RuleDetailsPanel.scss";

interface RuleDetailsPanelProps {
  ruleType: RuleType | undefined;
  source: "docs_sidebar" | "new_rule_editor";
}

export const RuleDetailsPanel: React.FC<RuleDetailsPanelProps> = ({ ruleType, source }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleCloseClick = () => {
    trackRuleDetailsPanelClosed(ruleType, source);
    dispatch(actions.closeCurrentlySelectedRuleDetailsPanel());
  };

  const handleAllTemplatesClick = () => {
    trackViewAllTemplatesClick(source, ruleType);
    navigate(PATHS.RULES.TEMPLATES.ABSOLUTE);
  };

  const handleUseTemplateClick = (templateId: string) => {
    trackUseTemplateClick(source, ruleType);
    navigate(`${PATHS.RULES.TEMPLATES.ABSOLUTE}?id=${templateId}`);
  };

  useEffect(() => {
    if (ruleType && source) {
      trackRuleDetailsPanelViewed(ruleType, source);
    }
  }, [ruleType, source]);

  return !ruleType ? null : (
    <div key={ruleType} className="rule-details-panel-container">
      <span className="close-btn" onClick={handleCloseClick}>
        <MdClose className="anticon" />
      </span>

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
                return (
                  <>
                    <li key={index} className="use-case-list-item">
                      <MdOutlineAssignmentTurnedIn className="list-item-icon" />
                      <div className="use-case">
                        {useCase} {"  "}
                        <br />
                        {example?.type === ExampleType.USE_TEMPLATE ? (
                          <>
                            <Button
                              type="link"
                              className="link use-template-btn"
                              icon={<MdOutlineFactCheck className="anticon" />}
                              onClick={() => handleUseTemplateClick(example.suggestedTemplateId)}
                            >
                              Use template
                            </Button>
                          </>
                        ) : example?.type === ExampleType.DOWNLOAD_DESKTOP_APP ? (
                          <>
                            <Button
                              type="link"
                              target="_blank"
                              href={example.link}
                              className="link use-template-btn"
                              icon={<MdOutlineFileDownload className="anticon" />}
                              onClick={() => {
                                // TODO: send event
                              }}
                            >
                              Download Desktop App
                            </Button>
                          </>
                        ) : example?.type === ExampleType.PLAYGROUND_LINK ? (
                          <>
                            <Button
                              type="link"
                              target="_blank"
                              href={example.link}
                              className="link use-template-btn"
                              icon={<MdOutlineOpenInNew className="anticon" />}
                              onClick={() => {
                                // send event
                              }}
                            >
                              Try this on Requestly Playground
                            </Button>
                          </>
                        ) : null}
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
