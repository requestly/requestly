import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import isEmpty from "is-empty";
import APP_CONSTANTS from "./config/constants";
import { submitAppDetailAttributes } from "utils/AnalyticsUtils.js";
import { ConfigProvider } from "antd";
import enUS from "antd/lib/locale/en_US";
import useGeoLocation from "hooks/useGeoLocation";
import DashboardLayout from "layouts/DashboardLayout";
import FullScreenLayout from "layouts/FullScreenLayout";
import UpdateDialog from "components/mode-specific/desktop/UpdateDialog";
import ThirdPartyIntegrationsHandler from "hooks/ThirdPartyIntegrationsHandler";
import { CommandBar } from "components/misc/CommandBar";
import { GrowthBookProvider } from "@growthbook/growthbook-react";
import { growthbook } from "utils/feature-flag/growthbook";
import LocalUserAttributesHelperComponent from "hooks/LocalUserAttributesHelperComponent";
import PreLoadRemover from "hooks/PreLoadRemover";
import AppModeInitializer from "hooks/AppModeInitializer";
import DBListeners from "hooks/DbListenerInit/DBListeners";
import RuleExecutionsSyncer from "hooks/RuleExecutionsSyncer";
import FeatureUsageEvent from "hooks/FeatureUsageEvent";
import ActiveWorkspace from "hooks/ActiveWorkspace";
import AuthHandler from "hooks/AuthHandler";
import { getXmlToJs } from "utils/charles-rule-adapters/getXmlToJs";

const { PATHS } = APP_CONSTANTS;

// const singleRuleExportedData = `<?charles serialisation-version='2.0' ?>
// <selectedHostsTool>
// <locations>
// <locationPatterns>
// <locationMatch>
// <location>
// <protocol>https</protocol>
// <host>www.flipkart.com</host>
// </location>
// <enabled>true</enabled>
// </locationMatch>
// <locationMatch>
// <location>
// <protocol>https</protocol>
// <host>github.com</host>
// <port>443</port>
// </location>
// <enabled>true</enabled>
// </locationMatch>
// </locationPatterns>
// </locations>
// <toolEnabled>true</toolEnabled>
// <useSelectedLocations>true</useSelectedLocations>
// </selectedHostsTool>`;

