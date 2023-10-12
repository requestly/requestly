import { RefObject, UIEventHandler, useEffect, useRef } from "react";

const usePointerAutoScroll = <T extends HTMLDivElement>(
  logId: string
): [containerRef: RefObject<T>, onScroll: UIEventHandler<T>] => {
  const containerRef = useRef<T>();
  const activeLogRef = useRef(null);
  const autoScrollRef = useRef<boolean>(true);

  const onScroll = () => {
    if (activeLogRef.current) {
      const activeLog = activeLogRef.current;
      const container = containerRef.current;
      const containerTop = container.getBoundingClientRect().top;
      const containerBottom = container.getBoundingClientRect().bottom;
      const activeLogTop = activeLog.getBoundingClientRect().top;
      const activeLogBottom = activeLog.getBoundingClientRect().bottom;
      if (activeLogTop < containerTop || activeLogBottom > containerBottom) {
        // active log is not visible, stop auto scrolling
        autoScrollRef.current = false;
      } else {
        // active log is visible, keep on scrolling to active log
        autoScrollRef.current = true;
      }
    }
  };

  useEffect(() => {
    if (containerRef.current && autoScrollRef.current && activeLogRef.current) {
      containerRef.current.scrollTop = activeLogRef.current.offsetTop;
    }
    if (logId) {
      const activeLog = document.querySelector('[data-log-id="' + logId + '"]');
      activeLogRef.current = activeLog;
    }
  }, [logId]);

  return [containerRef, onScroll];
};

export default usePointerAutoScroll;
