import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Col, Row, Typography } from "antd";
import { RQButton } from "lib/design-system/components";
import RulePreviewModal from "components/landing/ruleTemplates/RulePreviewModal";
import { ruleIcons } from "components/common/RuleIcon/ruleIcons";
import APP_CONSTANTS from "config/constants";
import { trackHomeTemplatePreviewClicked, trackTemplatesScrolled } from "components/Home/analytics";
import templatesMap from "../../../landing/ruleTemplates/templates.json";
import { RuleType } from "types";
import PATHS from "config/constants/sub/paths";
import { AUTH } from "modules/analytics/events/common/constants";
import "./index.scss";

export const Templates: React.FC = () => {
  const scrollContainerRef = useRef(null);
  const [ruleToPreview, setRuleToPreview] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [hasScrolledHorizontally, setHasScrolledHorizontally] = useState(false);

  const filteredTemplates = useMemo(() => templatesMap.templates.filter((template: any) => template.isFeatured), []);

  const handleShowRulePreview = (ruleData: any) => {
    setRuleToPreview(ruleData);
    setIsPreviewModalOpen(true);
  };

  useEffect(() => {
    const handleScroll = () => {
      const container = scrollContainerRef.current;

      if (container) {
        const hasHorizontalScroll = container.scrollWidth > container.clientWidth;
        const isScrolledHorizontally = container.scrollLeft > 0;
        setHasScrolledHorizontally(isScrolledHorizontally && hasHorizontalScroll);
      }
    };
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    if (hasScrolledHorizontally) {
      trackTemplatesScrolled();
    }
  }, [hasScrolledHorizontally]);

  return (
    <>
      {isPreviewModalOpen && (
        <RulePreviewModal
          isOpen={isPreviewModalOpen}
          toggle={() => setIsPreviewModalOpen((prev) => !prev)}
          rule={ruleToPreview}
          source={AUTH.SOURCE.HOME_SCREEN}
        />
      )}
      <Col className="home-templates-wrapper">
        <Typography.Title level={5} className="home-templates-title">
          Start with a template
        </Typography.Title>
        <Col span={24} className="home-templates-row" ref={scrollContainerRef}>
          {filteredTemplates.map((template: any) => {
            const ruleType = template.data.ruleDefinition.ruleType;
            return (
              <div className="homepage-primary-card home-templates-row-card">
                <Typography.Text className="home-templates-row-card-title">{template.name}</Typography.Text>
                <Row gutter={8} align="middle" className="home-templates-row-card-tag">
                  <Col className="home-templates-row-card-icon">{ruleIcons[ruleType as RuleType]}</Col>
                  <Col className="home-templates-row-card-ruletype">
                    {APP_CONSTANTS.RULE_TYPES_CONFIG[ruleType]?.NAME}
                  </Col>
                </Row>
                <Col className="home-templates-card-action-bar">
                  <RQButton
                    type="primary"
                    size="small"
                    className="home-templates-card-action-btn"
                    onClick={() => {
                      trackHomeTemplatePreviewClicked(template.name);
                      handleShowRulePreview(template.data);
                    }}
                  >
                    Preview & use
                  </RQButton>
                  {/* <RQButton type="primary" size="small" className="home-templates-card-action-btn">
                  Use this template
                </RQButton> */}
                </Col>
              </div>
            );
          })}
        </Col>

        <Link to={PATHS.RULES.TEMPLATES.ABSOLUTE} className="homepage-view-all-link">
          View all templates
        </Link>
      </Col>
    </>
  );
};