const oneTimeExportedData = `<?charles serialisation-version='2.0' ?>
<charles-export>
<toolConfiguration>
<configs>
<entry>
<string>Rewrite</string>
<rewrite>
<toolEnabled>true</toolEnabled>
<debugging>false</debugging>
<sets>
<rewriteSet>
<active>false</active>
<name>flipkart</name>
<hosts>
<locationPatterns>
<locationMatch>
<location>
<protocol>https</protocol>
<host>www.flipkart.com</host>
</location>
<enabled>true</enabled>
</locationMatch>
</locationPatterns>
</hosts>
<rules>
<rewriteRule>
<active>true</active>
<ruleType>11</ruleType>
<matchValue>200</matchValue>
<matchHeaderRegex>false</matchHeaderRegex>
<matchValueRegex>true</matchValueRegex>
<matchRequest>false</matchRequest>
<matchResponse>false</matchResponse>
<newValue>300</newValue>
<newHeaderRegex>false</newHeaderRegex>
<newValueRegex>false</newValueRegex>
<matchWholeValue>false</matchWholeValue>
<caseSensitive>false</caseSensitive>
<replaceType>2</replaceType>
</rewriteRule>
<rewriteRule>
<active>false</active>
<ruleType>6</ruleType>
<matchValue>https://www.flipkart.com/</matchValue>
<matchHeaderRegex>false</matchHeaderRegex>
<matchValueRegex>false</matchValueRegex>
<matchRequest>false</matchRequest>
<matchResponse>false</matchResponse>
<newValue>https://www.amazon.com/</newValue>
<newHeaderRegex>false</newHeaderRegex>
<newValueRegex>false</newValueRegex>
<matchWholeValue>false</matchWholeValue>
<caseSensitive>false</caseSensitive>
<replaceType>2</replaceType>
</rewriteRule>
<rewriteRule>
<active>false</active>
<ruleType>10</ruleType>
<matchHeader>test</matchHeader>
<matchValue>one</matchValue>
<matchHeaderRegex>false</matchHeaderRegex>
<matchValueRegex>false</matchValueRegex>
<matchRequest>false</matchRequest>
<matchResponse>false</matchResponse>
<newHeaderRegex>false</newHeaderRegex>
<newValueRegex>false</newValueRegex>
<matchWholeValue>false</matchWholeValue>
<caseSensitive>false</caseSensitive>
<replaceType>2</replaceType>
</rewriteRule>
<rewriteRule>
<active>false</active>
<ruleType>3</ruleType>
<matchHeader>Server</matchHeader>
<matchValue>nginx</matchValue>
<matchHeaderRegex>false</matchHeaderRegex>
<matchValueRegex>false</matchValueRegex>
<matchRequest>true</matchRequest>
<matchResponse>true</matchResponse>
<newHeader>Server</newHeader>
<newValue>google</newValue>
<newHeaderRegex>false</newHeaderRegex>
<newValueRegex>false</newValueRegex>
<matchWholeValue>false</matchWholeValue>
<caseSensitive>false</caseSensitive>
<replaceType>2</replaceType>
</rewriteRule>
<rewriteRule>
<active>false</active>
<ruleType>7</ruleType>
<matchValue>Buildings Alyssa, Begonia</matchValue>
<matchHeaderRegex>false</matchHeaderRegex>
<matchValueRegex>true</matchValueRegex>
<matchRequest>true</matchRequest>
<matchResponse>false</matchResponse>
<newValue>Buildings Alyssa, India</newValue>
<newHeaderRegex>false</newHeaderRegex>
<newValueRegex>false</newValueRegex>
<matchWholeValue>false</matchWholeValue>
<caseSensitive>false</caseSensitive>
<replaceType>2</replaceType>
</rewriteRule>
<rewriteRule>
<active>false</active>
<ruleType>2</ruleType>
<matchHeader/>
<matchValue/>
<matchHeaderRegex>false</matchHeaderRegex>
<matchValueRegex>false</matchValueRegex>
<matchRequest>true</matchRequest>
<matchResponse>false</matchResponse>
<newHeaderRegex>false</newHeaderRegex>
<newValueRegex>false</newValueRegex>
<matchWholeValue>false</matchWholeValue>
<caseSensitive>false</caseSensitive>
<replaceType>2</replaceType>
</rewriteRule>
<rewriteRule>
<active>false</active>
<ruleType>4</ruleType>
<matchValue>www.flipkart.com</matchValue>
<matchHeaderRegex>false</matchHeaderRegex>
<matchValueRegex>false</matchValueRegex>
<matchRequest>false</matchRequest>
<matchResponse>false</matchResponse>
<newValue>www.amazon.com</newValue>
<newHeaderRegex>false</newHeaderRegex>
<newValueRegex>false</newValueRegex>
<matchWholeValue>false</matchWholeValue>
<caseSensitive>false</caseSensitive>
<replaceType>2</replaceType>
</rewriteRule>
<rewriteRule>
<active>false</active>
<ruleType>5</ruleType>
<matchValue/>
<matchHeaderRegex>false</matchHeaderRegex>
<matchValueRegex>false</matchValueRegex>
<matchRequest>false</matchRequest>
<matchResponse>false</matchResponse>
<newValue/>
<newHeaderRegex>false</newHeaderRegex>
<newValueRegex>false</newValueRegex>
<matchWholeValue>false</matchWholeValue>
<caseSensitive>false</caseSensitive>
<replaceType>2</replaceType>
</rewriteRule>
<rewriteRule>
<active>false</active>
<ruleType>8</ruleType>
<matchHeader/>
<matchValue/>
<matchHeaderRegex>false</matchHeaderRegex>
<matchValueRegex>false</matchValueRegex>
<matchRequest>false</matchRequest>
<matchResponse>false</matchResponse>
<newHeader/>
<newValue/>
<newHeaderRegex>false</newHeaderRegex>
<newValueRegex>false</newValueRegex>
<matchWholeValue>false</matchWholeValue>
<caseSensitive>false</caseSensitive>
<replaceType>2</replaceType>
</rewriteRule>
<rewriteRule>
<active>false</active>
<ruleType>9</ruleType>
<matchHeader/>
<matchValue/>
<matchHeaderRegex>false</matchHeaderRegex>
<matchValueRegex>false</matchValueRegex>
<matchRequest>false</matchRequest>
<matchResponse>false</matchResponse>
<newHeader/>
<newValue/>
<newHeaderRegex>false</newHeaderRegex>
<newValueRegex>false</newValueRegex>
<matchWholeValue>false</matchWholeValue>
<caseSensitive>false</caseSensitive>
<replaceType>2</replaceType>
</rewriteRule>
<rewriteRule>
<active>false</active>
<ruleType>10</ruleType>
<matchHeader/>
<matchValue/>
<matchHeaderRegex>false</matchHeaderRegex>
<matchValueRegex>false</matchValueRegex>
<matchRequest>false</matchRequest>
<matchResponse>false</matchResponse>
<newHeaderRegex>false</newHeaderRegex>
<newValueRegex>false</newValueRegex>
<matchWholeValue>false</matchWholeValue>
<caseSensitive>false</caseSensitive>
<replaceType>2</replaceType>
</rewriteRule>
<rewriteRule>
<active>false</active>
<ruleType>1</ruleType>
<matchHeader/>
<matchValue/>
<matchHeaderRegex>false</matchHeaderRegex>
<matchValueRegex>false</matchValueRegex>
<matchRequest>true</matchRequest>
<matchResponse>false</matchResponse>
<newHeader/>
<newValue/>
<newHeaderRegex>false</newHeaderRegex>
<newValueRegex>false</newValueRegex>
<matchWholeValue>false</matchWholeValue>
<caseSensitive>false</caseSensitive>
<replaceType>2</replaceType>
</rewriteRule>
<rewriteRule>
<active>true</active>
<ruleType>1</ruleType>
<matchHeader/>
<matchValue/>
<matchHeaderRegex>false</matchHeaderRegex>
<matchValueRegex>false</matchValueRegex>
<matchRequest>true</matchRequest>
<matchResponse>false</matchResponse>
<newHeader>test</newHeader>
<newValue>test</newValue>
<newHeaderRegex>false</newHeaderRegex>
<newValueRegex>false</newValueRegex>
<matchWholeValue>false</matchWholeValue>
<caseSensitive>false</caseSensitive>
<replaceType>2</replaceType>
</rewriteRule>
</rules>
</rewriteSet>
<rewriteSet>
<active>true</active>
<name>amazon </name>
<hosts>
<locationPatterns>
<locationMatch>
<location>
<protocol>https</protocol>
<host>www.amazon.com</host>
</location>
<enabled>true</enabled>
</locationMatch>
<locationMatch>
<location>
<protocol>https</protocol>
<host>myntra.com</host>
<port>443</port>
<path>/</path>
<query>q=10</query>
</location>
<enabled>true</enabled>
</locationMatch>
</locationPatterns>
</hosts>
<rules>
<rewriteRule>
<active>true</active>
<ruleType>1</ruleType>
<matchHeader>x-rq-test</matchHeader>
<matchValue>x-rq-value</matchValue>
<matchHeaderRegex>false</matchHeaderRegex>
<matchValueRegex>false</matchValueRegex>
<matchRequest>true</matchRequest>
<matchResponse>true</matchResponse>
<newHeader/>
<newValue/>
<newHeaderRegex>false</newHeaderRegex>
<newValueRegex>false</newValueRegex>
<matchWholeValue>false</matchWholeValue>
<caseSensitive>false</caseSensitive>
<replaceType>2</replaceType>
</rewriteRule>
<rewriteRule>
<active>true</active>
<ruleType>3</ruleType>
<matchHeader>server</matchHeader>
<matchValue>Server</matchValue>
<matchHeaderRegex>false</matchHeaderRegex>
<matchValueRegex>false</matchValueRegex>
<matchRequest>true</matchRequest>
<matchResponse>true</matchResponse>
<newHeader>Custom-Server</newHeader>
<newValue>google</newValue>
<newHeaderRegex>false</newHeaderRegex>
<newValueRegex>false</newValueRegex>
<matchWholeValue>false</matchWholeValue>
<caseSensitive>false</caseSensitive>
<replaceType>2</replaceType>
</rewriteRule>
<rewriteRule>
<active>false</active>
<ruleType>2</ruleType>
<matchHeader>cache-control</matchHeader>
<matchValue>no-cache</matchValue>
<matchHeaderRegex>false</matchHeaderRegex>
<matchValueRegex>false</matchValueRegex>
<matchRequest>true</matchRequest>
<matchResponse>true</matchResponse>
<newHeaderRegex>false</newHeaderRegex>
<newValueRegex>false</newValueRegex>
<matchWholeValue>false</matchWholeValue>
<caseSensitive>false</caseSensitive>
<replaceType>2</replaceType>
</rewriteRule>
<rewriteRule>
<active>false</active>
<ruleType>4</ruleType>
<matchValue/>
<matchHeaderRegex>false</matchHeaderRegex>
<matchValueRegex>false</matchValueRegex>
<matchRequest>false</matchRequest>
<matchResponse>false</matchResponse>
<newValue>http://localhost:3000</newValue>
<newHeaderRegex>false</newHeaderRegex>
<newValueRegex>false</newValueRegex>
<matchWholeValue>false</matchWholeValue>
<caseSensitive>false</caseSensitive>
<replaceType>2</replaceType>
</rewriteRule>
<rewriteRule>
<active>false</active>
<ruleType>5</ruleType>
<matchValue>/iphone</matchValue>
<matchHeaderRegex>false</matchHeaderRegex>
<matchValueRegex>false</matchValueRegex>
<matchRequest>false</matchRequest>
<matchResponse>false</matchResponse>
<newValue>/registries</newValue>
<newHeaderRegex>false</newHeaderRegex>
<newValueRegex>false</newValueRegex>
<matchWholeValue>true</matchWholeValue>
<caseSensitive>false</caseSensitive>
<replaceType>2</replaceType>
</rewriteRule>
<rewriteRule>
<active>true</active>
<ruleType>6</ruleType>
<matchValue>https://www.amazon.com/</matchValue>
<matchHeaderRegex>false</matchHeaderRegex>
<matchValueRegex>false</matchValueRegex>
<matchRequest>false</matchRequest>
<matchResponse>false</matchResponse>
<newValue>https://www.flipkart.com/</newValue>
<newHeaderRegex>false</newHeaderRegex>
<newValueRegex>false</newValueRegex>
<matchWholeValue>false</matchWholeValue>
<caseSensitive>false</caseSensitive>
<replaceType>2</replaceType>
</rewriteRule>
<rewriteRule>
<active>false</active>
<ruleType>8</ruleType>
<matchHeader/>
<matchValue/>
<matchHeaderRegex>false</matchHeaderRegex>
<matchValueRegex>false</matchValueRegex>
<matchRequest>false</matchRequest>
<matchResponse>false</matchResponse>
<newHeader>k</newHeader>
<newValue>laptop</newValue>
<newHeaderRegex>false</newHeaderRegex>
<newValueRegex>false</newValueRegex>
<matchWholeValue>false</matchWholeValue>
<caseSensitive>false</caseSensitive>
<replaceType>2</replaceType>
</rewriteRule>
<rewriteRule>
<active>false</active>
<ruleType>9</ruleType>
<matchHeader/>
<matchValue/>
<matchHeaderRegex>false</matchHeaderRegex>
<matchValueRegex>false</matchValueRegex>
<matchRequest>false</matchRequest>
<matchResponse>false</matchResponse>
<newHeader>k</newHeader>
<newValue>iphone</newValue>
<newHeaderRegex>false</newHeaderRegex>
<newValueRegex>false</newValueRegex>
<matchWholeValue>false</matchWholeValue>
<caseSensitive>false</caseSensitive>
<replaceType>2</replaceType>
</rewriteRule>
<rewriteRule>
<active>false</active>
<ruleType>10</ruleType>
<matchHeader>k</matchHeader>
<matchValue>iphone</matchValue>
<matchHeaderRegex>false</matchHeaderRegex>
<matchValueRegex>false</matchValueRegex>
<matchRequest>false</matchRequest>
<matchResponse>false</matchResponse>
<newHeaderRegex>false</newHeaderRegex>
<newValueRegex>false</newValueRegex>
<matchWholeValue>false</matchWholeValue>
<caseSensitive>false</caseSensitive>
<replaceType>2</replaceType>
</rewriteRule>
<rewriteRule>
<active>false</active>
<ruleType>11</ruleType>
<matchValue>200</matchValue>
<matchHeaderRegex>false</matchHeaderRegex>
<matchValueRegex>false</matchValueRegex>
<matchRequest>false</matchRequest>
<matchResponse>false</matchResponse>
<newValue>300</newValue>
<newHeaderRegex>false</newHeaderRegex>
<newValueRegex>false</newValueRegex>
<matchWholeValue>false</matchWholeValue>
<caseSensitive>false</caseSensitive>
<replaceType>2</replaceType>
</rewriteRule>
<rewriteRule>
<active>true</active>
<ruleType>7</ruleType>
<matchValue>Today's Deals</matchValue>
<matchHeaderRegex>false</matchHeaderRegex>
<matchValueRegex>true</matchValueRegex>
<matchRequest>false</matchRequest>
<matchResponse>true</matchResponse>
<newValue>Tommorow's Deals</newValue>
<newHeaderRegex>false</newHeaderRegex>
<newValueRegex>false</newValueRegex>
<matchWholeValue>false</matchWholeValue>
<caseSensitive>false</caseSensitive>
<replaceType>2</replaceType>
</rewriteRule>
</rules>
</rewriteSet>
</sets>
</rewrite>
</entry>
<entry>
<string>Block List</string>
<blacklist>
<locations>
<locationPatterns>
<locationMatch>
<location>
<protocol>https</protocol>
<host>www.flipkart.com</host>
</location>
<enabled>true</enabled>
</locationMatch>
<locationMatch>
<location>
<protocol>https</protocol>
<host>developer.mozilla.org</host>
<path>/en-US/</path>
</location>
<enabled>true</enabled>
</locationMatch>
</locationPatterns>
</locations>
<toolEnabled>false</toolEnabled>
<useSelectedLocations>false</useSelectedLocations>
<action>0</action>
</blacklist>
</entry>
<entry>
<string>Map Local</string>
<mapLocal>
<toolEnabled>false</toolEnabled>
<mappings>
<mapLocalMapping>
<sourceLocation>
<protocol>https</protocol>
<host>www.amazon.sg</host>
<port>443</port>
<path>/gp/bestsellers</path>
<query>ref_=nav_cs_bestsellers</query>
</sourceLocation>
<dest>/Users/rohanmathur/Downloads/bestsellers.html</dest>
<enabled>true</enabled>
<caseSensitive>true</caseSensitive>
</mapLocalMapping>
</mappings>
</mapLocal>
</entry>
<entry>
<string>Map Remote</string>
<map>
<toolEnabled>false</toolEnabled>
<mappings>
<mapMapping>
<sourceLocation>
<protocol>https</protocol>
<host>www.amazon.com</host>
<path>/</path>
</sourceLocation>
<destLocation>
<protocol>https</protocol>
<host>www.flipkart.com</host>
<path>/</path>
</destLocation>
<preserveHostHeader>false</preserveHostHeader>
<enabled>false</enabled>
</mapMapping>
<mapMapping>
<sourceLocation>
<protocol>https</protocol>
<host>www.myntra.com</host>
<path>/</path>
</sourceLocation>
<destLocation>
<protocol>https</protocol>
<host>www.youtube.com</host>
<path>/</path>
</destLocation>
<preserveHostHeader>false</preserveHostHeader>
<enabled>false</enabled>
</mapMapping>
<mapMapping>
<sourceLocation>
<protocol>https</protocol>
<host>www.amazon.com</host>
<path>/</path>
</sourceLocation>
<destLocation>
<protocol>http</protocol>
<host>localhost</host>
<port>3000</port>
<path>/rules/my-rules</path>
</destLocation>
<preserveHostHeader>false</preserveHostHeader>
<enabled>false</enabled>
</mapMapping>
<mapMapping>
<sourceLocation>
<protocol>https</protocol>
<host>github.com</host>
<port>443</port>
</sourceLocation>
<destLocation>
<protocol>https</protocol>
<host>myntra.com</host>
<port>443</port>
</destLocation>
<preserveHostHeader>false</preserveHostHeader>
<enabled>true</enabled>
</mapMapping>
</mappings>
</map>
</entry>
<entry>
<string>No Caching</string>
<selectedHostsTool>
<locations>
<locationPatterns>
<locationMatch>
<location>
<protocol>https</protocol>
<host>www.flipkart.com</host>
</location>
<enabled>true</enabled>
</locationMatch>
<locationMatch>
<location>
<protocol>https</protocol>
<host>github.com</host>
<port>443</port>
</location>
<enabled>true</enabled>
</locationMatch>
</locationPatterns>
</locations>
<toolEnabled>false</toolEnabled>
<useSelectedLocations>true</useSelectedLocations>
</selectedHostsTool>
</entry>
<entry>
<string>Block Cookies</string>
<selectedHostsTool>
<locations>
<locationPatterns>
<locationMatch>
<location>
<protocol>https</protocol>
<host>www.flipkart.com</host>
<path>/</path>
</location>
<enabled>false</enabled>
</locationMatch>
</locationPatterns>
</locations>
<toolEnabled>true</toolEnabled>
<useSelectedLocations>true</useSelectedLocations>
</selectedHostsTool>
</entry>
</configs>
</toolConfiguration>
</charles-export>`;

