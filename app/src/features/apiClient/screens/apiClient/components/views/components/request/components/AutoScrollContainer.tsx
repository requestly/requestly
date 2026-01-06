import React, { useEffect, useRef } from "react";

interface AutoScrollContainerProps<TTrigger = unknown> {
  children: React.ReactNode;
  trigger: TTrigger;
  scrollTargetRef?: React.RefObject<HTMLElement> | null;
}

export const AutoScrollContainer: React.FC<AutoScrollContainerProps> = ({ children, trigger, scrollTargetRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      if (scrollTargetRef?.current) {
        scrollTargetRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } else {
        const { scrollHeight, clientHeight } = container;
        if (scrollHeight > clientHeight) {
          container.scrollTo({ top: scrollHeight, behavior: "smooth" });
        }
      }
    }
  }, [trigger, scrollTargetRef]);

  return (
    <div ref={containerRef} className="tab-scroll-container">
      {children}
    </div>
  );
};
