import React, { useEffect, useRef } from "react";

export const AutoScrollContainer: React.FC<{ children: React.ReactNode; trigger: any }> = ({ children, trigger }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const { scrollHeight, clientHeight } = container;
      if (scrollHeight > clientHeight) {
        container.scrollTo({ top: scrollHeight, behavior: "smooth" });
      }
    }
  }, [trigger]);

  return (
    <div ref={containerRef} className="tab-scroll-container">
      {children}
    </div>
  );
};
