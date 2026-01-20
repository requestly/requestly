import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Spin } from "antd";
import "./index.scss";

export const OnboardingLoader = () => {
  const texts = ["Setting up...", "Almost there..."];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (index < texts.length - 1) {
        setIndex((prevIndex) => prevIndex + 1);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [index, texts.length]);

  return (
    <AnimatePresence>
      <m.div
        key="onboarding-loader"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        transition={{ duration: 0.2 }}
        className="onboarding-loader-wrapper"
      >
        <Spin size="large" className="onboarding-loader-spinner" />
        <AnimatePresence mode="wait">
          <m.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="onboarding-loader-text"
          >
            {texts[index]}
          </m.div>
        </AnimatePresence>
      </m.div>
    </AnimatePresence>
  );
};
