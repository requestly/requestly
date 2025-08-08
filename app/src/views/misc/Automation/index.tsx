import { SiSelenium } from "@react-icons/all-files/si/SiSelenium";
import { useLocation } from "react-router-dom";
import { AutomationTemplate } from "./components/AutomationTemplate";
import { useImportedRules } from "./utils/headerModificationHandler";
import LINKS from "config/constants/sub/links";

export const AutomationPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryParamEntries = Array.from(searchParams.entries());
  const dataSource = queryParamEntries.map(([key, value]) => ({ key, value }));
  const hasApiKey = searchParams.has("api-key");
  const apiKey = dataSource.find((item) => item.key === "api-key")?.value || "";
  const { isLoading, success, error } = useImportedRules(apiKey);

  return (
    <AutomationTemplate
      title="Requestly for Automation"
      description={
        <>
          Include your <code>API key</code> in the query parameters to automatically fetch and apply rules from your
          Requestly account using the automation extension
        </>
      }
      queryParams={dataSource}
      successMsg="Rules have been successfully imported and applied to the Requestly extension."
      showTitleIcon={<SiSelenium className="new-page-title-icon" />}
      hasApiKey={hasApiKey}
      apiKeyQueryParam="api-key"
      getApiKeyUrl={LINKS.API_KEY_FORM}
      isLoading={isLoading}
      success={success}
      error={error}
    />
  );
};

export default AutomationPage;
