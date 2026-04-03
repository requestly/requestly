import React from "react";
import NoProvidersIcon from "assets/icons/no-providers.svg?react";
import { RQButton } from "lib/design-system-v2/components";
import "./index.scss";

interface NoProvidersEmptyStateProps {
  title?: string;
  description?: string;
  ctaText?: string;
  onCtaClick?: () => void;
  icon?: React.ReactNode;
}
const NoProvidersEmptyState = ({ title, description, ctaText, onCtaClick, icon }: NoProvidersEmptyStateProps) => {
  return (
    <section className="no-provider-empty-state-container">
      {icon || <NoProvidersIcon />}
      <div className="no-provider-text-container">
        <p className="title-text">{title}</p>
        <p className="description-text">{description}</p>
      </div>
      <RQButton type="primary" onClick={onCtaClick}>
        {ctaText}
      </RQButton>
    </section>
  );
};

export default NoProvidersEmptyState;
