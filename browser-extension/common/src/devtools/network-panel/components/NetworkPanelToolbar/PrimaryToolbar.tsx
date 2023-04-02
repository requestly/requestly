import Icon, { StopOutlined } from "@ant-design/icons";
import { Button, Checkbox, Divider, Space } from "antd";
import React, { useCallback } from "react";
import UserAgentRuleIcon from "../../../../../resources/icons/rule-icons/useragent.svg";
import CodeIcon from "../../../../../resources/icons/code.svg";
import CSSIcon from "../../../../../resources/icons/css.svg";
import "./networkPanelToolbar.scss";
import { createRule, getPageOrigin } from "../../utils";
import { NetworkPanelSettings, RuleEditorUrlFragment } from "../../types";
import {
  ScriptCodeType,
  ScriptRulePair,
  ScriptType,
  SourceKey,
  SourceOperator,
} from "../../../../types";

interface Props {
  clearEvents: () => void;
  settings: NetworkPanelSettings;
  onSettingsChange: (settings: NetworkPanelSettings) => void;
}

const PrimaryToolbar: React.FC<Props> = ({
  clearEvents,
  settings,
  onSettingsChange,
}) => {
  const onPreserveLogSettingChanged = useCallback(
    (newPreserveLogSetting: boolean) => {
      onSettingsChange({
        ...settings,
        preserveLog: newPreserveLogSetting,
      });
    },
    [settings]
  );

  const addJSInPage = useCallback(async () => {
    const pageOrigin = await getPageOrigin();

    createRule(
      RuleEditorUrlFragment.SCRIPT,
      (rule) => {
        const rulePair = rule.pairs[0] as ScriptRulePair;
        rulePair.source = {
          key: SourceKey.URL,
          operator: SourceOperator.CONTAINS,
          value: pageOrigin,
        };
        rulePair.scripts = [
          {
            type: ScriptType.CODE,
            codeType: ScriptCodeType.JS,
            loadTime: "afterPageLoad",
            value: 'console.log("Hello World");',
          },
        ];
      },
      "textarea"
    );
  }, []);

  const addCSSInPage = useCallback(async () => {
    const pageOrigin = await getPageOrigin();

    createRule(RuleEditorUrlFragment.SCRIPT, (rule) => {
      const rulePair = rule.pairs[0] as ScriptRulePair;
      rulePair.source = {
        key: SourceKey.URL,
        operator: SourceOperator.CONTAINS,
        value: pageOrigin,
      };
      rulePair.scripts = [
        {
          type: ScriptType.CODE,
          codeType: ScriptCodeType.CSS,
          loadTime: "afterPageLoad",
          value: "body {\n\tbackground-color: #fff;\n}",
        },
      ];
    });
  }, []);

  const emulateDevice = useCallback(async () => {
    const pageOrigin = await getPageOrigin();

    createRule(
      RuleEditorUrlFragment.USER_AGENT,
      (rule) => {
        const rulePair = rule.pairs[0];
        rulePair.source.filters = [
          {
            pageUrl: {
              operator: SourceOperator.CONTAINS,
              value: pageOrigin,
            },
          },
        ];
        // @ts-ignore
        rulePair.envType = "device";
      },
      '[data-selectionid="device-selector"] input'
    );
  }, []);

  return (
    <div className="network-panel-toolbar primary">
      <div>
        <Button
          icon={<StopOutlined />}
          type="text"
          className="clear-events-button"
          onClick={clearEvents}
        >
          Clear logs
        </Button>
        <Divider type="vertical" className="divider" />
        <Checkbox
          className="preserve-log-checkbox"
          checked={settings.preserveLog}
          onChange={(e) => onPreserveLogSettingChanged(e.target.checked)}
        >
          Preserve log
        </Checkbox>
      </div>
      <Space>
        <Button
          icon={<Icon component={CodeIcon} />}
          type="text"
          onClick={addJSInPage}
        >
          Add JavaScript to page
        </Button>
        <Button
          icon={<Icon component={CSSIcon} />}
          type="text"
          onClick={addCSSInPage}
        >
          Add CSS to page
        </Button>
        <Button
          icon={<Icon component={UserAgentRuleIcon} />}
          type="text"
          onClick={emulateDevice}
        >
          Emulate for different device
        </Button>
      </Space>
    </div>
  );
};

export default PrimaryToolbar;
