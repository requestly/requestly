import React from "react";
import { Input } from "antd";
import { RQButton } from "lib/design-system-v2/components";
import { MdOutlineSearch } from "@react-icons/all-files/md/MdOutlineSearch";
import "./runtimevariableHeader.scss";
import InfoIcon from "components/misc/InfoIcon";
import { MdOutlineDeleteForever } from "@react-icons/all-files/md/MdOutlineDeleteForever";
import { KEYBOARD_SHORTCUTS } from "../../../../../../constants/keyboardShortcuts";
import LINKS from "config/constants/sub/links";
interface RuntimeVariablesHeaderProps {
  searchValue: string;
  variables: any[];
  onSearchValueChange: (value: string) => void;
  onDeleteAll: () => void;
  onSave: () => Promise<void>;
}
export const RuntimeVariablesHeader: React.FC<RuntimeVariablesHeaderProps> = ({
  searchValue,
  variables,
  onSearchValueChange,
  onDeleteAll,
  onSave,
}) => {
  return (
    <div className="runtime-variables-list-header">
      <div className="runtime-variables-header-info">
        <span className="header-title">Runtime Variables</span>
        <InfoIcon
          text={
            <>
              Runtime variables allow you to store and reuse values throughout the app. These values reset when the API
              client is closed, unless they’re marked as persistent.
              <a href={LINKS.REQUESTLY_RUNTIME_VARIABLES_DOCS} target="_blank" rel="noreferrer">
                See how to use them effectively
              </a>
            </>
          }
          showArrow={false}
          tooltipPlacement="right"
          style={{
            width: "14px",
            height: "14px",
            color: "var(--requestly-color-text-subtle)",
          }}
        />
      </div>
      <div className="runtime-variables-list-action-container">
        <Input
          placeholder="Search variables"
          prefix={<MdOutlineSearch />}
          className="runtime-variables-list-search-input"
          value={searchValue}
          onChange={(e) => onSearchValueChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              onSearchValueChange("");
            }
          }}
        />
        <div className="runtime-variables-list-action-btn">
          <RQButton
            disabled={variables.length < 1}
            className="delete-btn"
            icon={<MdOutlineDeleteForever />}
            onClick={onDeleteAll}
          >
            Delete all
          </RQButton>
          <RQButton
            showHotKeyText
            hotKey={KEYBOARD_SHORTCUTS.API_CLIENT.SAVE_RUNTIME_VARIABLES.hotKey}
            type="primary"
            onClick={() => {
              onSave();
            }}
          >
            Save
          </RQButton>
        </div>
      </div>
    </div>
  );
};
