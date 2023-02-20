import { RefObject, UIEventHandler, useEffect, useRef } from "react";

const useAutoScrollableContainer = <T extends HTMLElement>(
  content: unknown
): [containerRef: RefObject<T>, onScroll: UIEventHandler<T>] => {
  const containerRef = useRef<T>();
  const autoScrollRef = useRef<boolean>(true);

  const onScroll = () => {
    const container = containerRef.current;
    const overflowHeight = container.scrollHeight - container.clientHeight;
    if (container.scrollTop < overflowHeight) {
      // scroll position is not at the end, user must have scrolled
      autoScrollRef.current = false;
    } else {
      autoScrollRef.current = true;
    }
  };

  useEffect(() => {
    if (containerRef.current && autoScrollRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [content]);

  return [containerRef, onScroll];
};

export default useAutoScrollableContainer;
