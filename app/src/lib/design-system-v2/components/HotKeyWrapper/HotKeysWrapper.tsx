import React from "react";
import { capitalize } from "lodash";
import { useHotkeys } from "react-hotkeys-hook";
import "./HotKeysWrapper.scss";

interface HotKeysWrapperProps {
  showHotKeyText?: boolean;
  hotKeyCombination?: string;
  hotKeyCallback?: Parameters<typeof useHotkeys>["1"];
  children?: React.ReactNode;
}

type WithHotKeysProps<T = {}> = T & HotKeysWrapperProps;

export const withHotKeys = <P extends object, R>(Children: React.ComponentType<P>) => {
  const ComponentWithHotkeys = (props: WithHotKeysProps<P>, ref: React.ForwardedRef<R>) => {
    const { hotKeyCombination, hotKeyCallback, showHotKeyText, ...restProps } = props; // Remove unrecognised props

    useHotkeys(
      hotKeyCombination ?? "",
      (event, hotkeysEvent) => {
        hotKeyCallback?.(event, hotkeysEvent);
      },
      {
        preventDefault: true,
        enableOnFormTags: ["input", "INPUT"],
      }
    );

    if (!hotKeyCombination || !hotKeyCallback) {
      return <Children ref={ref} {...(restProps as P)} />;
    }

    const keys = hotKeyCombination.split("+");

    const hotKeytext = showHotKeyText ? (
      <div className="rq-hotkey-text-container">
        <span className="rq-hotkey-text">
          {keys.map((key, index) => (
            <>
              <span className="key">{capitalize(key)}</span>
              {index === keys.length - 1 ? null : <span>+</span>}
            </>
          ))}
        </span>
      </div>
    ) : null;

    let children = props.children;
    if (hotKeytext) {
      children = (
        <div className="rq-container-with-hotKey-text">
          {props.children}
          {hotKeytext}
        </div>
      );
    }

    return <Children ref={ref} {...(restProps as P)} children={children} />;
  };

  return React.forwardRef(ComponentWithHotkeys);
};
