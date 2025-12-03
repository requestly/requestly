import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Col, Row, Typography } from "antd";
import { RQButton } from "lib/design-system/components";
import { TemplatePreviewModal, templates } from "features/rules";
import { ruleIcons } from "components/common/RuleIcon/ruleIcons";
import APP_CONSTANTS from "config/constants";
import {
  trackHomeTemplatePreviewClicked,
  trackHomeViewAllTemplatesClicked,
  trackTemplatesScrolled,
} from "components/Home/analytics";
import PATHS from "config/constants/sub/paths";
import { SOURCE } from "modules/analytics/events/common/constants";
import { IoIosArrowDropright } from "@react-icons/all-files/io/IoIosArrowDropright";
import { IoIosArrowDropleft } from "@react-icons/all-files/io/IoIosArrowDropleft";
import "./index.scss";

export const Templates: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null!);
  const [ruleToPreview, setRuleToPreview] = useState<any>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [hasScrolledHorizontally, setHasScrolledHorizontally] = useState(false);
  const [isRowScrolledRight, setIsRowScrolledRight] = useState(false);

  const filteredTemplates = useMemo(() => templates.filter((template: any) => template.isFeatured), []);

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
        if (isScrolledHorizontally && hasHorizontalScroll) {
          setHasScrolledHorizontally(true);
        }
        if (scrollContainerRef.current.scrollLeft > 0) {
          setIsRowScrolledRight(true);
        } else {
          setIsRowScrolledRight(false);
        }
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
        <TemplatePreviewModal
          isOpen={isPreviewModalOpen}
          toggle={() => setIsPreviewModalOpen((prev) => !prev)}
          rule={ruleToPreview}
          source={SOURCE.HOME_SCREEN}
        />
      )}
      <Col className="home-templates-wrapper">
        <Typography.Title level={5} className="home-templates-title">
          Start with a template
        </Typography.Title>
        <Col span={24} className="home-templates-row" ref={scrollContainerRef}>
          {filteredTemplates.map((template: any, index: number) => {
            const ruleType = template.data.ruleDefinition.ruleType;
            return (
              <div className="homepage-primary-card home-templates-row-card" key={index}>
                <Typography.Text className="home-templates-row-card-title">{template.name}</Typography.Text>
                <Row gutter={8} align="middle" className="home-templates-row-card-tag">
                  <Col className="home-templates-row-card-icon">{ruleIcons[ruleType as keyof typeof ruleIcons]}</Col>
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

        <Link
          to={PATHS.RULES.TEMPLATES.ABSOLUTE}
          className="homepage-view-all-link"
          onClick={() => trackHomeViewAllTemplatesClicked()}
        >
          View all templates
        </Link>
        {isRowScrolledRight ? (
          <div className="templates-left-inset-shadow">
            <IoIosArrowDropleft
              onClick={() => {
                scrollContainerRef.current.scrollLeft = 0;
              }}
            />
          </div>
        ) : (
          <div className="templates-right-inset-shadow">
            <IoIosArrowDropright
              onClick={() => {
                scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
              }}
            />
          </div>
        )}
      </Col>
    </>
  );
};