const App = () => {
  const location = useLocation();

  getXmlToJs(oneTimeExportedData).catch((err) => console.log(`from effect::`, err));

  useEffect(() => {
    // Load features asynchronously when the app renders
    growthbook.loadFeatures({ autoRefresh: true });
  }, []);

  useGeoLocation();

  submitAppDetailAttributes();

  if (!isEmpty(window.location.hash)) {
    //Support legacy URL formats
    const hashURL = window.location.hash.split("/");
    const hashType = hashURL[0];
    const hashPath = hashURL[1];

    switch (hashType) {
      case PATHS.HASH.SHARED_LISTS:
        window.location.assign(PATHS.SHARED_LISTS.VIEWER.ABSOLUTE + "/" + hashPath);
        break;
      case PATHS.HASH.RULE_EDITOR:
        window.location.replace(PATHS.RULE_EDITOR.EDIT_RULE.ABSOLUTE + "/" + hashPath);
        break;

      default:
        break;
    }
  }

  return (
    <>
      <AuthHandler />
      <PreLoadRemover />
      <AppModeInitializer />
      <DBListeners />
      <RuleExecutionsSyncer />
      <FeatureUsageEvent />
      <ActiveWorkspace />
      <ThirdPartyIntegrationsHandler />

      <ConfigProvider locale={enUS}>
        <GrowthBookProvider growthbook={growthbook}>
          <LocalUserAttributesHelperComponent />
          <div
            id="requestly-dashboard-layout"
            style={{
              height: "100vh",
            }}
          >
            <CommandBar />
            {"/" + location.pathname.split("/")[1] === PATHS.LANDING ? (
              <FullScreenLayout />
            ) : (
              <>
                <UpdateDialog />
                <DashboardLayout />
              </>
            )}
          </div>
        </GrowthBookProvider>
      </ConfigProvider>
    </>
  );
};

export default App;
