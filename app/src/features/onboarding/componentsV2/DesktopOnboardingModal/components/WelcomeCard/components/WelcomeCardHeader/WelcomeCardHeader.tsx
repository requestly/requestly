import React from "react";
import "./welcomeCardHeader.scss";
import { m, AnimatePresence } from "framer-motion";
import { collapseExpandTransition } from "utils/animations";

interface WelcomeCardHeaderProps {
  title: string;
  description: string | null;
  iconSrc: string;
}
export const WelcomeCardHeader: React.FC<WelcomeCardHeaderProps> = ({
  title,
  description,
  iconSrc,
}: WelcomeCardHeaderProps) => {
  return (
    <div className="welcome-card-header">
      <div className="welcome-card-header__icon">
        <img src={iconSrc} alt={title} />
      </div>
      <div className="welcome-card-header__content">
        <div className="welcome-card-header__content-title">{title}</div>
        <AnimatePresence initial={false}>
          {description && (
            <m.div key="welcome-card-header-content-description" {...collapseExpandTransition}>
              <div className="welcome-card-header__content-description">{description}</div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
