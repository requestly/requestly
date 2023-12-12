import { RefObject, useEffect, useRef } from "react";

const useFocusedAutoScroll = <T extends HTMLDivElement>(containerRef: RefObject<T>, logId: string): (() => void) => {
  const recentLogRef = useRef(null);
  const autoScrollRef = useRef<boolean>(true);

  const onScroll = () => {
    if (recentLogRef.current) {
      const recentLog = recentLogRef.current;
      const container = containerRef.current;
      const containerTop = container.getBoundingClientRect().top;
      const containerBottom = container.getBoundingClientRect().bottom;
      const recentLogTop = recentLog.getBoundingClientRect().top;
      const recentLogBottom = recentLog.getBoundingClientRect().bottom;

      if (recentLogTop < containerTop || recentLogBottom > containerBottom) {
        // active log is not visible, stop auto scrolling
        autoScrollRef.current = false;
      } else {
        // active log is visible, keep on scrolling to active log
        autoScrollRef.current = true;
      }
    }
  };

  useEffect(() => {
    if (containerRef.current && autoScrollRef.current && recentLogRef.current) {
      containerRef.current.scrollTop = recentLogRef.current.offsetTop - 50;
    }
    if (logId) {
      const recentLog = document.querySelector('[data-resource-id="' + logId + '"]');
      recentLogRef.current = recentLog;
    }
  }, [logId, containerRef]);

  return onScroll;
};

export default useFocusedAutoScroll;
