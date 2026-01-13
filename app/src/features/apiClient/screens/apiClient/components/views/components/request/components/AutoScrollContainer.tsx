import React, { useEffect, useRef } from "react";

interface AutoScrollContainerProps<Trigger = unknown> {
  children: React.ReactNode;
  trigger: Trigger;
  scrollTargetRef?: React.RefObject<HTMLElement> | null;
}

/**
 * Container that handles automatic scrolling behavior when the trigger prop changes.
 * * Note: The `ref` object passed to `scrollTargetRef` needs to be stable, else it might cause bugs/rerenders/unnecessary auto scrolls.
 */
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
